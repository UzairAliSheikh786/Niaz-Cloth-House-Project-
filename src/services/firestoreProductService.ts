import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, ProductSummary, ProductReview } from '../types';

const DETAIL_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const QUERY_CACHE_TTL_MS = 2 * 60 * 1000;  // 2 minutes
const MAX_DETAIL_CACHE_ENTRIES = 100;
const MAX_QUERY_CACHE_ENTRIES = 60;

export interface ShopSummaryQueryParams {
  pageSize?: number;
  cursor?: QueryDocumentSnapshot<DocumentData> | null;
  cursorId?: string;
  collectionName?: 'productSummaries' | 'products';
  gender?: string;
  fabric?: string;
  inStockOnly?: boolean;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  forceRefresh?: boolean;
}

export interface ShopSummaryPageResult {
  items: ProductSummary[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
  fromCache: boolean;
  sourceCollection: 'productSummaries' | 'products' | 'local';
}

export interface ProductReviewsPageResult {
  items: ProductReview[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
  fromCache: boolean;
}

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

// ========================================================================= //
// IN-MEMORY MEMOIZATION CACHES & IN-FLIGHT REQUEST DEDUPLICATION            //
// ========================================================================= //

const productDetailCache = new Map<string, CacheEntry<Product>>();
const slugToIdCache = new Map<string, string>();
const inFlightDetailReads = new Map<string, Promise<Product | null>>();

const shopPageCache = new Map<string, CacheEntry<Omit<ShopSummaryPageResult, 'fromCache'>>>();
const inFlightShopQueries = new Map<string, Promise<ShopSummaryPageResult>>();

const relatedProductsCache = new Map<string, CacheEntry<ProductSummary[]>>();
const inFlightRelatedQueries = new Map<string, Promise<ProductSummary[]>>();

const reviewsPageCache = new Map<string, CacheEntry<Omit<ProductReviewsPageResult, 'fromCache'>>>();
const inFlightReviewQueries = new Map<string, Promise<ProductReviewsPageResult>>();

let cacheHitCount = 0;
let cacheMissCount = 0;

function isFresh(fetchedAt: number, ttlMs: number): boolean {
  return Date.now() - fetchedAt < ttlMs;
}

function pruneMapIfNeeded<K, V>(map: Map<K, V>, maxSize: number) {
  if (map.size <= maxSize) return;
  const oldestKey = map.keys().next().value;
  if (oldestKey !== undefined) {
    map.delete(oldestKey);
  }
}

/**
 * Projects a full Product document into a minimal ProductSummary containing only
 * fields required by Shop grid cards, search rows, and related items.
 */
export function projectProductSummary(product: Product): ProductSummary {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    subtitle: product.subtitle,
    gender: product.gender,
    ...(product.brand ? { brand: product.brand } : {}),
    ...(product.craftType ? { craftType: product.craftType } : {}),
    fabric: product.fabric,
    collection: product.collection,
    ...(product.season ? { season: product.season } : {}),
    price: product.price,
    ...(typeof product.originalPrice === 'number' ? { originalPrice: product.originalPrice } : {}),
    inStock: Boolean(product.inStock),
    featured: Boolean(product.featured),
    newArrival: Boolean(product.newArrival),
    rating: Number(product.rating ?? 5),
    reviewsCount: Number(product.reviewsCount ?? 0),
    primaryImage: product.primaryImage,
    color: product.color,
    colorHex: product.colorHex,
    ...(product.weightGrade ? { weightGrade: product.weightGrade } : {}),
    cutDetails: {
      length: product.cutDetails?.length || '',
      width: product.cutDetails?.width || '',
    },
  };
}

function rawDocToSummary(id: string, data: Record<string, any>): ProductSummary {
  return {
    id: String(data.id || id),
    title: String(data.title || ''),
    slug: String(data.slug || id),
    subtitle: String(data.subtitle || ''),
    gender: (data.gender as ProductSummary['gender']) || 'Women',
    ...(data.brand ? { brand: String(data.brand) } : {}),
    ...(data.craftType ? { craftType: data.craftType } : {}),
    fabric: data.fabric || 'Cotton',
    collection: String(data.collection || 'Heritage Archive'),
    ...(data.season ? { season: data.season } : {}),
    price: Number(data.price || 0),
    ...(typeof data.originalPrice === 'number' ? { originalPrice: data.originalPrice } : {}),
    inStock: data.inStock !== false,
    featured: Boolean(data.featured),
    newArrival: Boolean(data.newArrival),
    rating: Number(data.rating ?? 5),
    reviewsCount: Number(data.reviewsCount ?? 0),
    primaryImage: String(data.primaryImage || '/images/hero_niaz_luxury_fabric_1791569218384.jpg'),
    color: String(data.color || ''),
    colorHex: String(data.colorHex || '#111111'),
    ...(data.weightGrade ? { weightGrade: String(data.weightGrade) } : {}),
    cutDetails: {
      length: String(data.cutDetails?.length || ''),
      width: String(data.cutDetails?.width || ''),
    },
  };
}

function serializeShopQueryKey(params: ShopSummaryQueryParams): string {
  return [
    params.collectionName || 'auto',
    params.gender || 'All',
    params.fabric || 'All',
    params.inStockOnly ? '1' : '0',
    params.sortBy || 'featured',
    params.pageSize || 12,
    params.cursor?.id || params.cursorId || 'start',
  ].join('|');
}

function buildIndexedShopConstraints(params: ShopSummaryQueryParams): QueryConstraint[] {
  const pageSize = Math.max(1, Math.min(params.pageSize ?? 12, 48));
  const constraints: QueryConstraint[] = [];

  // Keep Firestore equality + orderBy pairs strictly aligned with firestore.indexes.json composite indexes:
  // - (gender ASC, price ASC/DESC)
  // - (fabric ASC, price ASC)
  // - (inStock ASC, price ASC)
  if (params.gender && params.gender !== 'All') {
    constraints.push(where('gender', '==', params.gender));
  } else if (params.fabric && params.fabric !== 'All') {
    constraints.push(where('fabric', '==', params.fabric));
  } else if (params.inStockOnly) {
    constraints.push(where('inStock', '==', true));
  }

  if (params.sortBy === 'price-desc' && (!params.fabric || params.fabric === 'All') && !params.inStockOnly) {
    constraints.push(orderBy('price', 'desc'));
  } else {
    constraints.push(orderBy('price', 'asc'));
  }

  if (params.cursor) {
    constraints.push(startAfter(params.cursor));
  }

  // +1 lookahead avoids an extra aggregation count() query
  constraints.push(limit(pageSize + 1));
  return constraints;
}

// ========================================================================= //
// 1. PAGINATED SHOP SUMMARY QUERY (WITH MEMOIZATION & FALLBACK)             //
// ========================================================================= //

export async function fetchProductSummariesPage(
  params: ShopSummaryQueryParams
): Promise<ShopSummaryPageResult> {
  const pageSize = Math.max(1, Math.min(params.pageSize ?? 12, 48));
  const cacheKey = serializeShopQueryKey(params);

  if (!params.forceRefresh) {
    const cached = shopPageCache.get(cacheKey);
    if (cached && isFresh(cached.fetchedAt, QUERY_CACHE_TTL_MS)) {
      cacheHitCount++;
      return { ...cached.data, fromCache: true };
    }
  }

  const existingInFlight = inFlightShopQueries.get(cacheKey);
  if (existingInFlight) {
    return existingInFlight;
  }

  cacheMissCount++;
  const promise = (async (): Promise<ShopSummaryPageResult> => {
    const constraints = buildIndexedShopConstraints(params);

    try {
      let sourceCollection: 'productSummaries' | 'products' = params.collectionName || 'productSummaries';
      let snap = await getDocs(query(collection(db, sourceCollection), ...constraints));

      // Fallback to /products only if slim /productSummaries docs haven't been seeded yet,
      // and immediately project documents down to slim ProductSummary shape.
      if (snap.empty && !params.cursor && sourceCollection === 'productSummaries') {
        sourceCollection = 'products';
        snap = await getDocs(query(collection(db, 'products'), ...constraints));
      }

      const docs = snap.docs;
      const hasMore = docs.length > pageSize;
      const slicedDocs = hasMore ? docs.slice(0, pageSize) : docs;
      const lastDoc = slicedDocs.length > 0 ? slicedDocs[slicedDocs.length - 1] : null;
      const items = slicedDocs.map((d) => rawDocToSummary(d.id, d.data()));

      const payload: Omit<ShopSummaryPageResult, 'fromCache'> = {
        items,
        lastDoc,
        hasMore,
        sourceCollection,
      };

      pruneMapIfNeeded(shopPageCache, MAX_QUERY_CACHE_ENTRIES);
      shopPageCache.set(cacheKey, { data: payload, fetchedAt: Date.now() });

      return { ...payload, fromCache: false };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'productSummaries');
      return {
        items: [],
        lastDoc: null,
        hasMore: false,
        fromCache: false,
        sourceCollection: 'local',
      };
    } finally {
      inFlightShopQueries.delete(cacheKey);
    }
  })();

  inFlightShopQueries.set(cacheKey, promise);
  return promise;
}

// ========================================================================= //
// 2. SINGLE PRODUCT DETAIL MEMOIZED FETCH (TARGETED getDoc / SLUG LIMIT 1)  //
// ========================================================================= //

export function getCachedProductDetail(idOrSlug: string): Product | null {
  if (!idOrSlug) return null;
  const resolvedId = slugToIdCache.get(idOrSlug) || idOrSlug;
  const entry = productDetailCache.get(resolvedId);
  if (entry && isFresh(entry.fetchedAt, DETAIL_CACHE_TTL_MS)) {
    return entry.data;
  }
  return null;
}

export function primeProductDetailCache(product: Product): void {
  if (!product?.id) return;
  pruneMapIfNeeded(productDetailCache, MAX_DETAIL_CACHE_ENTRIES);
  productDetailCache.set(product.id, { data: product, fetchedAt: Date.now() });
  if (product.slug) {
    slugToIdCache.set(product.slug, product.id);
  }
}

export async function fetchProductByIdMemoized(
  idOrSlug: string,
  fallbackProduct?: Product | null
): Promise<{ product: Product | null; fromCache: boolean }> {
  if (!idOrSlug) {
    return { product: fallbackProduct ?? null, fromCache: false };
  }

  const cached = getCachedProductDetail(idOrSlug);
  if (cached) {
    cacheHitCount++;
    return { product: cached, fromCache: true };
  }

  const inFlight = inFlightDetailReads.get(idOrSlug);
  if (inFlight) {
    const resolved = await inFlight;
    return { product: resolved ?? fallbackProduct ?? null, fromCache: false };
  }

  cacheMissCount++;
  const promise = (async (): Promise<Product | null> => {
    try {
      // Primary path: direct single-document read by ID (1 read unit)
      const directRef = doc(db, 'products', idOrSlug);
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        const fetched = { id: directSnap.id, ...(directSnap.data() as Omit<Product, 'id'>) } as Product;
        primeProductDetailCache(fetched);
        return fetched;
      }

      // Secondary path: bounded limit(1) lookup if caller passed a URL slug instead of document ID
      const slugQuery = query(collection(db, 'products'), where('slug', '==', idOrSlug), limit(1));
      const slugSnap = await getDocs(slugQuery);
      if (!slugSnap.empty) {
        const first = slugSnap.docs[0];
        const fetched = { id: first.id, ...(first.data() as Omit<Product, 'id'>) } as Product;
        primeProductDetailCache(fetched);
        return fetched;
      }

      // Fallback memoization so repeat navigation doesn't re-hit Firestore for local-only SKUs
      if (fallbackProduct) {
        primeProductDetailCache(fallbackProduct);
        return fallbackProduct;
      }

      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `products/${idOrSlug}`);
      if (fallbackProduct) {
        primeProductDetailCache(fallbackProduct);
        return fallbackProduct;
      }
      return null;
    } finally {
      inFlightDetailReads.delete(idOrSlug);
    }
  })();

  inFlightDetailReads.set(idOrSlug, promise);
  const result = await promise;
  return { product: result ?? fallbackProduct ?? null, fromCache: false };
}

// ========================================================================= //
// 3. BOUNDED & MEMOIZED RELATED PRODUCTS QUERY                              //
// ========================================================================= //

export async function fetchRelatedProductsMemoized(
  currentProduct: Pick<Product, 'id' | 'gender' | 'fabric'>,
  fallbackCatalog: Product[],
  maxItems = 3
): Promise<ProductSummary[]> {
  const cacheKey = `${currentProduct.id}|${currentProduct.gender}|${currentProduct.fabric}|${maxItems}`;
  const cached = relatedProductsCache.get(cacheKey);
  if (cached && isFresh(cached.fetchedAt, DETAIL_CACHE_TTL_MS)) {
    cacheHitCount++;
    return cached.data;
  }

  const inFlight = inFlightRelatedQueries.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  cacheMissCount++;
  const promise = (async (): Promise<ProductSummary[]> => {
    try {
      const fetchLimit = maxItems + 2;
      let snap = await getDocs(
        query(
          collection(db, 'productSummaries'),
          where('gender', '==', currentProduct.gender),
          limit(fetchLimit)
        )
      );

      if (snap.empty) {
        snap = await getDocs(
          query(
            collection(db, 'products'),
            where('gender', '==', currentProduct.gender),
            limit(fetchLimit)
          )
        );
      }

      const remoteRelated = snap.docs
        .map((d) => rawDocToSummary(d.id, d.data()))
        .filter((p) => p.id !== currentProduct.id);

      let combined: ProductSummary[];
      if (remoteRelated.length >= maxItems) {
        combined = remoteRelated.slice(0, maxItems);
      } else {
        const seen = new Set(remoteRelated.map((p) => p.id));
        const localFallback = fallbackCatalog
          .filter(
            (p) =>
              p.id !== currentProduct.id &&
              !seen.has(p.id) &&
              (p.gender === currentProduct.gender || p.fabric === currentProduct.fabric)
          )
          .slice(0, maxItems - remoteRelated.length)
          .map(projectProductSummary);
        combined = [...remoteRelated, ...localFallback];
      }

      pruneMapIfNeeded(relatedProductsCache, MAX_QUERY_CACHE_ENTRIES);
      relatedProductsCache.set(cacheKey, { data: combined, fetchedAt: Date.now() });
      return combined;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'productSummaries');
      const localOnly = fallbackCatalog
        .filter(
          (p) =>
            p.id !== currentProduct.id &&
            (p.gender === currentProduct.gender || p.fabric === currentProduct.fabric)
        )
        .slice(0, maxItems)
        .map(projectProductSummary);
      relatedProductsCache.set(cacheKey, { data: localOnly, fetchedAt: Date.now() });
      return localOnly;
    } finally {
      inFlightRelatedQueries.delete(cacheKey);
    }
  })();

  inFlightRelatedQueries.set(cacheKey, promise);
  return promise;
}

// ========================================================================= //
// 4. PAGINATED & MEMOIZED PER-PRODUCT REVIEWS QUERY                         //
// ========================================================================= //

export async function fetchProductReviewsPage(
  productId: string,
  pageSize = 6,
  cursor: QueryDocumentSnapshot<DocumentData> | null = null,
  forceRefresh = false
): Promise<ProductReviewsPageResult> {
  const safeLimit = Math.max(1, Math.min(pageSize, 25));
  const cacheKey = `${productId}|${safeLimit}|${cursor?.id || 'start'}`;

  if (!forceRefresh) {
    const cached = reviewsPageCache.get(cacheKey);
    if (cached && isFresh(cached.fetchedAt, QUERY_CACHE_TTL_MS)) {
      cacheHitCount++;
      return { ...cached.data, fromCache: true };
    }
  }

  const inFlight = inFlightReviewQueries.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  cacheMissCount++;
  const promise = (async (): Promise<ProductReviewsPageResult> => {
    try {
      const constraints: QueryConstraint[] = [
        where('productId', '==', productId),
        orderBy('createdAt', 'desc'),
      ];
      if (cursor) {
        constraints.push(startAfter(cursor));
      }
      constraints.push(limit(safeLimit + 1));

      const snap = await getDocs(query(collection(db, 'reviews'), ...constraints));
      const docs = snap.docs;
      const hasMore = docs.length > safeLimit;
      const sliced = hasMore ? docs.slice(0, safeLimit) : docs;
      const lastDoc = sliced.length > 0 ? sliced[sliced.length - 1] : null;
      const items = sliced.map((d) => ({
        ...(d.data() as ProductReview),
        id: d.id,
      }));

      const payload: Omit<ProductReviewsPageResult, 'fromCache'> = {
        items,
        lastDoc,
        hasMore,
      };
      pruneMapIfNeeded(reviewsPageCache, MAX_QUERY_CACHE_ENTRIES);
      reviewsPageCache.set(cacheKey, { data: payload, fetchedAt: Date.now() });

      return { ...payload, fromCache: false };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'reviews');
      return { items: [], lastDoc: null, hasMore: false, fromCache: false };
    } finally {
      inFlightReviewQueries.delete(cacheKey);
    }
  })();

  inFlightReviewQueries.set(cacheKey, promise);
  return promise;
}

// ========================================================================= //
// 5. CACHE INVALIDATION & DIAGNOSTICS                                       //
// ========================================================================= //

export function invalidateProductCaches(productId?: string): void {
  if (productId) {
    productDetailCache.delete(productId);
    for (const [slug, id] of slugToIdCache.entries()) {
      if (id === productId) slugToIdCache.delete(slug);
    }
    for (const key of relatedProductsCache.keys()) {
      if (key.startsWith(`${productId}|`)) relatedProductsCache.delete(key);
    }
  } else {
    productDetailCache.clear();
    slugToIdCache.clear();
    relatedProductsCache.clear();
  }
  shopPageCache.clear();
}

export function invalidateProductReviewCache(productId: string): void {
  for (const key of reviewsPageCache.keys()) {
    if (key.startsWith(`${productId}|`)) {
      reviewsPageCache.delete(key);
    }
  }
}

export function getProductCacheStats() {
  return {
    detailEntries: productDetailCache.size,
    shopPageEntries: shopPageCache.size,
    relatedEntries: relatedProductsCache.size,
    reviewPageEntries: reviewsPageCache.size,
    hits: cacheHitCount,
    misses: cacheMissCount,
  };
}

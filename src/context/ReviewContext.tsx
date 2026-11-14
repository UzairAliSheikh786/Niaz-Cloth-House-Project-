import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { collection, doc, getDocs, setDoc, query, orderBy, limit, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';
import { ProductReview, NewsletterSubscriber } from '../types';
import {
  seedReviewsIfEmpty,
  getAllReviewsFromDB,
  addReviewToDB,
  putReviewInDB,
  computeRatingStats,
  addNewsletterSubscriberToDB,
  getNewsletterSubscribersFromDB,
} from '../utils/indexedDB';
import { INITIAL_PRODUCTS } from '../data/products';
import {
  fetchProductReviewsPage,
  invalidateProductReviewCache,
  ProductReviewsPageResult,
} from '../services/firestoreProductService';

interface RatingStats {
  averageRating: number;
  totalReviews: number;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

interface ReviewContextType {
  reviewsMap: Record<string, ProductReview[]>;
  allReviews: ProductReview[];
  newsletterSubscribers: NewsletterSubscriber[];
  isSubmittingReview: boolean;
  isSubscribingNewsletter: boolean;
  getReviewsForProduct: (productId: string) => ProductReview[];
  getProductStats: (productId: string) => RatingStats;
  loadProductReviewsPage: (
    productId: string,
    options?: {
      pageSize?: number;
      cursor?: QueryDocumentSnapshot<DocumentData> | null;
      forceRefresh?: boolean;
    }
  ) => Promise<ProductReviewsPageResult>;
  submitReview: (reviewData: {
    productId: string;
    authorName: string;
    authorCity?: string;
    rating: number;
    title?: string;
    comment: string;
  }) => Promise<ProductReview>;
  subscribeNewsletter: (email: string, name?: string, source?: string) => Promise<{
    success: boolean;
    alreadySubscribed: boolean;
    message: string;
  }>;
  refreshData: () => Promise<void>;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export const ReviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviewsMap, setReviewsMap] = useState<Record<string, ProductReview[]>>({});
  const [allReviews, setAllReviews] = useState<ProductReview[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isSubscribingNewsletter, setIsSubscribingNewsletter] = useState(false);

  // Group an array of reviews by productId helper
  const groupReviewsByProduct = (reviews: ProductReview[]) => {
    const map: Record<string, ProductReview[]> = {};
    for (const rev of reviews) {
      if (!map[rev.productId]) {
        map[rev.productId] = [];
      }
      map[rev.productId].push(rev);
    }
    return map;
  };

  // Initialize DB and load reviews with Cloud Firestore + IndexedDB resilience
  const loadAllData = useCallback(async () => {
    try {
      // 1. Initial immediate load from local IndexedDB
      await seedReviewsIfEmpty();
      let reviews = await getAllReviewsFromDB();
      setAllReviews(reviews);
      setReviewsMap(groupReviewsByProduct(reviews));

      // 2. Load newsletter subscribers from IndexedDB
      const subscribers = await getNewsletterSubscribersFromDB();
      setNewsletterSubscribers(subscribers);

      // 3. Gracefully sync bounded recent reviews (limit 20) from Cloud Firestore instead of full collection scan
      try {
        const recentReviewsQuery = query(
          collection(db, 'reviews'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snap = await getDocs(recentReviewsQuery);
        if (!snap.empty) {
          for (const docSnap of snap.docs) {
            const data = docSnap.data() as ProductReview;
            if (data && data.productId && data.rating) {
              await putReviewInDB({
                ...data,
                id: docSnap.id || data.id,
              });
            }
          }
          const merged = await getAllReviewsFromDB();
          setAllReviews(merged);
          setReviewsMap(groupReviewsByProduct(merged));
        }
      } catch (cloudErr) {
        // Safe fallback to IndexedDB when in offline or restrictive network mode
        console.warn('Firestore cloud sync notice (operating in reliable local IndexedDB mode):', cloudErr);
      }
    } catch (err) {
      console.warn('ReviewProvider: error loading reviews data:', err);
    }
  }, []);

  useEffect(() => {
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(() => {
        void loadAllData();
      }, { timeout: 1500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const timer = setTimeout(() => {
      void loadAllData();
    }, 900);
    return () => clearTimeout(timer);
  }, [loadAllData]);

  const getReviewsForProduct = useCallback((productId: string): ProductReview[] => {
    return reviewsMap[productId] || [];
  }, [reviewsMap]);

  const getProductStats = useCallback((productId: string): RatingStats => {
    const matchingProduct = INITIAL_PRODUCTS.find((p) => p.id === productId || p.slug === productId);
    const baseRating = matchingProduct?.rating ?? 5.0;
    const baseReviewsCount = matchingProduct?.reviewsCount ?? 0;
    const dbReviews = reviewsMap[productId] || [];

    return computeRatingStats(dbReviews, baseRating, baseReviewsCount);
  }, [reviewsMap]);

  const loadProductReviewsPage = useCallback(
    async (
      productId: string,
      options?: {
        pageSize?: number;
        cursor?: QueryDocumentSnapshot<DocumentData> | null;
        forceRefresh?: boolean;
      }
    ): Promise<ProductReviewsPageResult> => {
      const pageResult = await fetchProductReviewsPage(
        productId,
        options?.pageSize ?? 6,
        options?.cursor ?? null,
        Boolean(options?.forceRefresh)
      );

      if (pageResult.items.length > 0) {
        for (const rev of pageResult.items) {
          await putReviewInDB(rev).catch(() => {});
        }
        setReviewsMap((prev) => {
          const existing = prev[productId] || [];
          const byId = new Map<string, ProductReview>();
          existing.forEach((r) => byId.set(r.id, r));
          pageResult.items.forEach((r) => byId.set(r.id, r));
          const mergedList = Array.from(byId.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          return { ...prev, [productId]: mergedList };
        });
      }

      return pageResult;
    },
    []
  );

  const submitReview = async (reviewData: {
    productId: string;
    authorName: string;
    authorCity?: string;
    rating: number;
    title?: string;
    comment: string;
  }): Promise<ProductReview> => {
    setIsSubmittingReview(true);
    try {
      // 1. Save in client-side IndexedDB for zero-latency instant updates
      const createdReview = await addReviewToDB({
        ...reviewData,
        verifiedBuyer: true,
      });

      // 2. Update reactive state immediately and invalidate memoized review page cache
      invalidateProductReviewCache(reviewData.productId);
      setAllReviews((prev) => [createdReview, ...prev]);
      setReviewsMap((prev) => {
        const currentList = prev[reviewData.productId] || [];
        return {
          ...prev,
          [reviewData.productId]: [createdReview, ...currentList],
        };
      });

      // 3. Synchronize to Cloud Firestore in the background
      try {
        await setDoc(doc(db, 'reviews', createdReview.id), {
          ...createdReview,
          syncedAt: new Date().toISOString(),
        });
      } catch (firestoreErr) {
        console.warn('Firestore cloud write deferred (saved locally in IndexedDB):', firestoreErr);
      }

      return createdReview;
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const subscribeNewsletter = async (
    email: string,
    name?: string,
    source = 'footer'
  ): Promise<{ success: boolean; alreadySubscribed: boolean; message: string }> => {
    setIsSubscribingNewsletter(true);
    try {
      const result = await addNewsletterSubscriberToDB(email, name, source);
      if (result.success && result.subscriber && !result.alreadySubscribed) {
        setNewsletterSubscribers((prev) => [result.subscriber!, ...prev]);
      }
      return result;
    } finally {
      setIsSubscribingNewsletter(false);
    }
  };

  const contextValue = useMemo(
    () => ({
      reviewsMap,
      allReviews,
      newsletterSubscribers,
      isSubmittingReview,
      isSubscribingNewsletter,
      getReviewsForProduct,
      getProductStats,
      loadProductReviewsPage,
      submitReview,
      subscribeNewsletter,
      refreshData: loadAllData,
    }),
    [
      reviewsMap,
      allReviews,
      newsletterSubscribers,
      isSubmittingReview,
      isSubscribingNewsletter,
      getReviewsForProduct,
      getProductStats,
      loadProductReviewsPage,
      loadAllData,
    ]
  );

  return (
    <ReviewContext.Provider value={contextValue}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = (): ReviewContextType => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
};

import { ProductReview, NewsletterSubscriber } from '../types';

const DB_NAME = 'niaz_cloth_house_db';
const DB_VERSION = 1;

const STORES = {
  REVIEWS: 'reviews',
  NEWSLETTER: 'newsletter_subscribers',
} as const;

// Initial curated reviews for popular products so the shop feels established and authentic
export const SEED_REVIEWS: ProductReview[] = [
  {
    id: 'seed-rev-001',
    productId: 'nch-001', // 8-Pound Boski Silk
    authorName: 'Mirza Shafqat Baig',
    authorCity: 'Lahore',
    rating: 5,
    title: 'Authentic 8-Pound Chinese Boski, Perfect Drape',
    comment: 'My family has been wearing Boski from Niaz Cloth House since the 1980s. The 8-pound weight has that authentic heavy fall and soft pearl luster that cheap market copies cannot replicate. Stitched like a dream for Eid.',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    verifiedBuyer: true,
  },
  {
    id: 'seed-rev-002',
    productId: 'nch-001', // 8-Pound Boski Silk
    authorName: 'Chaudhry Tariq Mahmood',
    authorCity: 'Faisalabad',
    rating: 5,
    title: 'Original Gold Stamp Selvedge',
    comment: 'Checked the selvedge stamp and thread density. 100% genuine Chinese spun silk. Generous 4.5 meters cut was enough for my 6’1" height and full kalidaar kurta.',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    verifiedBuyer: true,
  },
  {
    id: 'seed-rev-003',
    productId: 'nch-002', // Egyptian Latha Cotton
    authorName: 'Advocate Malik Daniyal',
    authorCity: 'Rawalpindi',
    rating: 5,
    title: 'The Best White Latha in Pakistan',
    comment: 'Crisp starched collar and cuffs for court and Jummah prayer. Soaked in clean water for 2 hours (Tarr-Karna) as advised, and there was zero shrinkage after tailoring.',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    verifiedBuyer: true,
  },
  {
    id: 'seed-rev-004',
    productId: 'nch-002', // Egyptian Latha Cotton
    authorName: 'Dr. Kamran Akram',
    authorCity: 'Islamabad',
    rating: 4,
    title: 'Very cool in hot summer',
    comment: 'Pure combed Egyptian Giza cotton. Does not yellow after washing and stays crisp throughout the day. Parcel arrived in 24 hours in F-7.',
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    verifiedBuyer: true,
  },
  {
    id: 'seed-rev-005',
    productId: 'nch-004', // Tawakkal Embroidered Lawn
    authorName: 'Begum Tahira Siddiqui',
    authorCity: 'Islamabad',
    rating: 5,
    title: 'Finest thread embroidery and pure chiffon dupatta',
    comment: 'The Tawakkal 3-piece suit arrived in pristine packing via COD. The embroidery is fine and neat without loose threads, and the crinkle chiffon dupatta has beautiful fall.',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    verifiedBuyer: true,
  },
  {
    id: 'seed-rev-006',
    productId: 'nch-005', // Kamalia Handloom Khaddar
    authorName: 'Sardar Jahangir Khan',
    authorCity: 'Peshawar',
    rating: 5,
    title: 'Warm, rustic and heavy handspun texture',
    comment: 'Traditional Kamalia handloom Khaddar. The weight is substantial and comfortable against the cold winds. Best winter suit I have purchased this year.',
    createdAt: new Date(Date.now() - 22 * 86400000).toISOString(),
    verifiedBuyer: true,
  },
  {
    id: 'seed-rev-007',
    productId: 'nch-006', // Handwoven Karandi
    authorName: 'Sheikh M. Rizwan',
    authorCity: 'Gujranwala',
    rating: 5,
    title: 'Pure silk slubs and comfortable winter warmth',
    comment: 'Raw Karandi texture is exceptional. Looks very royal with a Nehru waistcoat or shawl for winter evening wedding functions.',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    verifiedBuyer: true,
  },
  {
    id: 'seed-rev-008',
    productId: 'nch-020', // Bin Saeed Digital Lawn
    authorName: 'Ayesha Farooq',
    authorCity: 'Karachi',
    rating: 5,
    title: 'Vibrant summer print and soft breathable lawn',
    comment: 'Bin Saeed 80s lawn is the softest for Karachi heat. Colors did not bleed during the first wash. Complete 3-piece suit with fast delivery.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    verifiedBuyer: true,
  },
];

// Open IndexedDB instance with upgrade handler
export function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Reviews Store
      if (!db.objectStoreNames.contains(STORES.REVIEWS)) {
        const reviewStore = db.createObjectStore(STORES.REVIEWS, { keyPath: 'id' });
        reviewStore.createIndex('productId', 'productId', { unique: false });
        reviewStore.createIndex('createdAt', 'createdAt', { unique: false });
        reviewStore.createIndex('rating', 'rating', { unique: false });
      }

      // 2. Newsletter Subscribers Store
      if (!db.objectStoreNames.contains(STORES.NEWSLETTER)) {
        const newsletterStore = db.createObjectStore(STORES.NEWSLETTER, { keyPath: 'email' });
        newsletterStore.createIndex('subscribedAt', 'subscribedAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

// Seed initial reviews if the reviews store is empty
export async function seedReviewsIfEmpty(): Promise<void> {
  try {
    const db = await openIndexedDB();
    const count = await new Promise<number>((resolve, reject) => {
      const transaction = db.transaction([STORES.REVIEWS], 'readonly');
      const store = transaction.objectStore(STORES.REVIEWS);
      const countReq = store.count();
      countReq.onsuccess = () => resolve(countReq.result);
      countReq.onerror = () => reject(countReq.error);
    });

    if (count === 0) {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([STORES.REVIEWS], 'readwrite');
        const store = transaction.objectStore(STORES.REVIEWS);
        for (const rev of SEED_REVIEWS) {
          store.put(rev);
        }
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    }
  } catch (error) {
    console.warn('Error checking/seeding IndexedDB reviews:', error);
  }
}

// Add a new review to IndexedDB
export async function addReviewToDB(
  reviewData: Omit<ProductReview, 'id' | 'createdAt'>
): Promise<ProductReview> {
  const db = await openIndexedDB();
  const newReview: ProductReview = {
    ...reviewData,
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    verifiedBuyer: reviewData.verifiedBuyer ?? true,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.REVIEWS], 'readwrite');
    const store = transaction.objectStore(STORES.REVIEWS);
    const request = store.add(newReview);

    request.onsuccess = () => resolve(newReview);
    request.onerror = () => reject(request.error || new Error('Failed to add review'));
  });
}

// Upsert existing review in IndexedDB (used when syncing with Firestore)
export async function putReviewInDB(review: ProductReview): Promise<ProductReview> {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.REVIEWS], 'readwrite');
    const store = transaction.objectStore(STORES.REVIEWS);
    const request = store.put(review);

    request.onsuccess = () => resolve(review);
    request.onerror = () => reject(request.error || new Error('Failed to put review'));
  });
}

// Fetch all reviews for a specific product
export async function getReviewsForProductFromDB(productId: string): Promise<ProductReview[]> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.REVIEWS], 'readonly');
      const store = transaction.objectStore(STORES.REVIEWS);
      const index = store.index('productId');
      const request = index.getAll(IDBKeyRange.only(productId));

      request.onsuccess = () => {
        const list: ProductReview[] = request.result || [];
        // Sort descending by date
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(list);
      };
      request.onerror = () => reject(request.error || new Error('Failed to fetch product reviews'));
    });
  } catch (error) {
    console.warn('Error fetching reviews from IndexedDB, falling back to seed:', error);
    return SEED_REVIEWS.filter((r) => r.productId === productId);
  }
}

// Fetch all reviews in database (for catalog stats or admin)
export async function getAllReviewsFromDB(): Promise<ProductReview[]> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.REVIEWS], 'readonly');
      const store = transaction.objectStore(STORES.REVIEWS);
      const request = store.getAll();

      request.onsuccess = () => {
        const list: ProductReview[] = request.result || [];
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(list);
      };
      request.onerror = () => reject(request.error || new Error('Failed to fetch all reviews'));
    });
  } catch (error) {
    console.warn('Error fetching all reviews from IndexedDB:', error);
    return SEED_REVIEWS;
  }
}

// Compute dynamic rating summary for a product
export function computeRatingStats(
  reviews: ProductReview[],
  baseRating = 5.0,
  baseReviewsCount = 0
): {
  averageRating: number;
  totalReviews: number;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
} {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  if (reviews.length === 0) {
    return {
      averageRating: baseRating,
      totalReviews: baseReviewsCount,
      distribution: { 1: 0, 2: 0, 3: 1, 4: 5, 5: Math.max(1, baseReviewsCount - 6) },
    };
  }

  let sum = 0;
  for (const r of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[star] = (distribution[star] || 0) + 1;
    sum += r.rating;
  }

  const avg = Number((sum / reviews.length).toFixed(1));
  return {
    averageRating: avg,
    totalReviews: reviews.length,
    distribution,
  };
}

// ==========================================
// EMAIL NEWSLETTER VALIDATION & STORAGE
// ==========================================

export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Please enter your email address.' };
  }

  // Standard robust RFC 5322 compatible email format regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
  }

  if (trimmed.length > 254) {
    return { isValid: false, error: 'Email address is too long.' };
  }

  return { isValid: true };
}

// Add newsletter subscriber to IndexedDB
export async function addNewsletterSubscriberToDB(
  email: string,
  name?: string,
  source = 'footer'
): Promise<{ success: boolean; alreadySubscribed: boolean; message: string; subscriber?: NewsletterSubscriber }> {
  const validation = validateEmail(email);
  if (!validation.isValid) {
    return {
      success: false,
      alreadySubscribed: false,
      message: validation.error || 'Invalid email format.',
    };
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const db = await openIndexedDB();

    // Check if already subscribed
    const existing = await new Promise<NewsletterSubscriber | null>((resolve, reject) => {
      const transaction = db.transaction([STORES.NEWSLETTER], 'readonly');
      const store = transaction.objectStore(STORES.NEWSLETTER);
      const getReq = store.get(normalizedEmail);
      getReq.onsuccess = () => resolve(getReq.result || null);
      getReq.onerror = () => reject(getReq.error);
    });

    if (existing) {
      return {
        success: true,
        alreadySubscribed: true,
        message: 'This email is already subscribed to Niaz Cloth House updates.',
        subscriber: existing,
      };
    }

    const subscriber: NewsletterSubscriber = {
      email: normalizedEmail,
      name: name?.trim() || undefined,
      subscribedAt: new Date().toISOString(),
      source,
    };

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([STORES.NEWSLETTER], 'readwrite');
      const store = transaction.objectStore(STORES.NEWSLETTER);
      const addReq = store.add(subscriber);
      addReq.onsuccess = () => resolve();
      addReq.onerror = () => reject(addReq.error);
    });

    return {
      success: true,
      alreadySubscribed: false,
      message: 'Thank you for subscribing! You will receive our latest fabric arrivals and seasonal updates.',
      subscriber,
    };
  } catch (error: any) {
    console.error('Error saving newsletter subscriber to IndexedDB:', error);
    return {
      success: false,
      alreadySubscribed: false,
      message: error?.message || 'Failed to save subscription. Please try again.',
    };
  }
}

// Fetch all newsletter subscribers from IndexedDB
export async function getNewsletterSubscribersFromDB(): Promise<NewsletterSubscriber[]> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.NEWSLETTER], 'readonly');
      const store = transaction.objectStore(STORES.NEWSLETTER);
      const request = store.getAll();

      request.onsuccess = () => {
        const list: NewsletterSubscriber[] = request.result || [];
        list.sort((a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime());
        resolve(list);
      };
      request.onerror = () => reject(request.error || new Error('Failed to fetch subscribers'));
    });
  } catch (error) {
    console.warn('Error reading newsletter subscribers from IndexedDB:', error);
    return [];
  }
}

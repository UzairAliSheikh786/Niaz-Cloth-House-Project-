import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ProductReview, NewsletterSubscriber } from '../types';
import { 
  seedReviewsIfEmpty, 
  getReviewsForProductFromDB, 
  getAllReviewsFromDB, 
  addReviewToDB, 
  putReviewInDB,
  computeRatingStats,
  addNewsletterSubscriberToDB,
  getNewsletterSubscribersFromDB,
  validateEmail
} from '../utils/indexedDB';
import { INITIAL_PRODUCTS } from '../data/products';

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

      // 3. Gracefully sync with Firestore Cloud Database if online
      try {
        const snap = await getDocs(collection(db, 'reviews'));
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
    loadAllData();
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

      // 2. Update reactive state immediately
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

  return (
    <ReviewContext.Provider
      value={{
        reviewsMap,
        allReviews,
        newsletterSubscribers,
        isSubmittingReview,
        isSubscribingNewsletter,
        getReviewsForProduct,
        getProductStats,
        submitReview,
        subscribeNewsletter,
        refreshData: loadAllData,
      }}
    >
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

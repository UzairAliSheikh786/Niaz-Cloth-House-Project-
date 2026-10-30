import { collection, doc, getDocs, setDoc, query, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { INITIAL_PRODUCTS } from './data/products';

export async function seedFirestoreDatabase() {
  try {
    const productsCol = collection(db, 'products');
    const q = query(productsCol, limit(1));
    const snapshot = await getDocs(q);

    // If products collection is empty, seed with initial catalog
    if (snapshot.empty) {
      console.log('Seeding initial luxury unstitched catalog into Firestore...');
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
      console.log('Firestore products seeded successfully.');
    }

    // Seed Google Maps verified review
    const reviewsCol = collection(db, 'reviews');
    const reviewQ = query(reviewsCol, limit(1));
    const revSnap = await getDocs(reviewQ);
    if (revSnap.empty) {
      await setDoc(doc(db, 'reviews', 'rev-kaleemullah-01'), {
        id: 'rev-kaleemullah-01',
        authorName: 'Kaleemullah Danish',
        rating: 5,
        comment: 'Niaz Cloth House in Paris Bazaar is the most reliable shop for pure unstitched suiting in Rawalpindi. Genuine Boski silk weight and top quality Latha cotton cuts. 100% recommended for authentic unstitched fabrics.',
        city: 'Rawalpindi',
        createdAt: '2026-09-18T10:00:00Z',
        verified: true,
      });
      console.log('Firestore reviews seeded with verified customer testimonial.');
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'products');
  }
}

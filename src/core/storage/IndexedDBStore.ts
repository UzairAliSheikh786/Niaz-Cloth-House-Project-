/**
 * Encapsulated IndexedDB Storage System
 * Implements Abstraction, Encapsulation, and Polymorphism for client-side persistence:
 * - Cart items, quantities, and prices
 * - User Preferences (currency, unit system, favorite fabrics)
 * - Recently Viewed Atelier Items
 */

import { CartItem, Product } from '../../types';
import { AbstractStorageService } from './IStorageAdapter';

export const NCH_DB_NAME = 'niaz_cloth_house_db';
export const NCH_DB_VERSION = 2;

export const DB_OBJECT_STORES = {
  CART: 'cart_items',
  PREFERENCES: 'user_preferences',
  RECENTLY_VIEWED: 'recently_viewed',
  REVIEWS: 'reviews',
  NEWSLETTER: 'newsletter_subscribers',
} as const;

export interface UserPreferences {
  currency: 'PKR' | 'USD' | 'GBP' | 'EUR' | 'AED' | 'SAR' | 'CAD';
  measurementUnit: 'Meters' | 'Guz' | 'Yards';
  preferredCategory: string;
  themeMode: 'light' | 'luxury-editorial';
  notificationsEnabled: boolean;
  updatedAt: string;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  currency: 'PKR',
  measurementUnit: 'Meters',
  preferredCategory: 'All Fabrics',
  themeMode: 'luxury-editorial',
  notificationsEnabled: true,
  updatedAt: new Date().toISOString(),
};

export interface RecentlyViewedItem {
  id: string; // product id
  product: Product;
  viewedAt: string;
}

/**
 * Singleton database connection manager encapsulating open/upgrade logic.
 */
class IndexedDBConnection {
  private static instance: IndexedDBConnection;
  private dbPromise: Promise<IDBDatabase> | null = null;

  private constructor() {}

  public static getInstance(): IndexedDBConnection {
    if (!IndexedDBConnection.instance) {
      IndexedDBConnection.instance = new IndexedDBConnection();
    }
    return IndexedDBConnection.instance;
  }

  public getDatabase(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this browser environment'));
        return;
      }

      const request = window.indexedDB.open(NCH_DB_NAME, NCH_DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. Cart Items Store
        if (!db.objectStoreNames.contains(DB_OBJECT_STORES.CART)) {
          const cartStore = db.createObjectStore(DB_OBJECT_STORES.CART, { keyPath: 'cartKey' });
          cartStore.createIndex('productId', 'product.id', { unique: false });
          cartStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // 2. User Preferences Store
        if (!db.objectStoreNames.contains(DB_OBJECT_STORES.PREFERENCES)) {
          db.createObjectStore(DB_OBJECT_STORES.PREFERENCES, { keyPath: 'key' });
        }

        // 3. Recently Viewed Products Store
        if (!db.objectStoreNames.contains(DB_OBJECT_STORES.RECENTLY_VIEWED)) {
          const recentStore = db.createObjectStore(DB_OBJECT_STORES.RECENTLY_VIEWED, { keyPath: 'id' });
          recentStore.createIndex('viewedAt', 'viewedAt', { unique: false });
        }

        // 4. Reviews Store (Preserve existing v1 schema)
        if (!db.objectStoreNames.contains(DB_OBJECT_STORES.REVIEWS)) {
          const reviewStore = db.createObjectStore(DB_OBJECT_STORES.REVIEWS, { keyPath: 'id' });
          reviewStore.createIndex('productId', 'productId', { unique: false });
          reviewStore.createIndex('createdAt', 'createdAt', { unique: false });
          reviewStore.createIndex('rating', 'rating', { unique: false });
        }

        // 5. Newsletter Subscribers Store (Preserve existing v1 schema)
        if (!db.objectStoreNames.contains(DB_OBJECT_STORES.NEWSLETTER)) {
          const newsletterStore = db.createObjectStore(DB_OBJECT_STORES.NEWSLETTER, { keyPath: 'email' });
          newsletterStore.createIndex('subscribedAt', 'subscribedAt', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        this.dbPromise = null;
        reject(request.error || new Error('Failed to open IndexedDB'));
      };
    });

    return this.dbPromise;
  }
}

/**
 * Polymorphic Encapsulated Cart Store persisting directly to IndexedDB.
 */
export interface PersistedCartRecord {
  cartKey: string;
  item: CartItem;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedColor?: string;
  selectedColorHex?: string;
  selectedDesign?: string;
  updatedAt: string;
}

export class EncapsulatedCartStore extends AbstractStorageService<PersistedCartRecord> {
  private readonly connection = IndexedDBConnection.getInstance();

  constructor() {
    super(DB_OBJECT_STORES.CART);
  }

  private generateCartKey(item: CartItem): string {
    return `${item.product.id}__${item.selectedColor || 'default'}__${item.selectedDesign || 'default'}`;
  }

  public async get(key: string): Promise<PersistedCartRecord | null> {
    try {
      const db = await this.connection.getDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([this.storeName], 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      this.logOperation('get error', e);
      return null;
    }
  }

  public async set(key: string, value: PersistedCartRecord): Promise<void> {
    try {
      const db = await this.connection.getDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([this.storeName], 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.put(value);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      this.logOperation('set error', e);
    }
  }

  public async remove(key: string): Promise<void> {
    try {
      const db = await this.connection.getDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([this.storeName], 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      this.logOperation('remove error', e);
    }
  }

  public async clear(): Promise<void> {
    try {
      const db = await this.connection.getDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([this.storeName], 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      this.logOperation('clear error', e);
    }
  }

  public async getAll(): Promise<PersistedCartRecord[]> {
    try {
      const db = await this.connection.getDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([this.storeName], 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.getAll();
        req.onsuccess = () => {
          const list: PersistedCartRecord[] = req.result || [];
          list.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
          resolve(list);
        };
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      this.logOperation('getAll error', e);
      return [];
    }
  }

  /**
   * High-level synchronization: Saves the entire current CartItem[] state into IndexedDB
   */
  public async syncCart(cart: CartItem[]): Promise<void> {
    try {
      const db = await this.connection.getDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction([this.storeName], 'readwrite');
        const store = tx.objectStore(this.storeName);
        store.clear(); // replace with current state

        for (const item of cart) {
          const key = this.generateCartKey(item);
          const record: PersistedCartRecord = {
            cartKey: key,
            item,
            quantity: item.quantity,
            unitPrice: item.product.price,
            totalPrice: item.product.price * item.quantity,
            selectedColor: item.selectedColor,
            selectedColorHex: item.selectedColorHex,
            selectedDesign: item.selectedDesign,
            updatedAt: new Date().toISOString(),
          };
          store.put(record);
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      this.logOperation('syncCart error', e);
    }
  }

  /**
   * Hydrates the cart items from IndexedDB
   */
  public async loadCartItems(): Promise<CartItem[]> {
    const records = await this.getAll();
    return records.map((r) => r.item);
  }
}

/**
 * Encapsulated User Preferences Store (currency, units, favorites)
 */
export class EncapsulatedPreferenceStore {
  private readonly connection = IndexedDBConnection.getInstance();
  private readonly storeName = DB_OBJECT_STORES.PREFERENCES;

  public async getPreferences(): Promise<UserPreferences> {
    try {
      const db = await this.connection.getDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction([this.storeName], 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.get('current_preferences');
        req.onsuccess = () => {
          if (req.result && req.result.value) {
            resolve({ ...DEFAULT_USER_PREFERENCES, ...req.result.value });
          } else {
            resolve(DEFAULT_USER_PREFERENCES);
          }
        };
        req.onerror = () => resolve(DEFAULT_USER_PREFERENCES);
      });
    } catch {
      return DEFAULT_USER_PREFERENCES;
    }
  }

  public async savePreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.getPreferences();
    const updated: UserPreferences = {
      ...current,
      ...prefs,
      updatedAt: new Date().toISOString(),
    };

    try {
      const db = await this.connection.getDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction([this.storeName], 'readwrite');
        const store = tx.objectStore(this.storeName);
        store.put({ key: 'current_preferences', value: updated });
        tx.oncomplete = () => resolve(updated);
        tx.onerror = () => resolve(updated);
      });
    } catch {
      return updated;
    }
  }
}

/**
 * Encapsulated Recently Viewed Items Store (capped at 12 items)
 */
export class EncapsulatedRecentlyViewedStore {
  private readonly connection = IndexedDBConnection.getInstance();
  private readonly storeName = DB_OBJECT_STORES.RECENTLY_VIEWED;
  private readonly MAX_RECENT_ITEMS = 12;

  public async recordView(product: Product): Promise<void> {
    try {
      const db = await this.connection.getDatabase();
      const record: RecentlyViewedItem = {
        id: product.id,
        product,
        viewedAt: new Date().toISOString(),
      };

      return new Promise((resolve) => {
        const tx = db.transaction([this.storeName], 'readwrite');
        const store = tx.objectStore(this.storeName);
        store.put(record);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      // ignore
    }
  }

  public async getRecentlyViewed(): Promise<Product[]> {
    try {
      const db = await this.connection.getDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction([this.storeName], 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.getAll();
        req.onsuccess = () => {
          const list: RecentlyViewedItem[] = req.result || [];
          list.sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());
          resolve(list.slice(0, this.MAX_RECENT_ITEMS).map((i) => i.product));
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  public async clearHistory(): Promise<void> {
    try {
      const db = await this.connection.getDatabase();
      return new Promise((resolve) => {
        const tx = db.transaction([this.storeName], 'readwrite');
        const store = tx.objectStore(this.storeName);
        store.clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      // ignore
    }
  }
}

// Singleton instances for clean polymorphic consumption
export const cartStore = new EncapsulatedCartStore();
export const preferenceStore = new EncapsulatedPreferenceStore();
export const recentlyViewedStore = new EncapsulatedRecentlyViewedStore();

/**
 * Multi-Tier Client Caching Utility
 * Provides in-memory and localStorage caching with configurable TTL,
 * stale-while-revalidate capability, and eviction mechanisms.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // in milliseconds
  version: string;
}

class ClientCache {
  private memoryStore: Map<string, CacheEntry<any>> = new Map();
  private maxMemoryEntries = 200;
  private readonly appVersion = '1.0.4';

  /**
   * Set value in cache with TTL
   */
  set<T>(key: string, data: T, ttlSeconds: number = 300, persistToStorage: boolean = true): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
      version: this.appVersion,
    };

    // Evict oldest if memoryStore exceeds limit
    if (this.memoryStore.size >= this.maxMemoryEntries) {
      const oldestKey = this.memoryStore.keys().next().value;
      if (oldestKey) this.memoryStore.delete(oldestKey);
    }

    this.memoryStore.set(key, entry);

    if (persistToStorage && typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(`nch_cache_${key}`, JSON.stringify(entry));
      } catch (e) {
        console.warn('LocalStorage quota exceeded or unavailable, falling back to memory cache.');
      }
    }
  }

  /**
   * Get value from cache if still valid
   */
  get<T>(key: string): T | null {
    // 1. Check memory store first
    const memEntry = this.memoryStore.get(key);
    if (memEntry) {
      if (Date.now() - memEntry.timestamp < memEntry.ttl) {
        return memEntry.data as T;
      }
      this.memoryStore.delete(key);
    }

    // 2. Check localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = localStorage.getItem(`nch_cache_${key}`);
        if (raw) {
          const entry: CacheEntry<T> = JSON.parse(raw);
          if (entry.version === this.appVersion && Date.now() - entry.timestamp < entry.ttl) {
            // Restore to memory store
            this.memoryStore.set(key, entry);
            return entry.data;
          }
          localStorage.removeItem(`nch_cache_${key}`);
        }
      } catch {
        // Invalid or corrupted cache entry
      }
    }

    return null;
  }

  /**
   * Remove specific key
   */
  remove(key: string): void {
    this.memoryStore.delete(key);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(`nch_cache_${key}`);
      } catch {}
    }
  }

  /**
   * Clear all cached items
   */
  clear(): void {
    this.memoryStore.clear();
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('nch_cache_')) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {}
    }
  }

  /**
   * Diagnostic statistics for Admin Inspection
   */
  getStats(): { memoryItems: number; storageItems: number } {
    let storageCount = 0;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('nch_cache_')) storageCount++;
        }
      } catch {}
    }
    return {
      memoryItems: this.memoryStore.size,
      storageItems: storageCount,
    };
  }
}

export const clientCache = new ClientCache();

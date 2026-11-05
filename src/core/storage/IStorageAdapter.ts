/**
 * Object-Oriented Architecture: Storage Abstraction Layer
 * Defines interfaces and abstract classes demonstrating Abstraction and Polymorphism.
 */

export interface IStorageAdapter<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  getAll(): Promise<T[]>;
}

export abstract class AbstractStorageService<T> implements IStorageAdapter<T> {
  protected readonly storeName: string;

  constructor(storeName: string) {
    this.storeName = storeName;
  }

  abstract get(key: string): Promise<T | null>;
  abstract set(key: string, value: T): Promise<void>;
  abstract remove(key: string): Promise<void>;
  abstract clear(): Promise<void>;
  abstract getAll(): Promise<T[]>;

  // Encapsulated hook for logging and metrics
  protected logOperation(operation: string, details?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[Storage:${this.storeName}] ${operation}`, details || '');
    }
  }
}

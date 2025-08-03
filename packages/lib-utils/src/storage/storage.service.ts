import { ZodType } from 'zod';

import { MemoryStorage } from './memory-storage.service';
import { StorageAdapter, StorageName } from './storage.types';
import { WebStorage } from './web-storage.service';

/**
 * A singleton service that provides a unified interface for interacting with different storage adapters.
 * Supports `localStorage`, `sessionStorage`, and in-memory storage (`MemoryStorage`).
 * Allows setting a storage adapter dynamically and provides methods to interact with the selected storage.
 */
export class StorageService {
  private static _instance: StorageService;
  private adapter: StorageAdapter | null = null;

  static get Instance(): StorageService {
    return (
      StorageService._instance ||
      (StorageService._instance = new StorageService())
    );
  }

  /**
   * Sets the storage adapter based on the provided storage name.
   *
   * @param storage - The name of the storage to use (`localStorage`, `sessionStorage`, or `memoryStorage`).
   * @returns The current instance of `StorageService` for method chaining.
   * @throws {Error} If the provided storage name is unsupported.
   */
  fromStorage(storage: StorageName): StorageService {
    switch (storage) {
      case 'localStorage':
        this.adapter = WebStorage.Instance.setStorage(window.localStorage);
        break;
      case 'sessionStorage':
        this.adapter = WebStorage.Instance.setStorage(window.sessionStorage);
        break;
      case 'memoryStorage':
        this.adapter = MemoryStorage.Instance;
        break;
      default:
        throw new Error('StorageService: unsupported storage');
    }

    return this;
  }

  /**
   * Retrieves an item from the selected storage.
   * If a Zod schema is provided, the item is validated against the schema before being returned.
   *
   * @param key - The key of the item to retrieve.
   * @param schema - Optional Zod schema to validate the retrieved item.
   * @returns The retrieved item, or `null` if the item does not exist or validation fails.
   * @throws {Error} If no storage adapter is set.
   */
  getItem<T>(key: string, schema?: ZodType<T>): T | null {
    if (!this.adapter) {
      throw new Error('No storage set. Call fromStorage() first.');
    }

    return this.adapter.getItem(key, schema);
  }

  /**
   * Sets an item in the selected storage.
   *
   * @param key - The key of the item to set.
   * @param value - The value to store.
   * @throws {Error} If no storage adapter is set.
   */
  setItem<T>(key: string, value: T): void {
    if (!this.adapter) {
      throw new Error('No storage set. Call fromStorage() first.');
    }

    this.adapter.setItem(key, value);
  }

  /**
   * Removes an item from the selected storage.
   *
   * @param key - The key of the item to remove.
   * @throws {Error} If no storage adapter is set.
   */
  removeItem(key: string): void {
    if (!this.adapter) {
      throw new Error('No storage set. Call fromStorage() first.');
    }

    this.adapter.removeItem(key);
  }

  /**
   * Clears all items from the selected storage.
   *
   * @throws {Error} If no storage adapter is set.
   */
  clear(): void {
    if (!this.adapter) {
      throw new Error('No storage set. Call fromStorage() first.');
    }

    this.adapter.clear();
  }
}

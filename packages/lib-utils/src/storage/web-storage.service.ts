import { ZodType } from 'zod';
import { Logger } from '@gig-sport-x/svc-logger';

import { StorageAdapter } from './storage.types.js';

/**
 * A class implementing the `StorageAdapter` interface for interacting with web storage
 * (e.g., `localStorage` or `sessionStorage`). This class provides methods to store, retrieve,
 * remove, and clear items in the storage, with support for validating stored items using Zod schemas.
 *
 */
export class WebStorage implements StorageAdapter {
  private static _instance: WebStorage;
  private storage: Storage = window.localStorage;

  static get Instance(): WebStorage {
    return WebStorage._instance || (WebStorage._instance = new WebStorage());
  }

  /**
   * Sets the storage type to be used (e.g., `localStorage` or `sessionStorage`).
   *
   * @param storage - The storage instance to use (e.g., `window.localStorage` or `window.sessionStorage`).
   */
  setStorage(storage: Storage) {
    this.storage = storage;
    return this;
  }

  /**
   * Retrieves an item from the storage and validates it against the provided Zod schema.
   * If the item is not found or validation fails, it returns `null`.
   *
   * @param key - The key under which the item is stored.
   * @param schema - The Zod schema used to validate the item.
   * @returns The validated item if found and valid, or `null` if not found or validation fails.
   *
   */
  getItem<T>(key: string, schema: ZodType<T>): T | null {
    try {
      const maybeItem = this.storage.getItem(key);

      if (maybeItem !== null) {
        try {
          const item = JSON.parse(maybeItem);
          return schema.parse(item);
        } catch (parseError) {
          Logger.Instance.error(
            'WebStorage',
            'getItem',
            `Error parsing item from the storage: ${parseError}`
          );
          return null;
        }
      }

      return null;
    } catch (error) {
      Logger.Instance.error(
        'WebStorage',
        'getItem',
        `Error getting item from the storage: ${error}`
      );
      return null;
    }
  }

  /**
   * Stores an item in the storage after stringifying it. If an error occurs during the process,
   * it logs the error without throwing.
   *
   * @param key - The key under which to store the item.
   * @param value - The value to be stored.
   *
   */
  setItem<T>(key: string, value: T): void {
    try {
      Logger.Instance.debug(
        'WebStorage',
        'setItem',
        `Setting key "${key}" with value:`,
        value
      );

      const item = JSON.stringify(value);
      this.storage.setItem(key, item);
    } catch (error) {
      Logger.Instance.error(
        'WebStorage',
        'setItem',
        `Error setting item in the storage: ${error}`
      );
    }
  }

  /**
   * Removes an item from the storage. If an error occurs during the process,
   * it logs the error without throwing.
   *
   * @param key - The key of the item to be removed.
   *
   */
  removeItem(key: string): void {
    try {
      Logger.Instance.debug(
        'WebStorage',
        'removeItem',
        `Removing item with key "${key}"`
      );

      this.storage.removeItem(key);
    } catch (error) {
      Logger.Instance.error(
        'WebStorage',
        'removeItem',
        `Error removing item from the storage: ${error}`
      );
    }
  }

  /**
   * Clears all items from the storage. If an error occurs during the process,
   * it logs the error without throwing.
   *
   */
  clear() {
    try {
      Logger.Instance.debug(
        'WebStorage',
        'clear',
        'Clearing all items from storage.'
      );

      this.storage.clear();
    } catch (error) {
      Logger.Instance.error(
        'WebStorage',
        'clear',
        `Error clearing the storage: ${error}`
      );
    }
  }
}

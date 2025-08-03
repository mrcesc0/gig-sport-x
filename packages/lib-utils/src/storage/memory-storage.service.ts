import { Logger } from '@gig-sport-x/svc-logger';

import { ReactiveState } from '../reactive-state/reactive-state.js';
import { Memory, StorageAdapter } from './storage.types.js';

/**
 * A singleton class implementing the `StorageAdapter` interface for in-memory storage.
 * Uses `ReactiveState` to manage state and provides methods to interact with the storage.
 */
export class MemoryStorage implements StorageAdapter {
  private static _instance: MemoryStorage;
  private storage = new ReactiveState<Memory>({});

  static get Instance(): MemoryStorage {
    return (
      MemoryStorage._instance || (MemoryStorage._instance = new MemoryStorage())
    );
  }

  /**
   * Retrieves the value associated with the specified key from the storage.
   *
   * @param key - The key of the item to retrieve.
   * @returns The value associated with the key, or `null` if the key does not exist.
   */
  getItem<T>(key: string): T | null {
    const value = this.storage.select((s) => s[key]);
    return value !== undefined ? (value as T) : null;
  }

  /**
   * Sets the value for the specified key in the storage.
   *
   * @param key - The key of the item to set.
   * @param value - The value to associate with the key.
   */
  setItem<T>(key: string, value: T): void {
    Logger.Instance.debug(
      'MemoryStorage',
      'setItem',
      `Setting key "${key}" with value:`,
      value
    );

    this.storage.setState((state) => ({
      ...state,
      [key]: value,
    }));
  }

  /**
   * Removes the item associated with the specified key from the storage.
   * Logs an error if the key does not exist.
   *
   * @param key - The key of the item to remove.
   */
  removeItem(key: string): void {
    this.storage.setState((state) => {
      if (!(key in state)) {
        Logger.Instance.error(
          'MemoryStorage',
          'removeItem',
          `Key "${key}" does not exist in storage.`
        );
        return state;
      }

      Logger.Instance.debug(
        'MemoryStorage',
        'removeItem',
        `Removing item with key "${key}"`
      );

      const newState = { ...state };
      delete newState[key];
      return newState;
    });
  }

  /**
   * Clears all items from the storage.
   */
  clear(): void {
    Logger.Instance.debug(
      'MemoryStorage',
      'clear',
      'Clearing all items from storage.'
    );

    this.storage.setState({});
  }
}

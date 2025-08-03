import { ZodType } from 'zod';

export type Memory = Record<string, unknown>;

export type StorageName = 'localStorage' | 'sessionStorage' | 'memoryStorage';

export interface StorageAdapter {
  getItem<T>(key: string, schema?: ZodType<T>): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
}

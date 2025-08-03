import { ZodType } from 'zod';

import { StorageName } from '../storage/storage.types.js';

export type StateUpdater<T> = (state: T) => T;

export interface ReactiveStateOptions<T> {
  syncWithStorage?: {
    key: string;
    schema: ZodType<T>;
    storageName: Extract<StorageName, 'localStorage' | 'sessionStorage'>;
  };
}

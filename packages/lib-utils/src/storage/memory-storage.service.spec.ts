import { Logger } from '@gig-sport-x/svc-logger';

import { MemoryStorage } from './memory-storage.service.js';

// Mock Logger to avoid side effects in tests
jest.mock('@gig-sport-x/svc-logger', () => ({
  Logger: {
    Instance: {
      debug: jest.fn(),
      error: jest.fn(),
    },
  },
}));

describe('MemoryStorage', () => {
  let memoryStorage: MemoryStorage;

  beforeEach(() => {
    // Reset the singleton instance before each test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (MemoryStorage as any)._instance = undefined;

    // Create a new instance of MemoryStorage
    memoryStorage = MemoryStorage.Instance;
  });

  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
  });

  describe('getItem', () => {
    it('should return the value for an existing key', () => {
      // Set an item in the storage
      memoryStorage.setItem('foo', 'bar');

      // Retrieve the item
      const result = memoryStorage.getItem<string>('foo');
      expect(result).toBe('bar');
    });

    it('should return null for a non-existent key', () => {
      // Retrieve an item that doesn't exist
      const result = memoryStorage.getItem<string>('baz');
      expect(result).toBeNull();
    });
  });

  describe('setItem', () => {
    it('should set a value for a key', () => {
      // Set an item in the storage
      memoryStorage.setItem('foo', 'bar');

      // Verify the item was set
      const result = memoryStorage.getItem<string>('foo');
      expect(result).toBe('bar');
      expect(Logger.Instance.debug).toHaveBeenCalledWith(
        'MemoryStorage',
        'setItem',
        'Setting key "foo" with value:',
        'bar'
      );
    });

    it('should overwrite an existing value for a key', () => {
      // Set an initial value
      memoryStorage.setItem('foo', 'bar');

      // Overwrite the value
      memoryStorage.setItem('foo', 'baz');

      // Verify the value was overwritten
      const result = memoryStorage.getItem<string>('foo');
      expect(result).toBe('baz');
    });
  });

  describe('removeItem', () => {
    it('should remove an existing key', () => {
      // Set an item in the storage
      memoryStorage.setItem('foo', 'bar');

      // Remove the item
      memoryStorage.removeItem('foo');

      // Verify the item was removed
      const result = memoryStorage.getItem<string>('foo');
      expect(result).toBeNull();
      expect(Logger.Instance.error).not.toHaveBeenCalled();
    });

    it('should log an error for a non-existent key', () => {
      // Remove a non-existent key
      memoryStorage.removeItem('baz');

      // Verify the error was logged
      expect(Logger.Instance.error).toHaveBeenCalledWith(
        'MemoryStorage',
        'removeItem',
        'Key "baz" does not exist in storage.'
      );
    });
  });

  describe('clear', () => {
    it('should clear all items from the storage', () => {
      // Set some items in the storage
      memoryStorage.setItem('foo', 'bar');
      memoryStorage.setItem('baz', 'qux');

      // Clear the storage
      memoryStorage.clear();

      // Verify all items were cleared
      expect(memoryStorage.getItem<string>('foo')).toBeNull();
      expect(memoryStorage.getItem<string>('baz')).toBeNull();
      expect(Logger.Instance.debug).toHaveBeenCalledWith(
        'MemoryStorage',
        'clear',
        'Clearing all items from storage.'
      );
    });
  });
});

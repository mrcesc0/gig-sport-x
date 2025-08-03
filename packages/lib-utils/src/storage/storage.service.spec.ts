/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { StorageService } from './storage.service.js';
import { MemoryStorage } from './memory-storage.service.js';
import { WebStorage } from './web-storage.service.js';

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(() => {
    // Reset the singleton instance before each test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (StorageService as any)._instance = undefined;

    // Create a new instance of StorageService
    storageService = StorageService.Instance;
  });

  describe('fromStorage', () => {
    it('should set the adapter to WebStorage for localStorage', () => {
      storageService.fromStorage('localStorage');
      expect(storageService['adapter']).toBeInstanceOf(WebStorage);
    });

    it('should set the adapter to WebStorage for sessionStorage', () => {
      storageService.fromStorage('sessionStorage');
      expect(storageService['adapter']).toBeInstanceOf(WebStorage);
    });

    it('should set the adapter to MemoryStorage for memoryStorage', () => {
      storageService.fromStorage('memoryStorage');
      expect(storageService['adapter']).toBeInstanceOf(MemoryStorage);
    });

    it('should throw an error for an unsupported storage type', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => storageService.fromStorage('unsupported' as any)).toThrow(
        'StorageService: unsupported storage'
      );
    });
  });

  describe('delegation to adapter', () => {
    it('should delegate getItem to the selected adapter', () => {
      storageService.fromStorage('memoryStorage');
      const mockGetItem = jest.spyOn(storageService['adapter']!, 'getItem');
      storageService.getItem('foo');
      expect(mockGetItem).toHaveBeenCalledWith('foo', undefined);
    });

    it('should delegate setItem to the selected adapter', () => {
      storageService.fromStorage('memoryStorage');
      const mockSetItem = jest.spyOn(storageService['adapter']!, 'setItem');
      storageService.setItem('foo', 'bar');
      expect(mockSetItem).toHaveBeenCalledWith('foo', 'bar');
    });

    it('should delegate removeItem to the selected adapter', () => {
      storageService.fromStorage('memoryStorage');
      const mockRemoveItem = jest.spyOn(
        storageService['adapter']!,
        'removeItem'
      );
      storageService.removeItem('foo');
      expect(mockRemoveItem).toHaveBeenCalledWith('foo');
    });

    it('should delegate clear to the selected adapter', () => {
      storageService.fromStorage('memoryStorage');
      const mockClear = jest.spyOn(storageService['adapter']!, 'clear');
      storageService.clear();
      expect(mockClear).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should throw an error if getItem is called without setting an adapter', () => {
      expect(() => storageService.getItem('foo')).toThrow(
        'No storage set. Call fromStorage() first.'
      );
    });

    it('should throw an error if setItem is called without setting an adapter', () => {
      expect(() => storageService.setItem('foo', 'bar')).toThrow(
        'No storage set. Call fromStorage() first.'
      );
    });

    it('should throw an error if removeItem is called without setting an adapter', () => {
      expect(() => storageService.removeItem('foo')).toThrow(
        'No storage set. Call fromStorage() first.'
      );
    });

    it('should throw an error if clear is called without setting an adapter', () => {
      expect(() => storageService.clear()).toThrow(
        'No storage set. Call fromStorage() first.'
      );
    });
  });
});

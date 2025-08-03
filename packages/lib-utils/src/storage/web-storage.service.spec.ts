import { Logger } from '@gig-sport-x/svc-logger';
import { z } from 'zod';

import { WebStorage } from './web-storage.service.js';

describe('WebStorage Service', () => {
  let storage: WebStorage;

  // Mock localStorage
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };

  // Mock the global localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
  });

  beforeEach(() => {
    // Reset the singleton instance before each test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (WebStorage as any)._instance = undefined;

    // Create a new instance of WebStorage with the mocked localStorage
    storage = WebStorage.Instance.setStorage(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockLocalStorage as any as Storage
    );
  });

  afterEach(() => {
    // Clear all mocks after each test
    jest.clearAllMocks();
  });

  describe('getItem', () => {
    it('should return the parsed item when the key exists and the value is valid JSON', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      // Mock a valid JSON response
      mockLocalStorage.getItem.mockReturnValueOnce('{"name":"John","age":30}');

      const result = storage.getItem('user', schema);
      expect(result).toEqual({ name: 'John', age: 30 });
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('user');
    });

    it('should return null when the key does not exist', () => {
      // Mock a null response (key not found)
      mockLocalStorage.getItem.mockReturnValueOnce(null);

      const result = storage.getItem('nonexistentKey', z.string());
      expect(result).toBeNull();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('nonexistentKey');
    });

    it('should return null when the stored value is invalid JSON', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });

      // Mock an invalid JSON response
      mockLocalStorage.getItem.mockReturnValueOnce('{name:John,age:30}');

      const result = storage.getItem('user', schema);
      expect(result).toBeNull();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('user');
    });

    it('should return null when the stored value is valid JSON but fails schema validation', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      });
      // Mock a JSON response that fails schema validation
      mockLocalStorage.getItem.mockReturnValueOnce('{"name":"John"}'); // Missing 'age' property
      const result = storage.getItem('user', schema);
      expect(result).toBeNull();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('user');
    });

    it('should return null when storage.getItem throws an error', () => {
      // Mock an error during getItem call
      mockLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error('Security error: Access denied');
      });
      const result = storage.getItem('user', z.string());
      expect(result).toBeNull();
    });

    it('should return null when the stored value is an empty string', () => {
      const schema = z.string();
      // Mock an empty string as the stored value
      mockLocalStorage.getItem.mockReturnValueOnce('');
      const result = storage.getItem('user', schema);
      expect(result).toBeNull();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('user');
    });

    it('should return null when the stored value is a non-JSON string', () => {
      const schema = z.string();
      // Mock a non-JSON string as the stored value
      mockLocalStorage.getItem.mockReturnValueOnce('This is not JSON');
      const result = storage.getItem('user', schema);
      expect(result).toBeNull();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('user');
    });
  });

  describe('setItem', () => {
    it('should stringify the value and store it in localStorage', () => {
      const value = { name: 'John', age: 30 };

      storage.setItem('user', value);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(value)
      );
    });

    it('should not store the value if it cannot be stringified (e.g., circular reference)', () => {
      // Create a circular reference
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const circularReference = {} as any;
      circularReference.circularReference = circularReference;

      storage.setItem('circular', circularReference);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should remove the item with the specified key from localStorage', () => {
      storage.removeItem('user');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
    });

    it('should not throw an error when removing a non-existent key', () => {
      // Mock localStorage to confirm no error is thrown
      mockLocalStorage.removeItem.mockImplementation(() => undefined);

      expect(() => storage.removeItem('nonexistentKey')).not.toThrow();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'nonexistentKey'
      );
    });

    it('should log an error when storage.removeItem throws an error', () => {
      const spyError = jest
        .spyOn(Logger.Instance, 'error')
        .mockImplementation(() => undefined);

      // Mock an error during removeItem call
      mockLocalStorage.removeItem.mockImplementationOnce(() => {
        throw new Error('Security error: Access denied');
      });

      storage.removeItem('user');

      expect(spyError).toHaveBeenCalledWith(
        'WebStorage',
        'removeItem',
        expect.stringContaining('Error removing item from the storage')
      );
    });
  });

  describe('clear', () => {
    it('should clear all items from localStorage', () => {
      const spyDebug = jest
        .spyOn(Logger.Instance, 'debug')
        .mockImplementation(() => undefined);

      // Call the clear method
      storage.clear();

      // Assert that localStorage.clear was called
      expect(mockLocalStorage.clear).toHaveBeenCalled();

      // Assert that the debug log was called with the correct parameters
      expect(spyDebug).toHaveBeenCalledWith(
        'WebStorage',
        'clear',
        'Clearing all items from storage.'
      );
    });

    it('should log an error if clearing localStorage fails', () => {
      const spyError = jest
        .spyOn(Logger.Instance, 'error')
        .mockImplementation(() => undefined);

      // Mock the localStorage.clear method to throw an error
      const errorMessage = 'Failed to clear storage';
      mockLocalStorage.clear.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      // Call the clear method
      storage.clear();

      // Assert that the error log was called with the correct parameters
      expect(spyError).toHaveBeenCalledWith(
        'WebStorage',
        'clear',
        `Error clearing the storage: Error: ${errorMessage}`
      );
    });
  });

  describe('setStorage', () => {
    it('should update the storage instance to the provided one', () => {
      const mockSessionStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      storage.setStorage(mockSessionStorage as any as Storage);
      storage.setItem('user', { name: 'John', age: 30 });

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({ name: 'John', age: 30 })
      );
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });
});

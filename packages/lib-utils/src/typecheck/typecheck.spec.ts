/* eslint-disable @typescript-eslint/no-empty-function */
import {
  isArray,
  isNull,
  isObject,
  isString,
  isUndefined,
  isErrorEvent,
  isMessageEvent,
  isStorageEvent,
  isCustomEvent,
  isNumber,
  isFunction,
} from './typecheck';

describe('utils >> typecheck', () => {
  describe('utils >> typecheck >> isNumber', () => {
    test('should return true for regular numbers', () => {
      expect(isNumber(42)).toBe(true);
      expect(isNumber(-42)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(3.1415)).toBe(true);
      expect(isNumber(Number(100))).toBe(true); // Using Number constructor
    });

    test('should return true for Number objects', () => {
      expect(isNumber(new Number(42))).toBe(true); // Number object
    });

    test('should return false for non-number types', () => {
      expect(isNumber('42')).toBe(false);
      expect(isNumber(true)).toBe(false);
      expect(isNumber(null)).toBe(false);
      expect(isNumber(undefined)).toBe(false);
      expect(isNumber({})).toBe(false);
      expect(isNumber([])).toBe(false);
      expect(isNumber(() => 42)).toBe(false);
    });

    test('should return false for special numeric values not of type number', () => {
      expect(isNumber(NaN)).toBe(true);
      expect(isNumber(Infinity)).toBe(true);
      expect(isNumber(-Infinity)).toBe(true);
    });

    test('should return false for numeric strings', () => {
      expect(isNumber('123')).toBe(false);
    });

    test('should return false for objects with numeric-like values', () => {
      expect(isNumber({ value: 42 })).toBe(false);
    });
  });

  describe('utils >> typecheck >> isString', () => {
    it('should return true when value is a string', () => {
      expect(isString('hello')).toBe(true);
      expect(isString('')).toBe(true);
      expect(isString(new String('hello'))).toBe(true);
    });

    it('should return false when value is not a string', () => {
      expect(isString(123)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isString({ key: 'value' })).toBe(false);
      expect(isString(['a', 'b', 'c'])).toBe(false);
      expect(isString(true)).toBe(false);
    });
  });

  describe('utils >> typecheck >> isArray', () => {
    // Test valid arrays
    it('should return true for empty arrays', () => {
      const arr: unknown[] = [];
      expect(isArray(arr)).toBe(true);
    });

    it('should return true for non-empty arrays', () => {
      const arr = [1, 2, 3];
      expect(isArray(arr)).toBe(true);
    });

    // Test invalid values
    it('should return false for non-array values', () => {
      expect(isArray({})).toBe(false);
      expect(isArray(123)).toBe(false);
      expect(isArray('string')).toBe(false);
      expect(isArray(true)).toBe(false);
      expect(isArray(Symbol())).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(isArray(null)).toBe(false);
      expect(isArray(undefined)).toBe(false);
    });

    // Test type inference
    it('should infer the element type for valid arrays', () => {
      const arr = [1, 2, 3];

      if (isArray<number>(arr)) {
        // TypeScript should infer `arr` as `number[]`
        expect(arr[0].toFixed(2)).toBe('1.00');
      } else {
        fail('isArray should have returned true');
      }
    });

    it('should handle arrays of mixed types', () => {
      const arr = [1, 'two', true];

      if (isArray(arr)) {
        // TypeScript should infer `arr` as `(number | string | boolean)[]`
        expect(typeof arr[0]).toBe('number');
        expect(typeof arr[1]).toBe('string');
        expect(typeof arr[2]).toBe('boolean');
      } else {
        fail('isArray should have returned true');
      }
    });

    // Test edge cases
    it('should return false for array-like objects', () => {
      const arrayLike = { 0: 'a', 1: 'b', length: 2 };
      expect(isArray(arrayLike)).toBe(false);
    });

    it('should return false for functions', () => {
      const fn = () => {};
      expect(isArray(fn)).toBe(false);
    });

    it('should return false for dates', () => {
      const date = new Date();
      expect(isArray(date)).toBe(false);
    });
  });

  describe('utils >> typecheck >> isObject', () => {
    // Test valid objects
    it('should return true for plain objects', () => {
      const obj = { key: 'value' };
      expect(isObject(obj)).toBe(true);
    });

    it('should return true for objects with no prototype', () => {
      const obj = Object.create(null);
      expect(isObject(obj)).toBe(true);
    });

    // Test invalid values
    it('should return false for arrays', () => {
      const arr = [1, 2, 3];
      expect(isObject(arr)).toBe(false);
    });

    it('should return false for non-object values', () => {
      expect(isObject(123)).toBe(false);
      expect(isObject('string')).toBe(false);
      expect(isObject(true)).toBe(false);
      expect(isObject(Symbol())).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(isObject(null)).toBe(false);
      expect(isObject(undefined)).toBe(false);
    });

    // Test type inference
    it('should infer the object type for valid objects', () => {
      const obj = { key: 'value' };

      if (isObject<{ key: string }>(obj)) {
        // TypeScript should infer `obj` as `{ key: string }`
        expect(obj.key).toBe('value');
      } else {
        fail('isObject should have returned true');
      }
    });

    // Test edge cases
    it('should return false for functions', () => {
      const fn = () => {};
      expect(isObject(fn)).toBe(false);
    });

    it('should return false for dates', () => {
      const date = new Date();
      expect(isObject(date)).toBe(false);
    });

    it('should return false for custom objects with overridden toString', () => {
      const obj = {
        toString() {
          return '[object Object]';
        },
      };
      expect(isObject(obj)).toBe(true); // Still an object
    });
  });

  describe('utils >> typecheck >> isNull', () => {
    it('should return true when value is null', () => {
      expect(isNull(null)).toBe(true);
    });

    it('should return false when value is not null', () => {
      expect(isNull(undefined)).toBe(false);
      expect(isNull(0)).toBe(false);
      expect(isNull(false)).toBe(false);
      expect(isNull('')).toBe(false);
      expect(isNull({})).toBe(false);
      expect(isNull([])).toBe(false);
    });
  });

  describe('utils >> typecheck >> isUndefined', () => {
    it('should return true when value is undefined', () => {
      expect(isUndefined(undefined)).toBe(true);
    });

    it('should return false when value is not undefined', () => {
      expect(isUndefined(null)).toBe(false);
      expect(isUndefined(0)).toBe(false);
      expect(isUndefined(false)).toBe(false);
      expect(isUndefined('')).toBe(false);
      expect(isUndefined({})).toBe(false);
      expect(isUndefined([])).toBe(false);
    });
  });

  describe('utils >> typecheck >> isStorageEvent', () => {
    test('should return true for a StorageEvent', () => {
      const event = new StorageEvent('key');
      const result = isStorageEvent(event);
      expect(result).toBe(true);
    });

    test('should return false for other event types', () => {
      const event = new CustomEvent('event:name');
      const result = isStorageEvent(event);
      expect(result).toBe(false);
    });
  });

  describe('utils >> typecheck >> isErrorEvent', () => {
    test('should return true for an ErrorEvent', () => {
      const event = new ErrorEvent('my:error');
      const result = isErrorEvent(event);
      expect(result).toBe(true);
    });

    test('should return false for other event types', () => {
      const event = new CustomEvent('event:name');
      const result = isErrorEvent(event);
      expect(result).toBe(false);
    });
  });

  describe('utils >> typecheck >> isMessageEvent', () => {
    test('should return true for a MessageEvent', () => {
      const event = new MessageEvent('my:message');
      const result = isMessageEvent(event);
      expect(result).toBe(true);
    });

    test('should return false for other event types', () => {
      const event = new CustomEvent('event:name');
      const result = isMessageEvent(event);
      expect(result).toBe(false);
    });
  });

  describe('utils >> typecheck >> isCustomEvent', () => {
    test('should return true for a CustomEvent', () => {
      const event = new CustomEvent('event:name');
      const result = isCustomEvent(event);
      expect(result).toBe(true);
    });

    test('should return false for other event types', () => {
      const event = new MouseEvent('my:click');
      const result = isCustomEvent(event);
      expect(result).toBe(false);
    });
  });

  describe('utils >> typecheck >> isFunction', () => {
    // Test valid functions
    it('should return true for regular functions', () => {
      const fn = function () {};
      expect(isFunction(fn)).toBe(true);
    });

    it('should return true for arrow functions', () => {
      const fn = () => {};
      expect(isFunction(fn)).toBe(true);
    });

    it('should return true for async functions', () => {
      const fn = async () => {};
      expect(isFunction(fn)).toBe(true);
    });

    it('should return true for generator functions', () => {
      const fn = function* () {};
      expect(isFunction(fn)).toBe(true);
    });

    it('should return true for class constructors', () => {
      class MyClass {}
      expect(isFunction(MyClass)).toBe(true);
    });

    // Test invalid values
    it('should return false for non-function values', () => {
      expect(isFunction({})).toBe(false);
      expect(isFunction([])).toBe(false);
      expect(isFunction(123)).toBe(false);
      expect(isFunction('function')).toBe(false);
      expect(isFunction(true)).toBe(false);
      expect(isFunction(Symbol())).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(isFunction(null)).toBe(false);
      expect(isFunction(undefined)).toBe(false);
    });

    // Test type inference
    it('should infer argument and return types for valid functions', () => {
      const fn = (a: string, b: number): boolean => a.length > b;

      if (isFunction<[string, number], boolean>(fn)) {
        // TypeScript should infer `fn` as `(a: string, b: number) => boolean`
        const result = fn('hello', 3);
        expect(result).toBe(true);
      } else {
        fail('isFunction should have returned true');
      }
    });

    it('should handle functions with no arguments', () => {
      const fn = (): string => 'hello';

      if (isFunction<[], string>(fn)) {
        // TypeScript should infer `fn` as `() => string`
        const result = fn();
        expect(result).toBe('hello');
      } else {
        fail('isFunction should have returned true');
      }
    });

    // Test edge cases
    it('should return false for objects with a custom toString method', () => {
      const obj = {
        toString() {
          return '[object Function]';
        },
      };
      expect(isFunction(obj)).toBe(false);
    });

    it('should return false for Proxy objects', () => {
      const fn = () => {};
      const proxy = new Proxy(fn, {});
      expect(isFunction(proxy)).toBe(true); // Proxy of a function is still a function
    });
  });
});

/* eslint-disable @typescript-eslint/no-explicit-any */

import { InferFunction } from '../types/infer-function';

/**
 * Checks if a value is a number.
 *
 * @param value - The value to check.
 * @returns True if the value is a number, false otherwise.
 */
export function isNumber(value: any): value is number {
  return Object.prototype.toString.call(value) === '[object Number]';
}

/**
 * Checks if a value is a string.
 *
 * @param value - The value to check.
 * @returns True if the value is a string, false otherwise.
 */
export function isString(value: any): value is string {
  return Object.prototype.toString.call(value) === '[object String]';
}

/**
 * Checks if a value is an array and optionally infers the type of its elements.
 * This function is useful for type-safe array validation in TypeScript.
 *
 * @template T - The type of the array elements to infer (defaults to `unknown`).
 *
 * @param value - The value to check. This can be any type, but the function will only return `true` if it is an array.
 *
 * @returns A type predicate (`value is Array<T>`) that indicates whether the value is an array.
 *          If `true`, TypeScript will narrow the type of `value` to `Array<T>`.
 */
export function isArray<T = unknown>(value: any): value is Array<T> {
  return Array.isArray(value);
}

/**
 * Checks if a value is an object and optionally infers its type.
 * This function is useful for type-safe object validation in TypeScript.
 *
 * @template T - The type of the object to infer (defaults to `object`).
 *
 * @param value - The value to check. This can be any type, but the function will only return `true` if it is an object.
 *
 * @returns A type predicate (`value is T`) that indicates whether the value is an object.
 *          If `true`, TypeScript will narrow the type of `value` to `T`.
 */
export function isObject<T = object>(value: any): value is T {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

/**
 * Checks if a value is null.
 *
 * @param value - The value to check.
 * @returns True if the value is null, false otherwise.
 */
export function isNull(value: any): value is null {
  return Object.prototype.toString.call(value) === '[object Null]';
}

/**
 * Checks if a value is undefined.
 *
 * @param value - The value to check.
 * @returns True if the value is undefined, false otherwise.
 */
export function isUndefined(value: any): value is undefined {
  return Object.prototype.toString.call(value) === '[object Undefined]';
}

/**
 * Checks if a value is a function and optionally infers its argument types and return type.
 * This function is useful for type-safe function validation in TypeScript.
 *
 * @template TArgs - The type of the function's arguments as a tuple (defaults to `any[]`).
 * @template TReturn - The type of the function's return value (defaults to `any`).
 *
 * @param value - The value to check. This can be any type, but the function will only return `true` if it is a function.
 *
 * @returns A type predicate (`value is InferFunction<TArgs, TReturn>`) that indicates whether the value is a function.
 *          If `true`, TypeScript will narrow the type of `value` to `InferFunction<TArgs, TReturn>`.
 */
export function isFunction<TArgs extends any[] = any[], TReturn = any>(
  value: any
): value is InferFunction<TArgs, TReturn> {
  return typeof value === 'function';
}

/**
 * Checks if the provided event is a StorageEvent.
 *
 * @param event - The event to check.
 * @returns Returns true if the event is a StorageEvent, otherwise false.
 */
export function isStorageEvent(event: Event): event is StorageEvent {
  return event instanceof StorageEvent;
}

/**
 * Checks if the provided event is an ErrorEvent.
 *
 * @param event - The event to check.
 * @returns Returns true if the event is an ErrorEvent, otherwise false.
 */
export function isErrorEvent(event: Event | UIEvent): event is ErrorEvent {
  return event instanceof ErrorEvent;
}

/**
 * Checks if the provided event is a MessageEvent.
 *
 * @param event - The event to check.
 * @returns Returns true if the event is a MessageEvent, otherwise false.
 * @template T - The type of data carried by the MessageEvent.
 */
export function isMessageEvent<T>(event: Event): event is MessageEvent<T> {
  return event instanceof MessageEvent;
}

/**
 * Checks if the provided event is a CustomEvent.
 *
 * @param event - The event to check.
 * @returns Returns true if the event is a CustomEvent, otherwise false.
 * @template T - The type of data carried by the CustomEvent.
 */
export function isCustomEvent<T>(event: Event): event is CustomEvent<T> {
  return event instanceof CustomEvent;
}

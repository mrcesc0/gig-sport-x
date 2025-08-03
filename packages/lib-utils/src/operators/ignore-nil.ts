import { OperatorFunction, pipe } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * Creates an RxJS operator function that filters out `null` and `undefined` values from the observable stream.
 *
 * @template T - The type of the values emitted by the observable.
 *
 * @returns An `OperatorFunction` that filters out `null` and `undefined` values, passing through only non-null and non-undefined values of type `T`.
 *
 * @example
 * ```typescript
 * import { of } from 'rxjs';
 * import { ignoreNil } from './path-to-ignoreNil';
 *
 * of(1, 2, null, 3, undefined).pipe(
 *   ignoreNil()
 * ).subscribe(value => console.log(value)); // Output: 1, 2, 3
 * ```
 */
export function ignoreNil<T>(): OperatorFunction<T | null | undefined, T> {
  return pipe(
    filter((value: T | null | undefined): value is T => value != null)
  );
}

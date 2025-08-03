import { of } from 'rxjs';
import { toArray } from 'rxjs/operators';

import { ignoreNil } from './ignore-nil.js';

describe('ignoreNil Operator', () => {
  it('should filter out null values', (done) => {
    const source$ = of(1, null, 2, null, 3);
    const expected = [1, 2, 3];

    source$.pipe(ignoreNil(), toArray()).subscribe({
      next: (result) => {
        expect(result).toEqual(expected);
        done();
      },
      error: done.fail,
    });
  });

  it('should filter out undefined values', (done) => {
    const source$ = of(1, undefined, 2, undefined, 3);
    const expected = [1, 2, 3];

    source$.pipe(ignoreNil(), toArray()).subscribe({
      next: (result) => {
        expect(result).toEqual(expected);
        done();
      },
      error: done.fail,
    });
  });

  it('should filter out both null and undefined values', (done) => {
    const source$ = of(1, null, undefined, 2, null, 3, undefined);
    const expected = [1, 2, 3];

    source$.pipe(ignoreNil(), toArray()).subscribe({
      next: (result) => {
        expect(result).toEqual(expected);
        done();
      },
      error: done.fail,
    });
  });

  it('should pass through values when there are no null or undefined values', (done) => {
    const source$ = of(1, 2, 3);
    const expected = [1, 2, 3];

    source$.pipe(ignoreNil(), toArray()).subscribe({
      next: (result) => {
        expect(result).toEqual(expected);
        done();
      },
      error: done.fail,
    });
  });

  it('should handle an empty observable', (done) => {
    const source$ = of();
    const expected: number[] = [];

    source$.pipe(ignoreNil(), toArray()).subscribe({
      next: (result) => {
        expect(result).toEqual(expected);
        done();
      },
      error: done.fail,
    });
  });

  it('should work with complex types', (done) => {
    const source$ = of({ a: 1 }, null, { a: 2 }, undefined, { a: 3 });
    const expected = [{ a: 1 }, { a: 2 }, { a: 3 }];

    source$.pipe(ignoreNil(), toArray()).subscribe({
      next: (result) => {
        expect(result).toEqual(expected);
        done();
      },
      error: done.fail,
    });
  });
});

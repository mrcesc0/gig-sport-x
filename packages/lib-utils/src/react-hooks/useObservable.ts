import { useState, useEffect } from 'react';
import { Observable, Subscription } from 'rxjs';
import { Logger } from '@gig-sport-x/svc-logger';

/**
 * A custom React hook for consuming an observable and storing its emitted values in state.
 *
 * @template T - The type of the value emitted by the observable.
 * @param observable$ - The observable to subscribe to.
 * @returns - The latest value emitted by the observable, or `undefined` if no initial value is provided.
 */
export function useObservable<T>(observable$: Observable<T>): T | undefined;

/**
 * A custom React hook for consuming an observable and storing its emitted values in state.
 *
 * @template T - The type of the value emitted by the observable.
 * @param observable$ - The observable to subscribe to.
 * @param initialValue - The initial value for the state.
 * @returns - The latest value emitted by the observable.
 */
export function useObservable<T>(
  observable$: Observable<T>,
  initialValue: T
): T;

/**
 * Implementation of the useObservable hook.
 */
export function useObservable<T>(
  observable$: Observable<T>,
  initialValue?: T
): T | undefined {
  const [value, setValue] = useState<T | undefined>(initialValue);

  useEffect(() => {
    const subscription$$: Subscription = observable$.subscribe({
      next: setValue,
      error: (err) => Logger.Instance.error('useObservable', 'subscribe', err),
    });

    return () => subscription$$.unsubscribe();
  }, [observable$]);

  return value;
}

import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map, tap } from 'rxjs/operators';

import { ReactiveStateOptions, StateUpdater } from './reactive-state.types.js';
import { ReactiveEventListener } from '../reactive-event-listeners/reactive-event-listener.service.js';
import { isFunction } from '../typecheck/typecheck.js';
import { StorageService } from '../storage/storage.service.js';
import { ignoreNil } from '../operators/ignore-nil.js';

/**
 * A reactive state management class that provides observable state updates
 * and optional synchronization with storage (e.g., `localStorage`, `sessionStorage`).
 *
 * @template T - The type of the state managed by this class.
 */
export class ReactiveState<T> {
  /** Subscription to listen for storage changes. */
  private storageListener$$?: Subscription;

  /** Internal BehaviorSubject to hold and emit the current state. */
  private stateSubject$: BehaviorSubject<T>;

  /** Configuration options for the reactive state. */
  private options?: ReactiveStateOptions<T>;

  /**
   * Creates an instance of `ReactiveState`.
   *
   * @param initialState - The initial state value.
   * @param options - Optional configuration for the reactive state, including storage synchronization.
   */
  constructor(initialState: T, options?: ReactiveStateOptions<T>) {
    this.options = options;
    this.stateSubject$ = new BehaviorSubject<T>(
      this.resolveInitialState(initialState, options)
    );
    this.syncWithStorage();
  }

  /**
   * Resolves the initial state by checking if a stored value exists in the specified storage.
   * If no stored value is found, the provided `initialState` is used.
   *
   * @param initialState - The fallback state if no stored value is found.
   * @param options - Configuration options, including storage synchronization settings.
   * @returns The resolved initial state.
   */
  private resolveInitialState(
    initialState: T,
    options?: ReactiveStateOptions<T>
  ) {
    if (!options?.syncWithStorage) {
      return initialState;
    }

    const { storageName, key, schema } = options.syncWithStorage;
    const storedValue = StorageService.Instance.fromStorage(
      storageName
    ).getItem(key, schema);

    return storedValue ?? initialState;
  }

  /**
   * Synchronizes the state with the specified storage by listening for changes.
   * If a storage listener already exists, it is unsubscribed before creating a new one.
   */
  private syncWithStorage() {
    this.unsyncFromStorage();

    if (this.options?.syncWithStorage) {
      const { storageName, key, schema } = this.options.syncWithStorage;

      this.storageListener$$ =
        ReactiveEventListener.Instance.listenToStorageItem$(
          storageName,
          key,
          schema,
          true
        )
          .pipe(
            ignoreNil(),
            tap((newState) => this.setState(newState, false))
          )
          .subscribe();
    }
  }

  /**
   * Unsubscribes from the storage listener and cleans up the subscription.
   */
  private unsyncFromStorage() {
    this.storageListener$$?.unsubscribe();
    this.storageListener$$ = undefined;
  }

  /**
   * Cleans up resources by unsubscribing from the storage listener
   * and completing the internal `BehaviorSubject`.
   */
  destroy() {
    this.unsyncFromStorage();
    this.stateSubject$.complete();
  }

  /**
   * Returns an observable that emits the state or a derived value whenever the state changes.
   *
   * @template R - The type of the value returned by the selector (defaults to `T`).
   * @param selector - An optional function to derive a value from the state.
   * @param comparator - An optional comparator function to determine if the derived value has changed.
   * @returns An observable emitting the selected value.
   */
  select$<R>(
    selector: (state: T) => R,
    comparator?: (prev: R, curr: R) => boolean
  ): Observable<R> {
    return this.stateSubject$.pipe(
      map(selector),
      distinctUntilChanged(comparator)
    );
  }

  /**
   * Returns the current state or a derived value from the state.
   *
   * @template R - The type of the value returned by the selector (defaults to `T`).
   * @param selector - An optional function to derive a value from the state.
   * @returns The selected value.
   */
  select<R>(selector: (state: T) => R): R {
    const currentState = this.stateSubject$.getValue();
    return selector(currentState);
  }

  /**
   * Updates the state with a new value or a function that derives the new value from the current state.
   * If the new state is different from the current state, it is emitted to subscribers.
   *
   * @param state - The new state value or a function to derive the new state.
   * @param sync - Whether to synchronize the updated state with storage (defaults to `true`).
   */
  setState(state: T | StateUpdater<T>, sync = true): void {
    const currentState = this.stateSubject$.value;
    const nextState = isFunction(state) ? state(currentState) : state;

    if (nextState === currentState) {
      return;
    }

    this.stateSubject$.next(nextState);

    if (this.options?.syncWithStorage && sync) {
      const { storageName, key } = this.options.syncWithStorage;
      StorageService.Instance.fromStorage(storageName).setItem(key, nextState);
    }
  }
}

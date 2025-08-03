import { z } from 'zod';
import { skip } from 'rxjs/operators';

import { ReactiveState } from './reactive-state.js';
import { ReactiveStateOptions } from './reactive-state.types.js';
import { StorageService } from '../storage/storage.service.js';

interface GenericState {
  count: number;
  message?: string;
}

const genericStateSchema = z.object({
  count: z.number(),
  message: z.string().optional(),
});

describe('ReactiveState', () => {
  describe('ReactiveState >> Storage Synchronization', () => {
    let reactiveState: ReactiveState<GenericState> | undefined = undefined;

    afterEach(() => {
      jest.clearAllMocks();
      reactiveState?.destroy();
      StorageService.Instance.fromStorage('localStorage').clear();
    });

    it('should initialize state from storage when syncWithStorage is enabled', () => {
      const storedValue: GenericState = { count: 42 };
      const initialState: GenericState = { count: 0 };
      const options: ReactiveStateOptions<GenericState> = {
        syncWithStorage: {
          storageName: 'localStorage',
          key: 'testKey',
          schema: genericStateSchema,
        },
      };

      StorageService.Instance.fromStorage('localStorage').setItem(
        'testKey',
        storedValue
      );

      reactiveState = new ReactiveState(initialState, options);
      expect(reactiveState['stateSubject$'].value).toEqual(storedValue);
    });

    it('should fall back to initialState when storage is empty', () => {
      const initialState: GenericState = { count: 0 };
      const options: ReactiveStateOptions<GenericState> = {
        syncWithStorage: {
          storageName: 'localStorage',
          key: 'testKey',
          schema: genericStateSchema,
        },
      };

      reactiveState = new ReactiveState(initialState, options);
      expect(reactiveState['stateSubject$'].value).toEqual(initialState);
    });

    it('should fall back to initialState when stored value is invalid', () => {
      const invalidStoredValue: unknown = { count: 'not a number' };
      const initialState: GenericState = { count: 0 };
      const options: ReactiveStateOptions<GenericState> = {
        syncWithStorage: {
          storageName: 'localStorage',
          key: 'testKey',
          schema: genericStateSchema,
        },
      };

      StorageService.Instance.fromStorage('localStorage').setItem(
        'testKey',
        invalidStoredValue
      );

      reactiveState = new ReactiveState(initialState, options);
      expect(reactiveState['stateSubject$'].value).toEqual(initialState);
    });

    it('should synchronize state changes with storage', () => {
      const initialState: GenericState = { count: 0 };
      const options: ReactiveStateOptions<GenericState> = {
        syncWithStorage: {
          storageName: 'localStorage',
          key: 'testKey',
          schema: genericStateSchema,
        },
      };

      reactiveState = new ReactiveState(initialState, options);
      reactiveState.setState({ count: 1 });

      const storedValue = StorageService.Instance.fromStorage(
        'localStorage'
      ).getItem('testKey', genericStateSchema);
      expect(storedValue).toEqual({ count: 1 });
    });

    it('should reflect state changes from other browsing contexts', (done) => {
      const initialState: GenericState = { count: 0 };
      const options: ReactiveStateOptions<GenericState> = {
        syncWithStorage: {
          storageName: 'localStorage',
          key: 'testKey',
          schema: genericStateSchema,
        },
      };

      reactiveState = new ReactiveState(initialState, options);

      reactiveState
        .select$((_state) => _state)
        .pipe(skip(1))
        .subscribe((state) => {
          expect(state).toEqual({ count: 1 });
          done();
        });

      // Simulate a storage event from another browsing context
      const storageEvent = new StorageEvent('storage', {
        key: 'testKey',
        newValue: JSON.stringify({ count: 1 }),
        storageArea: localStorage,
      });
      window.dispatchEvent(storageEvent);
    });
  });

  describe('ReactiveState >> State Updates', () => {
    let reactiveState: ReactiveState<GenericState> | undefined = undefined;

    afterEach(() => {
      jest.clearAllMocks();
      reactiveState?.destroy();
    });

    it('should not emit if the state does not change', () => {
      const initialState: GenericState = { count: 0 };
      const nextSpy = jest.fn();

      reactiveState = new ReactiveState(initialState);

      reactiveState
        .select$((state) => state.count)
        .pipe(skip(1)) // Skip the first emission
        .subscribe({ next: nextSpy });

      reactiveState.setState(initialState);

      expect(nextSpy).not.toHaveBeenCalled();
    });

    it('should emit to multiple subscribers with setState method', (done) => {
      const initialState: GenericState = { count: 0 };
      const newState: GenericState = { count: 2 };

      reactiveState = new ReactiveState(initialState);

      const subscriber1 = reactiveState
        .select$((state) => state.count)
        .pipe(skip(1))
        .subscribe((count) => {
          expect(count).toBe(newState.count);
        });

      const subscriber2 = reactiveState
        .select$((state) => state.count)
        .pipe(skip(1))
        .subscribe((count) => {
          expect(count).toBe(newState.count);
          done();
        });

      reactiveState.setState(newState);

      // Cleanup
      subscriber1.unsubscribe();
      subscriber2.unsubscribe();
    });
  });

  describe('ReactiveState >> Function-Based State Updates', () => {
    let reactiveState: ReactiveState<GenericState> | undefined = undefined;

    afterEach(() => {
      jest.clearAllMocks();
      reactiveState?.destroy();
    });

    it('should support function-based state updates', () => {
      const initialState: GenericState = { count: 0 };
      const emittedValues: number[] = [];
      reactiveState = new ReactiveState(initialState);

      reactiveState
        .select$((state) => state.count)
        .pipe(skip(1))
        .subscribe((count) => emittedValues.push(count));

      reactiveState.setState((prevState) => ({ count: prevState.count + 1 }));
      reactiveState.setState((prevState) => ({ count: prevState.count + 1 }));

      expect(emittedValues).toEqual([1, 2]);
    });
  });

  describe('ReactiveState >> Custom Comparator Behavior', () => {
    let reactiveState: ReactiveState<GenericState> | undefined = undefined;

    afterEach(() => {
      jest.clearAllMocks();
      reactiveState?.destroy();
    });

    it('should use a custom comparator for deep property comparison', () => {
      const initialState: GenericState = { count: 0, message: 'Hello' };
      const nextSpy = jest.fn();
      reactiveState = new ReactiveState(initialState);

      reactiveState
        .select$(
          (state) => state.message,
          (prev, curr) => prev === curr
        )
        .pipe(skip(1))
        .subscribe({ next: nextSpy });

      reactiveState.setState({ count: 1, message: 'Hello' }); // No change in `message`
      expect(nextSpy).not.toHaveBeenCalled();

      reactiveState.setState({ count: 2, message: 'World' }); // Change in `message`
      expect(nextSpy).toHaveBeenCalledWith('World');
    });
  });

  describe('ReactiveState >> Multiple Subscribers with Different Selectors', () => {
    let reactiveState: ReactiveState<GenericState> | undefined = undefined;

    afterEach(() => {
      jest.clearAllMocks();
      reactiveState?.destroy();
    });

    it('should handle multiple subscribers with different selectors', () => {
      const initialState: GenericState = { count: 0, message: 'Hello' };
      const countSpy = jest.fn();
      const messageSpy = jest.fn();
      reactiveState = new ReactiveState(initialState);

      reactiveState.select$((state) => state.count).subscribe(countSpy);
      reactiveState.select$((state) => state.message).subscribe(messageSpy);

      reactiveState.setState({ count: 1, message: 'World' });

      expect(countSpy).toHaveBeenCalledWith(1);
      expect(messageSpy).toHaveBeenCalledWith('World');
    });
  });

  describe('ReactiveState >> Destruction', () => {
    it('should clean up resources on destruction', () => {
      const initialState: GenericState = { count: 0 };
      const options: ReactiveStateOptions<GenericState> = {
        syncWithStorage: {
          storageName: 'localStorage',
          key: 'testKey',
          schema: genericStateSchema,
        },
      };

      const reactiveState = new ReactiveState(initialState, options);
      reactiveState.destroy();

      expect(reactiveState['storageListener$$']).toBeUndefined();
      expect(reactiveState['stateSubject$'].isStopped).toBe(true);
    });
  });

  describe('ReactiveState >> Selector and Comparator', () => {
    let reactiveState: ReactiveState<GenericState> | undefined = undefined;

    afterEach(() => {
      jest.clearAllMocks();
      reactiveState?.destroy();
    });

    it('should use a custom comparator to prevent unnecessary emissions', () => {
      const initialState: GenericState = { count: 0 };
      const nextSpy = jest.fn();
      reactiveState = new ReactiveState(initialState);

      reactiveState
        .select$(
          (state) => state.count,
          (prev, curr) => prev === curr
        )
        .pipe(skip(1))
        .subscribe({ next: nextSpy });

      reactiveState.setState({ count: 0 }); // No change
      expect(nextSpy).not.toHaveBeenCalled();

      reactiveState.setState({ count: 1 }); // Change
      expect(nextSpy).toHaveBeenCalledWith(1);
    });

    it('should use a custom selector to derive values from the state', () => {
      const initialState: GenericState = { count: 0, message: 'Hello' };
      const nextSpy = jest.fn();
      reactiveState = new ReactiveState(initialState);

      reactiveState
        .select$((state) => `${state.message}-${state.count}`)
        .pipe(skip(1))
        .subscribe({ next: nextSpy });

      reactiveState.setState({ count: 1, message: 'Hello' });
      expect(nextSpy).toHaveBeenCalledWith('Hello-1');
    });
  });

  describe('ReactiveState >> Initialization Without Synchronization', () => {
    let reactiveState: ReactiveState<GenericState> | undefined = undefined;

    afterEach(() => {
      jest.clearAllMocks();
      reactiveState?.destroy();
    });

    it('should initialize state without storage synchronization', () => {
      const initialState: GenericState = { count: 0 };
      reactiveState = new ReactiveState(initialState);

      expect(reactiveState['stateSubject$'].value).toEqual(initialState);
    });
  });

  describe('ReactiveState >> select', () => {
    let reactiveState: ReactiveState<GenericState> | undefined = undefined;

    afterEach(() => {
      jest.clearAllMocks();
      reactiveState?.destroy();
    });

    it('should return the current state when no selector is provided', () => {
      const initialState: GenericState = { count: 0, message: 'Hello' };
      reactiveState = new ReactiveState(initialState);

      const currentState = reactiveState.select((_state) => _state);
      expect(currentState).toEqual(initialState);
    });

    it('should return a derived value using a selector function', () => {
      const initialState: GenericState = { count: 10, message: 'Hello' };
      reactiveState = new ReactiveState(initialState);

      const derivedValue = reactiveState.select((state) => state.count * 2);
      expect(derivedValue).toBe(20);
    });

    it('should reflect state changes when using the select method', () => {
      const initialState: GenericState = { count: 0, message: 'Hello' };
      reactiveState = new ReactiveState(initialState);

      // Initial state
      expect(reactiveState.select((state) => state.count)).toBe(0);

      // Update state
      reactiveState.setState({ count: 5, message: 'World' });

      // Derived value after update
      expect(reactiveState.select((state) => state.count)).toBe(5);
      expect(reactiveState.select((state) => state.message)).toBe('World');
    });

    it('should return the initial state if no updates have been made', () => {
      const initialState: GenericState = { count: 42, message: 'Initial' };
      reactiveState = new ReactiveState(initialState);

      expect(reactiveState.select((_state) => _state)).toEqual(initialState);
      expect(reactiveState.select((state) => state.count)).toBe(42);
      expect(reactiveState.select((state) => state.message)).toBe('Initial');
    });
  });

  describe('ReactiveState >> Rapid State Updates', () => {
    let reactiveState: ReactiveState<GenericState> | undefined = undefined;

    afterEach(() => {
      jest.clearAllMocks();
      reactiveState?.destroy();
    });

    it('should handle multiple rapid state updates correctly', () => {
      const initialState: GenericState = { count: 0 };
      const emittedValues: number[] = [];
      reactiveState = new ReactiveState(initialState);

      reactiveState
        .select$((state) => state.count)
        .pipe(skip(1))
        .subscribe((count) => emittedValues.push(count));

      reactiveState.setState({ count: 1 });
      reactiveState.setState({ count: 2 });
      reactiveState.setState({ count: 3 });

      expect(emittedValues).toEqual([1, 2, 3]);
    });
  });

  describe('ReactiveState >> Unsubscribing from Observables', () => {
    let reactiveState: ReactiveState<GenericState> | undefined = undefined;

    afterEach(() => {
      jest.clearAllMocks();
      reactiveState?.destroy();
    });

    it('should unsubscribe all subscribers on destruction', () => {
      const initialState: GenericState = { count: 0 };
      const nextSpy = jest.fn();
      reactiveState = new ReactiveState(initialState);

      reactiveState.select$((_state) => _state).subscribe({ next: nextSpy });

      expect(nextSpy).toHaveBeenCalledTimes(1);

      reactiveState.destroy();

      reactiveState.setState({ count: 1 });

      expect(nextSpy).toHaveBeenCalledTimes(1);
    });
  });
});

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from '@gig-sport-x/svc-logger';
import { TestScheduler } from 'rxjs/testing';
import { z } from 'zod';

import { ReactiveEventListener } from './reactive-event-listener.service.js';
import { StorageService } from '../storage/storage.service.js';

describe('ReactiveEventListener', () => {
  const allowedOrigins = ['http://localhost:3000'];

  let reactiveEventListener: ReactiveEventListener;
  let scheduler: TestScheduler;

  beforeEach(() => {
    reactiveEventListener = ReactiveEventListener.Instance;
    jest
      .spyOn(StorageService.Instance.fromStorage('localStorage'), 'getItem')
      .mockClear();
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jest.spyOn(Logger.Instance, 'error').mockImplementation(() => {});
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  afterEach(() => {
    (reactiveEventListener as any) = undefined;
    StorageService.Instance.fromStorage('localStorage').clear();
    StorageService.Instance.fromStorage('sessionStorage').clear();
    scheduler.flush();
    jest.clearAllMocks();
  });

  describe('ReactiveEventListener >> listenToCustomEvent$', () => {
    it('should listen for CustomEvent with specified type', (done) => {
      const eventName = 'app:init';
      const eventPayload = { config: 'test' };

      reactiveEventListener
        .listenToCustomEvent$<typeof eventPayload>(eventName)
        .subscribe((event) => {
          expect(event.type).toEqual(eventName);
          expect(event.detail).toEqual(eventPayload);
          done();
        });

      document.dispatchEvent(
        new CustomEvent(eventName, { detail: eventPayload })
      );
    });

    it('should not emit events of different types', (done) => {
      const eventName = 'app:stop';

      reactiveEventListener
        .listenToCustomEvent$('app:init')
        .subscribe(() => fail('Should not emit event'));

      document.dispatchEvent(new CustomEvent(eventName, {}));

      setTimeout(() => done(), 100);
    });
  });

  describe('ReactiveEventListener >> listenToStorageEvent$', () => {
    it('should listen for StorageEvent with a specific key', (done) => {
      const key = 'testKey';
      const newValue = 'value';

      reactiveEventListener
        .listenToStorageEvent$('localStorage', key)
        .subscribe((event) => {
          expect(event.type).toBe('storage');
          expect(event.key).toBe(key);
          expect(event.newValue).toBe(newValue);
          done(); // Complete the test after receiving the event
        });

      // Dispatch a valid StorageEvent
      window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue,
          storageArea: window.localStorage,
        })
      );
    });

    it('should ignore events with a different key', (done) => {
      const key = 'testKey';
      const wrongKey = 'wrongKey';
      const newValue = 'value';

      const subscription = reactiveEventListener
        .listenToStorageEvent$('localStorage', key)
        .subscribe({
          next: () => {
            fail('Should not emit for a different key');
          },
        });

      // Dispatch an event with a different key
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: wrongKey,
          newValue,
          storageArea: window.localStorage,
        })
      );

      // Unsubscribe after a short delay to clean up
      setTimeout(() => {
        subscription.unsubscribe();
        done();
      }, 100);
    });

    it('should listen for all StorageEvents if no key is specified', (done) => {
      reactiveEventListener
        .listenToStorageEvent$('localStorage')
        .subscribe((event) => {
          expect(event.type).toBe('storage');
          done(); // Complete the test after receiving the event
        });

      // Dispatch a StorageEvent without specifying a key
      window.dispatchEvent(
        new StorageEvent('storage', {
          storageArea: window.localStorage,
        })
      );
    });

    it('should ignore events from a different storage area', (done) => {
      const key = 'testKey';
      const newValue = 'value';

      const subscription = reactiveEventListener
        .listenToStorageEvent$('localStorage', key)
        .subscribe({
          next: () => {
            fail('Should not emit for a different storage area');
          },
        });

      // Dispatch a StorageEvent from sessionStorage instead of localStorage
      window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue,
          storageArea: window.sessionStorage,
        })
      );

      // Unsubscribe after a short delay to clean up
      setTimeout(() => {
        subscription.unsubscribe();
        done();
      }, 100);
    });

    it('should filter events based on storageName', (done) => {
      const key = 'testKey';
      const newValue = 'value';

      reactiveEventListener
        .listenToStorageEvent$('sessionStorage', key)
        .subscribe((event) => {
          expect(event.type).toBe('storage');
          expect(event.key).toBe(key);
          expect(event.newValue).toBe(newValue);
          done(); // Complete the test after receiving the event
        });

      // Dispatch a valid StorageEvent for sessionStorage
      window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue,
          storageArea: window.sessionStorage,
        })
      );
    });

    it('should ignore invalid events', (done) => {
      const subscription = reactiveEventListener
        .listenToStorageEvent$('localStorage', 'testKey')
        .subscribe({
          next: () => {
            fail('Should not emit for invalid events');
          },
        });

      // Dispatch an invalid event (e.g., missing key or storageArea)
      window.dispatchEvent(new Event('storage'));

      // Unsubscribe after a short delay to clean up
      setTimeout(() => {
        subscription.unsubscribe();
        done();
      }, 100);
    });
  });

  describe('ReactiveEventListener >> listenToStorageItem$', () => {
    it('should emit the initial value of the storage item and subsequent values when the item changes', () => {
      scheduler.run(({ cold, expectObservable }) => {
        const key = 'user';
        const initialValue = { name: 'Alice', age: 25 };
        const newValue = { name: 'Bob', age: 30 };
        const schema = z.object({
          name: z.string(),
          age: z.number(),
        });

        // Mock the initial value in localStorage
        jest
          .spyOn(StorageService.Instance.fromStorage('localStorage'), 'getItem')
          .mockReturnValue(initialValue);

        const item$ = reactiveEventListener.listenToStorageItem$(
          'localStorage',
          key,
          schema
        );

        // Simulate a new StorageEvent after 50ms
        cold('--b|', {
          b: new StorageEvent('storage', {
            key,
            newValue: JSON.stringify(newValue),
            storageArea: window.localStorage,
          }),
        }).subscribe((event) => {
          window.dispatchEvent(event);
        });

        // Expect two emissions: the initial value and the updated value
        expectObservable(item$).toBe('a-b', {
          a: initialValue,
          b: newValue,
        });
      });
    });

    it('should skip emitting the initial value if skipFirst is true', () => {
      scheduler.run(({ cold, expectObservable }) => {
        const key = 'user';
        const newValue = { name: 'Bob', age: 30 };
        const schema = z.object({
          name: z.string(),
          age: z.number(),
        });

        // Mock an initial value in localStorage
        jest
          .spyOn(StorageService.Instance.fromStorage('localStorage'), 'getItem')
          .mockReturnValue({ name: 'Alice', age: 25 });

        const item$ = reactiveEventListener.listenToStorageItem$(
          'localStorage',
          key,
          schema,
          true
        );

        // Simulate a new StorageEvent after 50ms
        cold('--b|', {
          b: new StorageEvent('storage', {
            key,
            newValue: JSON.stringify(newValue),
            storageArea: window.localStorage,
          }),
        }).subscribe((event) => {
          window.dispatchEvent(event);
        });

        // Expect only one emission: the updated value
        expectObservable(item$).toBe('--b', {
          b: newValue,
        });
      });
    });

    it('should handle invalid JSON values gracefully', () => {
      scheduler.run(({ cold, expectObservable }) => {
        const key = 'user';
        const schema = z.object({
          name: z.string(),
          age: z.number(),
        });

        // Mock an invalid initial value in localStorage
        jest
          .spyOn(StorageService.Instance.fromStorage('localStorage'), 'getItem')
          .mockReturnValue(null);

        const item$ = reactiveEventListener.listenToStorageItem$(
          'localStorage',
          key,
          schema
        );

        // Simulate a StorageEvent with invalid JSON
        cold('--b|', {
          b: new StorageEvent('storage', {
            key,
            newValue: 'invalid-json',
            storageArea: window.localStorage,
          }),
        }).subscribe((event) => {
          window.dispatchEvent(event);
        });

        // Expect the emitted value to be null due to parsing failure
        expectObservable(item$).toBe('a-b', {
          a: null,
          b: null,
        });
      });
    });

    it('should handle schema validation errors gracefully', () => {
      scheduler.run(({ cold, expectObservable }) => {
        const key = 'user';
        const schema = z.object({
          name: z.string(),
          age: z.number(),
        });

        const item$ = reactiveEventListener.listenToStorageItem$(
          'localStorage',
          key,
          schema
        );

        // Simulate a StorageEvent with a value that fails schema validation
        cold('--b|', {
          b: new StorageEvent('storage', {
            key,
            newValue: JSON.stringify({ name: 'Alice' }), // Missing 'age' property
            storageArea: window.localStorage,
          }),
        }).subscribe((event) => {
          window.dispatchEvent(event);
        });

        // Expect the emitted value to be null due to validation failure
        expectObservable(item$).toBe('a-b', {
          a: null,
          b: null,
        });
      });
    });

    it('should handle null or undefined values from storage', () => {
      scheduler.run(({ cold, expectObservable }) => {
        const key = 'user';
        const schema = z.object({
          name: z.string(),
          age: z.number(),
        });

        // Mock an empty initial value in localStorage
        jest
          .spyOn(StorageService.Instance.fromStorage('localStorage'), 'getItem')
          .mockReturnValue(null);

        const item$ = reactiveEventListener.listenToStorageItem$(
          'localStorage',
          key,
          schema
        );

        // Simulate a StorageEvent with null newValue
        cold('--b|', {
          b: new StorageEvent('storage', {
            key,
            newValue: null,
            storageArea: window.localStorage,
          }),
        }).subscribe((event) => {
          window.dispatchEvent(event);
        });

        // Expect both emissions to be null
        expectObservable(item$).toBe('a-b', {
          a: null,
          b: null,
        });
      });
    });
  });

  describe('ReactiveEventListener >> listenToErrorEvent$', () => {
    it('should listen for ErrorEvent', (done) => {
      reactiveEventListener.listenToErrorEvent$().subscribe((event) => {
        expect(event.type).toEqual('error');
        done();
      });

      window.dispatchEvent(new ErrorEvent('error'));
    });
  });

  describe('ReactiveEventListener >> listenToMessageEvent$', () => {
    it('should listen for MessageEvent with allowed origin', (done) => {
      const message = 'Hello!';
      const subscription = reactiveEventListener
        .listenToMessageEvent$<string>(allowedOrigins)
        .subscribe((event) => {
          expect(event.data).toEqual(message);
          expect(event.origin).toEqual(allowedOrigins[0]);
          subscription.unsubscribe();
          done();
        });

      /**
       * @see{@link https://github.com/jsdom/jsdom/issues/2745#issuecomment-1207414024}
       */
      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          origin: allowedOrigins[0],
          data: message,
        })
      );
    });

    it('should not listen for MessageEvent with disallowed origin', (done) => {
      const message = 'Hello!';
      const subscription = reactiveEventListener
        .listenToMessageEvent$(allowedOrigins)
        .subscribe(() => {
          subscription.unsubscribe();
          fail('Should not emit event');
        });

      window.dispatchEvent(
        new MessageEvent('message', {
          source: window,
          origin: 'non-existing-origin',
          data: message,
        })
      );

      setTimeout(() => done(), 100);
    });
  });

  describe('ReactiveEventListener >> listenToInputEvent$', () => {
    it('should listen for InputEvent', (done) => {
      const inputElement = document.createElement('input');
      const inputEvent = new InputEvent('input');

      reactiveEventListener
        .listenToInputEvent$(inputElement)
        .subscribe((event) => {
          expect(event.type).toEqual('input');
          done();
        });

      inputElement.dispatchEvent(inputEvent);
    });
  });

  describe('ReactiveEventListener >> listenToChangeEvent$', () => {
    let testElement: HTMLInputElement;

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      jest.spyOn(Logger.Instance, 'debug').mockImplementation(() => {});
      testElement = document.createElement('input');
      document.body.appendChild(testElement); // Ensure the element is part of the DOM
    });

    afterEach(() => {
      document.body.removeChild(testElement);
    });

    it('should emit events when the "change" event is triggered', (done) => {
      const event$ = reactiveEventListener.listenToChangeEvent$(testElement);

      event$.subscribe((event) => {
        expect(event.type).toBe('change');
        done();
      });

      // Simulate a change event
      const event = new Event('change', { bubbles: true });
      testElement.dispatchEvent(event);
    });

    it('should debounce events based on the specified debounceMs', (done) => {
      const debounceMs = 50;
      const event$ = reactiveEventListener.listenToChangeEvent$(
        testElement,
        debounceMs
      );

      let emissionCount = 0;
      event$.subscribe(() => {
        emissionCount++;
        if (emissionCount === 1) {
          // Ensure only one emission occurs despite multiple rapid events
          expect(emissionCount).toBe(1);
          done();
        }
      });

      // Simulate multiple rapid change events
      const intervalId = setInterval(() => {
        testElement.dispatchEvent(new Event('change', { bubbles: true }));
      }, 10);

      // Stop simulating events after the debounce period
      setTimeout(() => {
        clearInterval(intervalId);
      }, debounceMs * 2);
    });

    it('should log the event using Logger.Instance.debug', () => {
      const event$ = reactiveEventListener.listenToChangeEvent$(testElement);

      event$.subscribe(() => {
        // Verify that the debug method was called with the correct arguments
        expect(Logger.Instance.debug).toHaveBeenCalledWith(
          'ReactiveEventListener',
          'listenToChangeEvent$',
          expect.any(Event)
        );
      });

      // Simulate a change event
      testElement.dispatchEvent(new Event('change', { bubbles: true }));
    });

    it('should not emit if no "change" event is triggered', (done) => {
      const event$ = reactiveEventListener.listenToChangeEvent$(testElement);

      // Subscribe to the observable
      const subscription = event$.subscribe({
        next: () => {
          fail('Should not emit without a "change" event');
        },
        complete: () => {
          // This should not be called, as no event is triggered
          fail('Observable should not complete without an event');
        },
      });

      // Use setTimeout to simulate waiting for a short duration
      setTimeout(() => {
        subscription.unsubscribe(); // Clean up the subscription
        done(); // Mark the test as completed
      }, 100); // Wait for 100ms to ensure no events are emitted
    });
  });
});

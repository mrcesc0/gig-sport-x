import { ZodType } from 'zod';
import { Observable, fromEvent, of } from 'rxjs';
import { debounceTime, filter, map, mergeWith, tap } from 'rxjs/operators';
import { Logger } from '@gig-sport-x/svc-logger';

import { StorageService } from '../storage/storage.service.js';
import { StorageName } from '../storage/storage.types.js';
import {
  isCustomEvent,
  isStorageEvent,
  isErrorEvent,
  isMessageEvent,
} from '../typecheck/typecheck.js';

export class ReactiveEventListener {
  private static _instance: ReactiveEventListener;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static get Instance() {
    return (
      ReactiveEventListener._instance ||
      (ReactiveEventListener._instance = new ReactiveEventListener())
    );
  }

  /**
   * Listens to custom events of a specified type.
   * @param eventName - The name of the custom event to listen for.
   * @param [target=document] - The event target to listen on. Defaults to the document.
   * @returns An observable stream of CustomEvent instances.
   * @template T - The type of data carried by the CustomEvent.
   */
  listenToCustomEvent$<T>(eventName: string, target = document) {
    return fromEvent(target, eventName).pipe(
      filter((event: Event): event is CustomEvent<T> => isCustomEvent(event)),
      tap((event) => {
        Logger.Instance.debug(
          'ReactiveEventListener',
          'listenToCustomEvent$',
          event
        );
      })
    );
  }

  /**
   * Listens to storage events.
   * @param storageName - The storage type ('localStorage' or 'sessionStorage').
   * @param [key=null] - The key to filter storage events by. If provided, only events with matching keys will be emitted.
   * @returns An observable stream of StorageEvent instances.
   * @note This won't work on the same browsing context that is making the changes — it is really a way for other browsing contexts on the domain using the storage to sync any changes that are made.
   * Browsing contexts on other domains can't access the same storage objects.
   * Reference: {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event}
   */
  listenToStorageEvent$(
    storageName: Extract<StorageName, 'localStorage' | 'sessionStorage'>,
    key: string | null = null
  ) {
    const storage =
      storageName === 'localStorage' ? localStorage : sessionStorage;

    return fromEvent(window, 'storage').pipe(
      filter((event: Event): event is StorageEvent => {
        if (!isStorageEvent(event)) return false;
        if (event.storageArea !== storage) return false;
        if (key && event.key !== key) return false;
        return true;
      })
    );
  }

  /**
   * Listens to changes in a specific storage item identified by the provided key.
   * Emits the current value of the item on subscription, and subsequent values whenever the item changes.
   * @param key - The key of the storage item to listen for changes.
   * @param schema - The Zod schema used to validate the data retrieved from the storage item.
   * @returns An observable stream that emits the value of the storage item. Returns null if the storage item is not set or deleted.
   * @template T - The type of data expected to be stored in the storage item.
   * @note This won't work on the same browsing context that is making the changes — it is really a way for other browsing contexts on the domain using the storage to sync any changes that are made.
   * Browsing contexts on other domains can't access the same storage objects.
   * Reference: {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event}
   */
  listenToStorageItem$<T>(
    storageName: Extract<StorageName, 'localStorage' | 'sessionStorage'>,
    key: string,
    schema: ZodType<T>,
    skipFirst = false
  ): Observable<T | null> {
    const storageService = StorageService.Instance.fromStorage(storageName);

    const item$ = this.listenToStorageEvent$(storageName, key).pipe(
      map((event) => {
        if (event.newValue !== null) {
          try {
            const item = JSON.parse(event.newValue);
            const safeItem = schema.parse(item);
            return safeItem;
          } catch (error: unknown) {
            Logger.Instance.error(
              'ReactiveEventListener',
              'listenToStorageItem$',
              error
            );
            return null;
          }
        }

        return null;
      })
    );

    if (!skipFirst) {
      const initialItem$ = of(storageService.getItem(key, schema));
      return initialItem$.pipe(mergeWith(item$));
    }

    return item$;
  }

  /**
   * Listens to error events.
   * @returns An observable stream of ErrorEvent instances.
   */
  listenToErrorEvent$() {
    return fromEvent(window, 'error').pipe(
      filter((event: Event | UIEvent): event is ErrorEvent =>
        isErrorEvent(event)
      ),
      tap((event) => {
        Logger.Instance.debug(
          'ReactiveEventListener',
          'listenToErrorEvent$',
          event
        );
      })
    );
  }

  /**
   * Listens to message events from specified origins.
   * @param allowedOrigins - An array of allowed origins for message events.
   * @returns An observable stream of MessageEvent instances.
   * @template T - The type of data carried by the MessageEvent.
   */
  listenToMessageEvent$<T>(allowedOrigins: string[]) {
    return fromEvent(window, 'message').pipe(
      filter(
        (event: Event): event is MessageEvent<T> =>
          isMessageEvent<T>(event) && allowedOrigins.includes(event.origin)
      ),
      tap((event) => {
        Logger.Instance.debug(
          'ReactiveEventListener',
          'listenToMessageEvent$',
          event
        );
      })
    );
  }

  /**
   * Listens for input events on a specified HTML input element, with optional debouncing.
   *
   * @param input - The HTML input element to listen for input events on.
   * @param debounceMs - The debounce time in milliseconds. Defaults to 20 milliseconds.
   * @returns An Observable that emits InputEvents from the specified input element, debounced by the specified time.
   *
   */
  listenToInputEvent$(input: HTMLInputElement, debounceMs = 20) {
    return fromEvent<InputEvent>(input, 'input').pipe(
      debounceTime(debounceMs),
      tap((event) => {
        Logger.Instance.debug(
          'ReactiveEventListener',
          'listenToInputEvent$',
          event
        );
      })
    );
  }

  /**
   * Listens to `change` events on a given HTML element and returns an observable
   * that emits the events after applying a debounce period.
   *
   * @param element - The HTML element to listen for `change` events on.
   * @param debounceMs - The debounce time in milliseconds. Events will be emitted
   *                     only if there is a pause of `debounceMs` milliseconds
   *                     between emissions. Defaults to 20 milliseconds.
   * @returns An observable that emits `change` events from the specified element.
   *
   */
  listenToChangeEvent$(element: HTMLElement, debounceMs = 20) {
    return fromEvent<Event>(element, 'change').pipe(
      debounceTime(debounceMs),
      tap((event) => {
        Logger.Instance.debug(
          'ReactiveEventListener',
          'listenToChangeEvent$',
          event
        );
      })
    );
  }
}

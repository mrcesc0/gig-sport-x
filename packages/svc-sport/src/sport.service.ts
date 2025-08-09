import {
  SportEvent,
  SportEventsResponseSchema,
} from '@gig-sport-x/lib-schemas';
import { ReactiveState, ignoreNil } from '@gig-sport-x/lib-utils';
import { Logger } from '@gig-sport-x/svc-logger';
import { map, Observable } from 'rxjs';

/**
 * Singleton service for managing and streaming sport events data.
 *
 * The service uses a private constructor and static getter (`Instance`) to ensure that
 * only one instance of the service exists during the application lifecycle (singleton pattern).
 */
export class SportService {
  /** Singleton instance of the SportService */
  private static _instance: SportService;

  /** Internal reactive state that holds the list of sport events or null */
  private _events: ReactiveState<SportEvent[] | null>;

  /**
   * Private constructor to enforce singleton pattern.
   *
   * Initializes the reactive state and begins fetching the events from a static mock file.
   */
  private constructor() {
    this._events = new ReactiveState<SportEvent[] | null>(null);

    this.fetchEvents$().subscribe({
      next: (events) => this._events.setState(events),
      error: (error) =>
        Logger.Instance.error('SportService', 'fetchEvents$', error),
    });
  }

  /**
   * Accessor for the singleton instance of `SportService`.
   */
  static get Instance(): SportService {
    return (
      SportService._instance || (SportService._instance = new SportService())
    );
  }

  /**
   * Observable stream of valid `SportEvent` objects.
   *
   * Filters out `null` values from the state and only includes events that have a defined `label` field.
   */
  get events$(): Observable<SportEvent[]> {
    return this._events
      .select$((events) => events)
      .pipe(
        ignoreNil(),
        map((events) => events.filter((event) => event.label))
      );
  }

  /**
   * Fetches and parses the sport events from a static JSON mock file.
   *
   * This function imports `data.json`, validates it against
   * the `SportEventsResponseSchema`, and emits the parsed `SportEvent[]`.
   */
  private fetchEvents$(): Observable<SportEvent[]> {
    return new Observable<SportEvent[]>((subscriber) => {
      import('../__mocks__/data.json', { assert: { type: 'json' } })
        .then((module) => {
          try {
            const parsed = SportEventsResponseSchema.parse(module.default);
            subscriber.next(parsed.events);
            subscriber.complete();
          } catch (error) {
            subscriber.error(error);
          }
        })
        .catch((error) => {
          subscriber.error(error);
        });
    });
  }
}

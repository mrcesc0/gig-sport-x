import {
  SportEvent,
  SportEventsResponseSchema,
} from '@gig-sport-x/lib-schemas';
import { ReactiveState, ignoreNil } from '@gig-sport-x/lib-utils';
import { Logger } from '@gig-sport-x/svc-logger';
import { map, Observable } from 'rxjs';

export class SportService {
  private static _instance: SportService;
  private _events: ReactiveState<SportEvent[] | null>;

  private constructor() {
    this._events = new ReactiveState<SportEvent[] | null>(null);

    this.fetchEvents$().subscribe({
      next: (events) => this._events.setState(events),
      error: (error) =>
        Logger.Instance.error('SportService', 'fetchEvents$', error),
    });
  }

  static get Instance(): SportService {
    return (
      SportService._instance || (SportService._instance = new SportService())
    );
  }

  get events$(): Observable<SportEvent[]> {
    return this._events
      .select$((events) => events)
      .pipe(
        ignoreNil(),
        map((events) => events.filter((event) => event.label))
      );
  }

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

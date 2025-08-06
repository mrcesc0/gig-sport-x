import {
  SportEvent,
  SportEventsResponseSchema,
} from '@gig-sport-x/lib-schemas';
import { ReactiveState } from '@gig-sport-x/lib-utils';
import { Logger } from '@gig-sport-x/svc-logger';
import { Observable } from 'rxjs';

export class SportService {
  private static _instance: SportService;
  private _events: ReactiveState<SportEvent[] | null>;

  private constructor() {
    this._events = new ReactiveState<SportEvent[] | null>(null);

    // Fetch events when the services is initialized
    // TODO implement an interval eventually
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

  getEvents$(): Observable<SportEvent[] | null> {
    return this._events.select$((events) => events);
  }
}

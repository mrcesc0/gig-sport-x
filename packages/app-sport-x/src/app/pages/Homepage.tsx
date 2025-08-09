import styles from './Homepage.module.css';

import { formatDate } from '@gig-sport-x/lib-utils';
import { SportService } from '@gig-sport-x/svc-sport';
import { SportEvent } from '@gig-sport-x/lib-schemas';
import { Choice } from '@gig-sport-x/lib-ui';
import { useEffect, useState } from 'react';

/**
 * `Homepage` is the main landing component that displays a list of sport events fetched from `SportService`.
 * It renders detailed information for each event, including sport metadata, event label, start time, and
 * available betting options (questions and choices).
 */
export function Homepage() {
  const [events, setEvents] = useState<SportEvent[]>([]);

  useEffect(() => {
    const events$$ = SportService.Instance.events$.subscribe({
      next: (_events) => setEvents(_events),
    });

    return () => events$$.unsubscribe();
  }, []);

  return (
    <div>
      {events.map((event) => (
        <div key={event.id} className={styles.event}>
          <ul className={styles.metaList}>
            <li className={styles.metaItem}>{event.sport.label}</li>
            <li className={styles.metaSeparator}>/</li>
            <li className={styles.metaItem}>{event.category.label}</li>
            <li className={styles.metaSeparator}>/</li>
            <li className={styles.metaItem}>{event.competition.label}</li>
          </ul>

          <div>
            <h2 className={styles.eventLabel}>{event.label}</h2>
            <small>{formatDate(event.start)}</small>

            {Object.entries(event.bet).map(([betId, bet]) => (
              <div key={betId} className={styles.bet}>
                <h3 className={styles.betQuestion}>{bet.question.label}</h3>
                {bet.choices.map((choice) => {
                  const userBetId = `${event.id}-${betId}-${choice.id}`;
                  return (
                    <Choice
                      key={choice.id}
                      choice={choice}
                      userBetId={userBetId}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

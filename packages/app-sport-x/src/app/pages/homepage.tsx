import styles from './homepage.module.css';

import { useObservable } from '@gig-sport-x/lib-utils';
import { SportService } from '@gig-sport-x/svc-sport';
import { BetItem, Choice, SportEvent } from '@gig-sport-x/lib-schemas';

export function Homepage() {
  const sportService = SportService.Instance;
  const events$ = sportService.getEvents$();
  const events = useObservable(events$);

  function formatDate(dateString: string): string {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return '';
    }

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };

    return new Intl.DateTimeFormat('en-GB', options).format(date);
  }

  function getBets(event: SportEvent) {
    return Object.keys(event.bet).map((betId) => ({
      id: betId,
      ...event.bet[betId],
    }));
  }

  function toggleChoice(choice: Choice, bet: BetItem) {
    // TODO consume Betslip service
    return;
  }

  function isChoiceActive(choice: Choice, bet: BetItem) {
    return false;
  }

  return (
    <div>
      {events?.map((event) => (
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

            {getBets(event).map((bet) => (
              <div key={bet.id} className={styles.bet}>
                <h3 className={styles.betQuestion}>{bet.question.label}</h3>
                {bet.choices.map((choice) => (
                  <div
                    key={choice.id}
                    className={`${styles.choice} ${
                      isChoiceActive(choice, bet) ? styles.active : ''
                    }`}
                    onClick={() => toggleChoice(choice, bet)}
                  >
                    {choice.actor.label} ({choice.odd})
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

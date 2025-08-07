import styles from './Betslip.module.css';

import { Choice } from '@gig-sport-x/lib-schemas';
import { BetslipService } from '@gig-sport-x/svc-betslip';
import { SportService } from '@gig-sport-x/svc-sport';
import { useEffect, useState } from 'react';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * @todo write a proper interface and move it to lib-schemas
 */
interface LocalUserBet {
  id: string;
  eventLabel?: string;
  questionLabel?: string;
  choice?: Choice;
}

export const Betslip = () => {
  const [userBets, setUserBets] = useState<LocalUserBet[]>([]);

  useEffect(() => {
    const userBets$$ = combineLatest([
      BetslipService.Instance.userBets$,
      SportService.Instance.events$,
    ])
      .pipe(
        map(([userBets, events]) => {
          return userBets.map((userBet) => {
            const [eventId, betId, choiceId] = userBet.id.split('-');
            const event = events.find(
              (event) => event.id.toString() === eventId
            );

            return {
              id: userBet.id,
              eventLabel: event?.label,
              questionLabel: event?.bet[betId].question.label,
              choice: event?.bet[betId].choices.find(
                (choice) => choice.id.toString() === choiceId
              ),
            };
          });
        })
      )
      .subscribe({
        next: (_userBets) => setUserBets(_userBets),
      });

    return () => userBets$$.unsubscribe();
  }, []);

  return (
    <div className={styles.betslip}>
      {userBets.length > 0 ? (
        userBets.map((userBet) => (
          <div key={userBet.id}>
            <span>{userBet.eventLabel}</span>
            <span>{userBet.questionLabel}</span>
            <span>
              {userBet.choice?.actor.label} - {userBet.choice?.odd}
            </span>
            <button
              onClick={() => BetslipService.Instance.removeBet(userBet.id)}
            >
              Remove
            </button>
          </div>
        ))
      ) : (
        <span>Empty betslip</span>
      )}
    </div>
  );
};

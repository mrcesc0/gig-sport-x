import styles from './Betslip.module.css';

import { Choice, BetslipType } from '@gig-sport-x/lib-schemas';
import { BetslipService } from '@gig-sport-x/svc-betslip';
import { SportService } from '@gig-sport-x/svc-sport';
import { ChangeEvent, useEffect, useState } from 'react';
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
  const amountMin = 1;
  const amountMax = 500;
  const amountStep = 0.5;

  const [userBets, setUserBets] = useState<LocalUserBet[]>([]);
  const [betslipType, setBetslipType] = useState<BetslipType | null>(null);
  const [amount, setAmount] = useState<number>(amountMin);

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

    const betslipType$$ = BetslipService.Instance.betslipType$.subscribe({
      next: (_betslipType) => setBetslipType(_betslipType),
    });

    return () => {
      userBets$$.unsubscribe();
      betslipType$$.unsubscribe();
    };
  }, []);

  const decreaseAmount = () => {
    setAmount((prev) => (prev > amountMin ? prev - amountStep : prev));
  };

  const increaseAmount = () => {
    setAmount((prev) => (prev < amountMax ? prev + amountStep : prev));
  };

  const handleChange = (
    // TODO fix built-in types
    event: ChangeEvent<HTMLInputElement & { valueAsNumber: number }>
  ) => {
    const { valueAsNumber } = event.target;

    if (
      !isNaN(valueAsNumber) &&
      valueAsNumber >= amountMin &&
      valueAsNumber <= amountMax
    ) {
      setAmount(valueAsNumber);
    }
  };

  if (betslipType === null) {
    return (
      <div className={styles.betslip}>
        <div className={styles.betslipMessage}>Empty Betslip</div>
      </div>
    );
  }

  if (betslipType === BetslipType.System) {
    return (
      <div className={styles.betslip}>
        <div className={styles.betslipMessage}>System (Not available yet)</div>
      </div>
    );
  }

  return (
    <div className={styles.betslip}>
      <div className={styles.betslipHeader}>
        {betslipType === BetslipType.Single
          ? 'Ticket: Single'
          : 'Ticket: Multiple'}
      </div>

      <div className={styles.betslipList}>
        {userBets.map((userBet) => (
          <div key={userBet.id} className={styles.betItem}>
            <div className={styles.betEvent}>{userBet.eventLabel}</div>
            <div className={styles.betQuestion}>{userBet.questionLabel}</div>
            <div className={styles.betChoice}>
              {userBet.choice?.actor.label} - {userBet.choice?.odd}
            </div>
            <button
              className={styles.removeButton}
              onClick={() => BetslipService.Instance.removeBet(userBet.id)}
            >
              X
            </button>
          </div>
        ))}
      </div>

      <div className={styles.inputWithControls}>
        <button
          type="button"
          className={styles.inputBtn}
          disabled={amount <= amountMin}
          onClick={decreaseAmount}
        >
          −
        </button>
        <input
          autoFocus
          className={styles.input}
          type="number"
          inputMode="numeric"
          min={amountMin}
          max={amountMax}
          value={amount}
          onChange={handleChange}
        />
        <button
          type="button"
          className={styles.inputBtn}
          disabled={amount >= amountMax}
          onClick={increaseAmount}
        >
          +
        </button>
      </div>
    </div>
  );
};

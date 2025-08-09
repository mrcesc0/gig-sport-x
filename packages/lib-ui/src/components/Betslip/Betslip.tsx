import styles from './Betslip.module.css';

import { Choice, BetslipType } from '@gig-sport-x/lib-schemas';
import { BetslipService } from '@gig-sport-x/svc-betslip';
import { SportService } from '@gig-sport-x/svc-sport';
import { useCallback, useEffect, useState } from 'react';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { InputWithControls } from '../InputWithControls/InputWithControls';

interface LocalUserBet {
  id: string;
  event: {
    label?: string;
  };
  question: {
    label?: string;
  };
  choice?: Choice;
}

/**
 * `Betslip` is a UI component that displays the current state of a user's selected bets.
 *
 * It integrates with `BetslipService` and `SportService` to fetch bet data and render
 * a list of selected choices, supporting both **Single** and **Multiple** ticket types.
 *
 * The component dynamically calculates the **total potential payout** using
 * fixed-point arithmetic to avoid JavaScript floating-point errors.
 */
export const Betslip = () => {
  const [userBets, setUserBets] = useState<LocalUserBet[]>([]);
  const [betslipType, setBetslipType] = useState<BetslipType | null>(null);
  const [total, setTotal] = useState<number>(0);

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
              event: {
                label: event?.label,
              },
              question: {
                label: event?.bet[betId].question.label,
              },
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

  /**
   * Handles input change for the betting amount and calculates the total potential payout.
   *
   * This function performs the calculation using **fixed-point arithmetic** to avoid floating-point precision errors
   * commonly found in JavaScript (e.g., 0.1 + 0.2 !== 0.3). It uses `Math.round` to simulate accurate decimal calculations
   * by scaling all values by 100 (effectively treating two decimal places as integers).
   *
   * ## Calculation Details:
   * - The input amount is scaled by 100 and rounded (`Math.round(value * 100)`) to ensure precision up to 2 decimals.
   * - Each odd is also scaled and rounded in the same way (`Math.round(odd * 100)`).
   * - All scaled values are multiplied together.
   * - The final product is divided by a `scalingFactor` to normalize the scale back to a decimal value.
   *
   * ## scalingFactor:
   * - This is `100 ** (number of multiplied values)`:
   *   - `100` for the amount.
   *   - `100` for each odd.
   * - For example, if you multiply 1 amount and 3 odds, then the scaling factor is `100^4 = 100000000`.
   *   This corrects the over-scaling introduced during multiplication.
   *
   * ## Rounding and Formatting:
   * - The final value is converted back to a float with exactly 2 decimal places using `toFixed(2)`.
   * - `parseFloat` is used to convert the string result of `toFixed` back into a number for correct rendering.
   *
   */
  const handleValueChange = useCallback(
    (newValue: number) => {
      if (isNaN(newValue)) {
        setTotal(0);
        return;
      }

      const amount = Math.round(newValue * 100);

      const multiplier = userBets.reduce((accumulator, current) => {
        const odd = current.choice?.odd ?? 1;
        return accumulator * Math.round(odd * 100);
      }, 1);

      const scalingFactor = 100 ** (userBets.length + 1);

      const total = parseFloat(
        ((amount * multiplier) / scalingFactor).toFixed(2)
      );

      setTotal(total);
    },
    [userBets]
  );

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
            <div className={styles.betEvent}>{userBet.event.label}</div>
            <div className={styles.betQuestion}>{userBet.question.label}</div>
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

      <div className={styles.amountContainer}>
        <span className={styles.label}>Amount</span>
        <InputWithControls
          ariaLabel="Bet amount"
          defaultValue={0}
          min={0}
          step="0.10"
          pattern="^\d+(\.\d{1,2})?$"
          autoFocus={true}
          required={true}
          onValueChange={handleValueChange}
        />
      </div>

      <div className={styles.calcsContainer}>
        <span className={styles.calc}>
          Total <br /> <b>{total} &euro;</b>
        </span>
        <span className={styles.calc}>
          Potencial Gain <br /> <b>{total} &euro;</b>
        </span>
      </div>
    </div>
  );
};

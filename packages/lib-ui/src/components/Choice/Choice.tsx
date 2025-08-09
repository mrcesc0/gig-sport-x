import styles from './Choice.module.css';

import { BetslipService } from '@gig-sport-x/svc-betslip';
import { Choice as IChoice } from '@gig-sport-x/lib-schemas';
import { useEffect, useState } from 'react';

interface ChoiceProps {
  choice: IChoice;
  userBetId: string;
}

/**
 * UI component representing a single betting choice.
 *
 * The `Choice` component displays the label and odds of a given betting option.
 * It is interactive and tied to the `BetslipService`, allowing users to toggle
 * the selected state of the associated bet.
 *
 * The active state is reactive — it listens for changes from `BetslipService`
 * using an observable subscription to keep the UI in sync.
 */
export function Choice({ choice, userBetId }: ChoiceProps) {
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    const isActive$$ = BetslipService.Instance.isUserBetExisting$(
      userBetId
    ).subscribe({
      next: (_isActive) => setIsActive(_isActive),
    });

    return () => isActive$$.unsubscribe();
  }, [userBetId]);

  return (
    <div
      key={userBetId}
      className={`${styles.choice} ${isActive ? styles.active : ''}`}
      onClick={() => {
        BetslipService.Instance.toggleUserBet(userBetId);
      }}
    >
      {choice.actor.label} ({choice.odd})
    </div>
  );
}

import styles from './Choice.module.css';

import { BetslipService } from '@gig-sport-x/svc-betslip';
import { Choice as IChoice } from '@gig-sport-x/lib-schemas';
import { useEffect, useState } from 'react';

interface ChoiceProps {
  choice: IChoice;
  userBetId: string;
}

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

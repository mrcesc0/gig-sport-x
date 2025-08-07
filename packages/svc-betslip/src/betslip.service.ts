import { Betslip, BetslipSchema } from '@gig-sport-x/lib-schemas';
import { ignoreNil, ReactiveState } from '@gig-sport-x/lib-utils';

export class BetslipService {
  private static _instance: BetslipService;
  private _betslip: ReactiveState<Betslip | null>;

  private constructor() {
    this._betslip = new ReactiveState<Betslip | null>(null, {
      syncWithStorage: {
        key: 'sport-x/betslip',
        storageName: 'localStorage',
        schema: BetslipSchema,
      },
    });
  }

  static get Instance(): BetslipService {
    return (
      BetslipService._instance ||
      (BetslipService._instance = new BetslipService())
    );
  }

  get userBets$() {
    return this._betslip.select$((betslip) => betslip?.bets).pipe(ignoreNil());
  }

  addUserBet(userBetId: string): void {
    this._betslip.setState((betslip) => {
      const existing = this.isUserBetExisting(userBetId);

      if (existing) return betslip;

      const prevBets = betslip?.bets || [];

      return {
        ...betslip,
        bets: [...prevBets, { id: userBetId }],
      };
    });
  }

  removeBet(userBetId: string) {
    this._betslip.setState((betslip) => {
      if (!betslip) return betslip;

      return {
        ...betslip,
        bets: betslip.bets.filter((bet) => bet.id !== userBetId),
      };
    });
  }

  isUserBetExisting(userBetId: string) {
    return !!this._betslip.select((betslip) =>
      betslip?.bets.find((bet) => bet.id === userBetId)
    );
  }

  isUserBetExisting$(userBetId: string) {
    return this._betslip.select$(
      (betslip) => !!betslip?.bets.find((bet) => bet.id === userBetId)
    );
  }

  toggleUserBet(userBetId: string) {
    if (this.isUserBetExisting(userBetId)) {
      this.removeBet(userBetId);
      return;
    }

    this.addUserBet(userBetId);
  }
}

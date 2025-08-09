import { Betslip, BetslipSchema, BetslipType } from '@gig-sport-x/lib-schemas';
import { ignoreNil, ReactiveState } from '@gig-sport-x/lib-utils';

/**
 * Singleton service for managing the user's current betslip.
 */
export class BetslipService {
  /** Singleton instance of the `BetslipService`. */
  private static _instance: BetslipService;

  /** Internal reactive state for the betslip */
  private _betslip: ReactiveState<Betslip | null>;

  /**
   * Private constructor for the singleton pattern.
   *
   * Initializes the `ReactiveState` with a schema and config to sync with a storage
   */
  private constructor() {
    this._betslip = new ReactiveState<Betslip | null>(null, {
      syncWithStorage: {
        key: 'sport-x/betslip',
        storageName: 'localStorage',
        schema: BetslipSchema,
      },
    });
  }

  /**
   * Returns the singleton instance of `BetslipService`.
   */
  static get Instance(): BetslipService {
    return (
      BetslipService._instance ||
      (BetslipService._instance = new BetslipService())
    );
  }

  /**
   * Observable that emits the current list of user bets.
   *
   * Filters out `null` values.
   */
  get userBets$() {
    return this._betslip.select$((betslip) => betslip?.bets).pipe(ignoreNil());
  }

  /**
   * Observable that emits the current type of betslip: `Single`, `Multiple`, or `System`.
   *
   * The logic is as follows:
   * - No bets → `null`
   * - One bet → `Single`
   * - Multiple bets:
   *   - If all event-bet IDs are unique → `Multiple`
   *   - If any event-bet ID is duplicated → `System`
   */
  get betslipType$() {
    return this._betslip.select$((betslip) => {
      if (!betslip) return null;

      const { bets } = betslip;

      if (bets.length === 0) {
        return null;
      }

      if (bets.length === 1) {
        return BetslipType.Single;
      }

      if (bets.length > 1) {
        const fullBetIds = bets.map((bet) => {
          const [eventId, betId] = bet.id.split('-', 2);
          return `${eventId}-${betId}`;
        });

        const unique = new Set<string>(fullBetIds);

        return unique.size === fullBetIds.length
          ? BetslipType.Multiple
          : BetslipType.System;
      }

      return null;
    });
  }

  /**
   * Adds a user bet to the betslip by ID.
   *
   * If the bet already exists, it will not be added again (no duplicates).
   */
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

  /**
   * Removes a user bet from the betslip by ID.
   */
  removeBet(userBetId: string) {
    this._betslip.setState((betslip) => {
      if (!betslip) return betslip;

      return {
        ...betslip,
        bets: betslip.bets.filter((bet) => bet.id !== userBetId),
      };
    });
  }

  /**
   * Synchronously checks if a user bet already exists in the betslip.
   */
  isUserBetExisting(userBetId: string) {
    return !!this._betslip.select((betslip) =>
      betslip?.bets.find((bet) => bet.id === userBetId)
    );
  }

  /**
   * Observable that emits a boolean indicating whether a given user bet exists.
   */
  isUserBetExisting$(userBetId: string) {
    return this._betslip.select$(
      (betslip) => !!betslip?.bets.find((bet) => bet.id === userBetId)
    );
  }

  /**
   * Toggles the inclusion of a user bet in the betslip.
   *
   * If the bet exists, it will be removed.
   * If the bet does not exist, it will be added.
   */
  toggleUserBet(userBetId: string) {
    if (this.isUserBetExisting(userBetId)) {
      this.removeBet(userBetId);
      return;
    }

    this.addUserBet(userBetId);
  }
}

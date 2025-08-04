export class BetslipService {
  private static _instance: BetslipService;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  static get Instance(): BetslipService {
    return (
      BetslipService._instance ||
      (BetslipService._instance = new BetslipService())
    );
  }
}

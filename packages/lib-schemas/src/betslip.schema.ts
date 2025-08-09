import { z } from 'zod';

const UserBetSchema = z.object({
  id: z
    .string()
    .regex(
      /^\d+-\d+-\d+$/,
      'ID must be three numbers separated by hyphens (e.g. 3340789-953125720-4194768007)'
    ),
});

export const BetslipSchema = z.object({
  bets: z.array(UserBetSchema),
});

export type Betslip = z.infer<typeof BetslipSchema>;
export type UserBet = z.infer<typeof UserBetSchema>;

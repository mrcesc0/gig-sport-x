import { z } from 'zod';

const ActorSchema = z.object({
  id: z.number(),
  label: z.string(),
});

const ChoiceSchema = z.object({
  id: z.number(),
  odd: z.number(),
  actor: ActorSchema,
});

const QuestionSchema = z.object({
  label: z.string(),
});

const BetItemSchema = z.object({
  question: QuestionSchema,
  choices: z.array(ChoiceSchema),
});

const BetSchema = z.record(z.string(), BetItemSchema);

const CompetitionSchema = z.object({
  label: z.string(),
});

const CategorySchema = z.object({
  label: z.string(),
});

const SportSchema = z.object({
  label: z.string(),
  icon: z.string(),
});

const UserBetSchema = z.object({
  id: z
    .string()
    .regex(
      /^\d+-\d+-\d+$/,
      'ID must be three numbers separated by hyphens (e.g. 3340789-953125720-4194768007)'
    ),
});

export const SportEventSchema = z.object({
  id: z.number(),
  label: z.string().optional(),
  start: z.iso.datetime({ offset: true }),
  competition: CompetitionSchema,
  category: CategorySchema,
  sport: SportSchema,
  bet: BetSchema,
});

export const SportEventsResponseSchema = z.object({
  events: z.array(SportEventSchema),
});

export const BetslipSchema = z.object({
  bets: z.array(UserBetSchema),
});

export type SportEvent = z.infer<typeof SportEventSchema>;
export type Choice = z.infer<typeof ChoiceSchema>;
export type BetItem = z.infer<typeof BetItemSchema>;
export type Betslip = z.infer<typeof BetslipSchema>;
export type UserBet = z.infer<typeof UserBetSchema>;

export enum BetslipType {
  'Single' = 0,
  'Multiple' = 1,
  'System' = 2,
}

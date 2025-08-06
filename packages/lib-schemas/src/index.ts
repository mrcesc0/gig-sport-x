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

export const SportEventSchema = z.object({
  id: z.number(),
  label: z.string().optional(),
  start: z.iso.datetime({ offset: true }), // ISO date with timezone
  competition: CompetitionSchema,
  category: CategorySchema,
  sport: SportSchema,
  bet: BetSchema,
});

export const SportEventsResponseSchema = z.object({
  events: z.array(SportEventSchema),
});

export type SportEvent = z.infer<typeof SportEventSchema>;
export type Choice = z.infer<typeof ChoiceSchema>;
export type BetItem = z.infer<typeof BetItemSchema>;

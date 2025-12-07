// apps/server/src/schemas/reviewSchemas.ts
import { z } from "zod";

export const queueQuerySchema = z.object({
  query: z.object({
    deckId: z.string().optional(), // queue can be global in tests
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export const answerSchema = z.object({
  body: z.object({
    cardId: z.string().min(1),
    quality: z.coerce.number().int().min(0).max(5),
  }),
});




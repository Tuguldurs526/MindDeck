// apps/server/src/schemas/cardSchemas.ts
import { z } from "zod";

// Body for POST /cards
export const createCardSchema = z.object({
  front: z.string().min(1, "front is required"),
  back: z.string().min(1, "back is required"),
  deckId: z.string().min(1, "deckId is required"),
  hint: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// ✅ Body for PUT /cards/:id – all fields optional, but at least one required
export const updateCardSchema = z
  .object({
    front: z.string().min(1).optional(),
    back: z.string().min(1).optional(),
    hint: z.string().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, "At least one field must be provided");

// Params for routes like /cards/:id
export const idParamSchema = z.object({
  id: z.string().min(1, "id is required"),
});

// Query for GET /cards?deck=...&limit=...
export const listQuerySchema = z.object({
  deck: z.string().min(1, "deck query param is required"),
  cursor: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine(
      (n) => Number.isInteger(n) && n > 0 && n <= 50,
      "limit must be an integer between 1 and 50"
    ),
});

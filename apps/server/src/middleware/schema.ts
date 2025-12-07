// src/middleware/schemas.ts (optional helper)
import { z } from "zod";
export const objId = z.string().regex(/^[a-f\d]{24}$/i);
export const deckIdParams = z.object({ params: z.object({ deckId: objId }) });
export const idParams = z.object({ params: z.object({ id: objId }) });

import { z } from "zod";
export const CardSchema = z.object({
  _id: z.string().optional(),
  front: z.string().min(1),
  back: z.string().min(1),
  deck: z.string().min(1),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});
export type Card = z.infer<typeof CardSchema>;
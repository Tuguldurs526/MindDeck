// apps/server/src/routes/reviewRoutes.ts
import { Router } from "express";
import { z } from "zod";
import { answerReview, getQueue, resetDeckReviews } from "../controllers/reviewController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const queueQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  deckId: z.string().optional(),
});

const answerSchema = z.object({
  cardId: z.string().min(1),
  quality: z.coerce.number().int().min(0).max(5),
});

const resetDeckSchema = z.object({
  deckId: z.string().min(1),
});

router.get("/queue", verifyToken, validate(queueQuerySchema), getQueue);
router.post("/answer", verifyToken, validate(answerSchema), answerReview);

// ✅ new reset route
router.post("/reset-deck", verifyToken, validate(resetDeckSchema), resetDeckReviews);

export default router;

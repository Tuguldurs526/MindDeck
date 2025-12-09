// apps/server/src/routes/reviewRoutes.ts
import { Router } from "express";
import { z } from "zod";
import { answerReview, getQueue } from "../controllers/reviewController.js";
import { verifyToken } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";

const router = Router();

// allow ?limit=... and optional ?deckId=...
const queueQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  deckId: z.string().optional(), // 👈 NEW
});

const answerSchema = z.object({
  cardId: z.string().min(1),
  quality: z.coerce.number().int().min(0).max(5),
});

// GET /reviews/queue?limit=10&deckId=<optional>
router.get("/queue", verifyToken, validate(queueQuerySchema), getQueue);

// POST /reviews/answer
router.post("/answer", verifyToken, validate(answerSchema), answerReview);

export default router;

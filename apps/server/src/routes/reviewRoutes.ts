import { Router } from "express";
import { z } from "zod";
import { answerReview, getQueue } from "../controllers/reviewController";
import { verifyToken } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";

const router = Router();

const queueQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const answerSchema = z.object({
  cardId: z.string().min(1),
  quality: z.coerce.number().int().min(0).max(5),
});

// routes/reviewRoutes.ts
router.get("/queue", verifyToken, validate(queueQuerySchema), getQueue);
router.post("/answer", verifyToken, validate(answerSchema), answerReview);

export default router;




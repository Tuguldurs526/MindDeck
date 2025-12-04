import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getNext, answer } from "../controllers/reviewController.js";

const router = Router();

const nextSchema = z.object({
  query: z.object({
    deckId: z.string().optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
  })
});

const answerSchema = z.object({
  body: z.object({
    cardId: z.string().min(1),
    rating: z.enum(["again","hard","good","easy"]),
  })
});

router.get("/next", verifyToken, validate(nextSchema), getNext);
router.post("/answer", verifyToken, validate(answerSchema), answer);

export default router;

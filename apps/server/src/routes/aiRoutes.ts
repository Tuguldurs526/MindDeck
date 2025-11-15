import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { explain, hint } from "../controllers/aiController.js";

const router = Router();

const limiter = rateLimit({ windowMs: 60_000, max: 10, standardHeaders: true, legacyHeaders: false });

const explainSchema = z.object({
  body: z.object({
    cardId: z.string().optional(),
    text: z.string().trim().min(1).optional(),
  }).refine(b => !!b.cardId || !!b.text, { message: "Provide cardId or text" })
});

const hintSchema = z.object({ body: z.object({ cardId: z.string().min(1) }) });

router.post("/explain", verifyToken, limiter, validate(explainSchema), explain);
router.post("/hint", verifyToken, limiter, validate(hintSchema), hint);

export default router;

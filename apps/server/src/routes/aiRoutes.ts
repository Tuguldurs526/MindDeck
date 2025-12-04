// apps/server/src/routes/aiRoutes.ts
import { Router } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { z } from "zod";
import { explain, hint } from "../controllers/aiController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const limiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator, // required for IPv6 safety in tests
});

const explainSchema = z.object({
  body: z
    .object({
      cardId: z.string().optional(),
      text: z.string().trim().min(1).optional(),
    })
    .refine((b) => !!b.cardId || !!b.text, {
      message: "Provide cardId or text",
    }),
});

const hintSchema = z.object({
  body: z.object({ cardId: z.string().min(1) }),
});

router.post("/explain", verifyToken, limiter, validate(explainSchema), explain);
router.post("/hint", verifyToken, limiter, validate(hintSchema), hint);

export default router;

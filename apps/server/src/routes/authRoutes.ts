// apps/server/src/routes/authRoutes.ts
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, register } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../schemas/authSchemas.js";

const router = Router();

const WINDOW_MS = Number(process.env.AUTH_RATE_WINDOW_MS ?? 10 * 60 * 1000); // 10 min
const AUTH_RATE_MAX = Number(process.env.AUTH_RATE_MAX ?? 100);
const SKIP_AUTH_RATE_LIMIT =
  process.env.SKIP_AUTH_RATE_LIMIT === "true" || process.env.NODE_ENV !== "production";

const authLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: AUTH_RATE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => SKIP_AUTH_RATE_LIMIT,
});

// Register
router.post("/register", authLimiter, validate(registerSchema), register);

// Login
router.post("/login", authLimiter, validate(loginSchema), login);

export default router;

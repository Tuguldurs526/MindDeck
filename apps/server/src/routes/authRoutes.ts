import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, register } from "../controllers/authController";
import { loginSchema, registerSchema } from "../schemas/authSchemas.js";
import { validate } from "../middleware/validate.js";

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

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

export default router;

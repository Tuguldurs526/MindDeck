import rateLimit from "express-rate-limit";

export const aiLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests, try again later.",
        requestId: (res as any).locals?.requestId,
      },
    });
  },
});




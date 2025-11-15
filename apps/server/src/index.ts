// apps/server/src/index.ts
import cors from "cors";
import "dotenv/config";
import express from "express";
import morgan from "morgan";
import { connectDB } from "./config/db.js";

// routes
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cardRoutes from "./routes/cardRoutes.js";
import deckRoutes from "./routes/deckRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

const app = express();
app.disable("x-powered-by");

// CORS + parsing + logging
const origins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors({ origin: origins.length ? origins : "*", credentials: false }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Health and root
app.get("/api/health", (_req, res) => res.json({ message: "OK" }));
app.get("/", (_req, res) =>
  res.json({ name: "Minddeck API", health: "/api/health" })
);

// Real routes (must be BEFORE 404)
app.use("/auth", authRoutes);
app.use("/cards", cardRoutes);
app.use("/decks", deckRoutes);
app.use("/reviews", reviewRoutes);
app.use("/ai", aiRoutes);
app.use("/stats", statsRoutes);

// 404 catch-all
app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Centralized error handler
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal Server Error" });
  }
);

const PORT = Number(process.env.PORT) || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`API running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("Failed to connect DB:", err);
    process.exit(1);
  });

export { app };

// apps/server/src/app.ts
import cors from "cors";
import express from "express";
import morgan from "morgan";
import fs from "node:fs";
import path from "node:path";

// routes
import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cardRoutes from "./routes/cardRoutes.js";
import deckRoutes from "./routes/deckRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

// Factory: create a fresh app each time (tests rely on this)
export function createApp() {
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
  app.get("/", (_req, res) => res.json({ name: "Minddeck API", health: "/api/health" }));

  // Lightweight /docs YAML dump (dev only)
  app.get("/docs", (_req, res) => {
    const p = path.join(process.cwd(), "apps", "server", "src", "docs", "openapi-stub.yaml");
    if (!fs.existsSync(p)) return res.status(404).json({ error: "docs missing" });
    res.type("text/yaml").send(fs.readFileSync(p, "utf8"));
  });

  // Real routes
  app.use("/auth", authRoutes);
  app.use("/cards", cardRoutes);
  app.use("/decks", deckRoutes);
  app.use("/reviews", reviewRoutes);
  app.use("/ai", aiRoutes);
  app.use("/stats", statsRoutes);
  app.use("/ai", aiRoutes);

  // 404
  app.use((req, res) => res.status(404).json({ error: "Not found" }));

  // Centralized error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
  });

  app.use(helmet()); // <- here
  app.use(cors({ origin: origins.length ? origins : "*", credentials: false }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  return app;
}

// Optional helper for manual starts (prod/dev, not used by tests)
export function startApp() {
  const app = createApp();
  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

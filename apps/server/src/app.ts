// apps/server/src/app.ts
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import fs from "node:fs";
import path from "node:path";

import aiRoutes from "./routes/aiRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cardRoutes from "./routes/cardRoutes.js";
import deckRoutes from "./routes/deckRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  const origins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Global middleware FIRST
  app.use(helmet());
  app.use(cors({ origin: origins.length ? origins : "*", credentials: false }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  // Health and root
  app.get("/api/health", (_req, res) => res.json({ message: "OK" }));
  app.get("/", (_req, res) => res.json({ name: "Minddeck API", health: "/api/health" }));

  // /docs
  app.get("/docs", (_req, res) => {
    const p = path.join(process.cwd(), "apps", "server", "src", "docs", "openapi-stub.yaml");
    if (!fs.existsSync(p)) {
      return res.status(404).json({ error: "docs missing" });
    }
    res.type("text/yaml").send(fs.readFileSync(p, "utf8"));
  });

  // Routes
  app.use("/auth", authRoutes);
  app.use("/cards", cardRoutes);
  app.use("/decks", deckRoutes);
  app.use("/reviews", reviewRoutes);
  app.use("/stats", statsRoutes);
  app.use("/ai", aiRoutes);

  // 404 handler (must be after all routes)
  app.use((req, res) => res.status(404).json({ error: "Not found" }));

  // Error handler (last)
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
  });

  return app;
}

export function startApp() {
  const app = createApp();
  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
}

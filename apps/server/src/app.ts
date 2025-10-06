import cors from "cors";
import "dotenv/config";
import express from "express";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import cardRoutes from "./routes/cardRoutes.js";
import deckRoutes from "./routes/deckRoutes.js";

export const createApp = () => {
  const app = express();
  const origins = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  app.use(cors({ origin: origins.length ? origins : "*", credentials: false }));
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/api/health", (_req, res) => res.json({ message: "OK" }));
  app.get("/", (_req, res) =>
    res.json({ name: "Minddeck API", health: "/api/health" })
  );

  app.use("/auth", authRoutes);
  app.use("/cards", cardRoutes);
  app.use("/decks", deckRoutes);

  app.use((req, res) => res.status(404).json({ error: "Not found" }));
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

  return app;
};

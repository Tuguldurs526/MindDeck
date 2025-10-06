import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import cardRoutes from "./routes/cardRoutes.js";

const app = express();

const origins = (process.env.CORS_ORIGINS ?? "").split(",").filter(Boolean);
app.use(cors({ origin: origins.length ? origins : "*", credentials: false }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ message: "OK" }));

app.use("/auth", authRoutes);
app.use("/cards", cardRoutes);

const PORT = Number(process.env.PORT) || 5000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
});
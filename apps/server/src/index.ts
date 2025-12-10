// apps/server/src/index.ts
import "dotenv/config";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = Number(process.env.PORT) || 5000;

async function main() {
  await connectDB();
  const app = createApp();
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}

main().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});

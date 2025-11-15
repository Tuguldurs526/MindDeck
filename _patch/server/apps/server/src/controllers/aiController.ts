import { Request, Response } from "express";
import crypto from "crypto";
import AICache from "../models/AICache.js";
import Card from "../models/Card.js";
import { aiExplain, aiHint } from "../services/aiService.js";

const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export async function explain(req: Request, res: Response) {
  const userId = (req as any).user?.sub;
  const { cardId, text } = (req.body || {}) as { cardId?: string; text?: string };

  let prompt = text;
  let key: any = { user: userId, type: "explain" };

  if (cardId) {
    const card = await Card.findById(cardId).populate("deck", "title");
    if (!card) return res.status(404).json({ error: "Card not found" });
    prompt = `Question: ${card.front}\nAnswer: ${card.back}\nExplain the concept briefly for a CS student.`;
    key.card = cardId;
  } else if (prompt) {
    key.textHash = sha(prompt);
  } else {
    return res.status(400).json({ error: "Provide cardId or text" });
  }

  const cached = await AICache.findOne(key).sort({ createdAt: -1 });
  if (cached) return res.json({ cached: true, text: cached.output });

  const output = await aiExplain(prompt!);
  await AICache.create({ ...key, output });
  res.json({ cached: false, text: output });
}

export async function hint(req: Request, res: Response) {
  const userId = (req as any).user?.sub;
  const { cardId } = (req.body || {}) as { cardId?: string };
  if (!cardId) return res.status(400).json({ error: "cardId required" });

  const card = await Card.findById(cardId);
  if (!card) return res.status(404).json({ error: "Card not found" });

  const key: any = { user: userId, type: "hint", card: cardId };
  const cached = await AICache.findOne(key).sort({ createdAt: -1 });
  if (cached) return res.json({ cached: true, text: cached.output });

  const output = await aiHint(`Give a short hint (no spoilers) to help recall the answer to: ${card.front}`);
  await AICache.create({ ...key, output });
  res.json({ cached: false, text: output });
}

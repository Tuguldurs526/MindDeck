// apps/server/src/controllers/aiController.ts
import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import AICache from "../models/AICache.js";
import Card from "../models/Card.js";
import Deck from "../models/Deck.js";
import { callLLM } from "../services/aiService.js";

const { isValidObjectId } = mongoose;

function getUserId(req: Request): string {
  return (req as any).user?.sub ?? "";
}

/**
 * Build a stable cache key for explain/hint requests.
 * Lowercases, normalizes whitespace, and truncates to 256 chars.
 */
function mkKey(prefix: "explain" | "hint", s: string) {
  const base = `${prefix}:${String(s || "")
    .trim()
    .toLowerCase()}`.replace(/\s+/g, " ");
  return base.length > 256 ? base.slice(0, 256) : base;
}

function extractCardText(card: any) {
  const front = String(card?.front ?? "").trim();
  const back = String(card?.back ?? "").trim();
  return { front, back };
}

/**
 * True if the given deck belongs to the given user.
 */
async function userOwnsDeck(deckId: string, userId: string) {
  if (!isValidObjectId(deckId)) return false;
  return !!(await Deck.exists({
    _id: deckId,
    $or: [{ user: userId }, { owner: userId }],
  }));
}

/**
 * POST /ai/explain
 * Body: { text?: string, cardId?: string }
 */
export async function postExplain(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body ?? {};
    const rawText = typeof body.text === "string" ? body.text.trim() : "";
    const cardId = typeof body.cardId === "string" ? body.cardId.trim() : undefined;

    let text = rawText;

    // If text not provided, derive it from card.front
    if (!text && cardId) {
      if (!isValidObjectId(cardId)) {
        return res.status(400).json({ error: "Invalid cardId" });
      }

      const user = getUserId(req);
      const card = (await Card.findById(cardId).lean()) as any | null;
      if (!card) {
        return res.status(404).json({ error: "Card not found" });
      }

      const deckId: string = String(card.deck ?? "");
      const deckOwned = await userOwnsDeck(deckId, user);
      const cardOwned = String((card as any).user ?? "") === user;
      if (!deckOwned && !cardOwned) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { front } = extractCardText(card);
      text = front;
    }

    if (!text) {
      return res.status(400).json({ error: "text or cardId required" });
    }

    const key = mkKey("explain", text);
    const hit = (await AICache.findOne({ key }, { value: 1, _id: 0 }).lean()) as any | null;

    if (hit) {
      return res.status(200).json({ cached: true, value: hit.value });
    }

    const value = await callLLM(
      "Explain briefly and clearly for a CS student. Avoid fluff. Prefer 3–5 sentences. If input is ambiguous, state assumptions.",
      text,
      { maxOutputTokens: 300, temperature: 0.2 }
    );

    await AICache.create({ key, value });
    return res.status(200).json({ cached: false, value });
  } catch (e) {
    return next(e);
  }
}

/**
 * POST /ai/hint
 * Body: { text?: string, cardId?: string }
 */
export async function postHint(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body ?? {};
    const rawText = typeof body.text === "string" ? body.text.trim() : "";
    const cardId = typeof body.cardId === "string" ? body.cardId.trim() : undefined;
    const user = getUserId(req);

    let text = rawText;

    // Card-based hint path (this is what tests use)
    if (!text) {
      if (!cardId || !isValidObjectId(cardId)) {
        return res.status(400).json({ error: "text or valid cardId required" });
      }

      const card = (await Card.findById(cardId).lean()) as any | null;
      if (!card) {
        return res.status(404).json({ error: "Card not found" });
      }

      const deckId: string = String(card.deck ?? "");
      const deckOwned = await userOwnsDeck(deckId, user);
      const cardOwned = String((card as any).user ?? "") === user;
      if (!deckOwned && !cardOwned) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { front } = extractCardText(card);
      text =
        `Provide a short hint only. Nudge the learner but do not reveal the answer.\n` +
        `Question: ${front}`;
    }

    const key = mkKey("hint", text);
    const hit = (await AICache.findOne({ key }, { value: 1, _id: 0 }).lean()) as any | null;

    if (hit) {
      return res.status(200).json({ cached: true, value: hit.value });
    }

    const value = await callLLM(
      "Provide a short hint only. Nudge the learner but do not reveal the full answer.",
      text,
      { maxOutputTokens: 120, temperature: 0.2 }
    );

    await AICache.create({ key, value });
    return res.status(200).json({ cached: false, value });
  } catch (e) {
    return next(e);
  }
}

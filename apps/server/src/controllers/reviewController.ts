// apps/server/src/controllers/reviewController.ts
import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ApiError } from "../middleware/error.js";
import Card from "../models/Card.js";
import { advanceSm2, type Sm2State } from "../services/sm2Service.js";

const { isValidObjectId } = mongoose;
const getUserId = (req: Request) => (req as any).user?.sub as string;

// GET /reviews/queue?limit=10&deckId=<optional>
export async function getQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const owner = getUserId(req);
    const rawLimit = Number(req.query.limit ?? 10);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 50) : 10;

    const deckId = typeof req.query.deckId === "string" ? req.query.deckId : undefined;

    // base query: only this user's cards, due now or earlier
    const query: any = {
      owner,
      "sm2.due": { $lte: new Date() },
    };

    // optional deck filter
    if (deckId) {
      if (!isValidObjectId(deckId)) {
        throw new ApiError(400, "BAD_REQUEST", "Invalid deckId");
      }
      query.deck = deckId;
    }

    const items = await Card.find(query).sort({ "sm2.due": 1, _id: 1 }).limit(limit).lean();

    return res.json({ count: items.length, items });
  } catch (e) {
    return next(e);
  }
}

// POST /reviews/answer { cardId, quality }
export async function answerReview(req: Request, res: Response, next: NextFunction) {
  try {
    const { cardId, quality } = (req.body ?? {}) as {
      cardId?: string;
      quality?: number;
    };

    if (!isValidObjectId(cardId)) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid cardId");
    }

    const owner = getUserId(req);

    // Enforce ownership via owner on card
    const card = await Card.findOne({ _id: cardId, owner }).populate("deck", "owner _id").exec();

    if (!card) {
      throw new ApiError(404, "NOT_FOUND", "Card not found");
    }

    // Current SM‑2 state with sane defaults
    const current: Sm2State = {
      reps: (card as any).sm2?.reps ?? 0,
      interval: (card as any).sm2?.interval ?? 0,
      ease: (card as any).sm2?.ease ?? 2.5,
      due: (card as any).sm2?.due ?? new Date(),
    };

    const nextState = advanceSm2(current, Number(quality));

    (card as any).sm2 = nextState;
    await card.save();

    return res.json({ updated: true, sm2: nextState });
  } catch (e) {
    return next(e);
  }
}

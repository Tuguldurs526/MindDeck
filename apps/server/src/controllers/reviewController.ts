// apps/server/src/controllers/reviewController.ts
import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ApiError } from "../middleware/error.js";
import Card from "../models/Card.js";
import { advanceSm2, type Sm2State } from "../services/sm2Service.js";

const { isValidObjectId } = mongoose;

const getUserId = (req: Request): string => (req as any).user?.sub ?? "";

// Shared helper: require authenticated user
function requireUser(req: Request): string {
  const userId = getUserId(req);
  if (!userId) {
    throw new ApiError(401, "UNAUTHORIZED", "User not authenticated");
  }
  return userId;
}

// GET /reviews/queue?limit=10&deckId=...
export async function getQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const owner = requireUser(req);

    const rawLimit = Number(req.query.limit ?? 10);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 50) : 10;

    const deckId = typeof req.query.deckId === "string" ? req.query.deckId : "";
    const now = new Date();

    const matchBase: any = { owner };

    if (deckId && isValidObjectId(deckId)) {
      matchBase.deck = deckId;
    }

    // ✅ Only return cards that are actually due
    const items = await Card.find({
      ...matchBase,
      "sm2.due": { $lte: now },
    })
      .sort({ "sm2.due": 1, _id: 1 })
      .limit(limit)
      .lean();

    return res.json({ count: items.length, items });
  } catch (e) {
    return next(e);
  }
}

// POST /reviews/answer { cardId, quality }
export async function answerReview(req: Request, res: Response, next: NextFunction) {
  try {
    const owner = requireUser(req);

    const { cardId, quality } = (req.body ?? {}) as {
      cardId?: string;
      quality?: number;
    };

    if (!isValidObjectId(cardId)) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid cardId");
    }

    const card = await Card.findOne({ _id: cardId, owner }).populate("deck", "owner _id").exec();

    if (!card) {
      throw new ApiError(404, "NOT_FOUND", "Card not found");
    }

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

// POST /reviews/reset-deck { deckId }
// Reset SM-2 state so you can review a whole deck again immediately.
export async function resetDeckReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const owner = requireUser(req);

    const { deckId } = (req.body ?? {}) as { deckId?: string };

    if (!deckId || !isValidObjectId(deckId)) {
      throw new ApiError(400, "BAD_REQUEST", "Invalid deckId");
    }

    const now = new Date();

    const rawResult = await Card.updateMany(
      { owner, deck: deckId },
      {
        $set: {
          "sm2.reps": 0,
          "sm2.interval": 0,
          "sm2.ease": 2.5,
          "sm2.due": now,
        },
      }
    ).exec();

    // Be defensive about the shape of the result (Mongo/Mongoose versions differ)
    const result: any = rawResult;

    return res.json({
      reset: true,
      matched: result.matchedCount ?? 0,
      modified: result.modifiedCount ?? 0,
    });
  } catch (e) {
    return next(e);
  }
}

import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ApiError } from "../middleware/error";
import Card from "../models/Card";
import { advanceSm2, type Sm2State } from "../services/sm2Service";

const { isValidObjectId } = mongoose;
const getUserId = (req: Request) => (req as any).user?.sub as string;

// GET /reviews/queue?limit=10
export async function getQueue(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const owner = getUserId(req);
    const rawLimit = Number(req.query.limit ?? 10);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), 50)
      : 10;

    const now = new Date();

    // only cards belonging to this owner, due now or earlier
    const items = await Card.find({ owner, "sm2.due": { $lte: now } })
      .sort({ "sm2.due": 1, _id: 1 })
      .limit(limit)
      .lean();

    return res.json({ count: items.length, items });
  } catch (e) {
    return next(e);
  }
}

// POST /reviews/answer { cardId, quality }
export async function answerReview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { cardId, quality } = (req.body ?? {}) as {
      cardId?: string;
      quality?: number;
    };
    if (!isValidObjectId(cardId))
      throw new ApiError(400, "BAD_REQUEST", "Invalid cardId");

    const owner = getUserId(req);

    // Enforce ownership via join to deck or stored owner on card
    const card = await Card.findOne({ _id: cardId, owner })
      .populate("deck", "owner _id")
      .exec();
    if (!card) throw new ApiError(404, "NOT_FOUND", "Card not found");

    // Current SM-2 state with sane defaults
    const current: Sm2State = {
      reps: (card as any).sm2?.reps ?? 0,
      interval: (card as any).sm2?.interval ?? 0,
      ease: (card as any).sm2?.ease ?? 2.5,
      due: (card as any).sm2?.due ?? new Date(),
    };

    const next = advanceSm2(current, Number(quality));

    (card as any).sm2 = next;
    await card.save();

    return res.json({ updated: true, sm2: next });
  } catch (e) {
    return next(e);
  }
}




import { Request, Response } from "express";
import ReviewState from "../models/ReviewState.js";
import Card from "../models/Card.js";
import { nextSM2, Rating } from "../utils/sm2.js";
import mongoose from "mongoose";

export async function getNext(req: Request, res: Response) {
  const userId = (req as any).user?.sub;
  const { deckId, limit = 20 } = req.query as any;

  const now = new Date();
  const match: any = { user: userId, due: { $lte: now } };
  let deckFilter: any = {};
  if (deckId && typeof deckId === "string" && mongoose.isValidObjectId(deckId)) {
    deckFilter = { deck: new mongoose.Types.ObjectId(deckId) };
  }

  const result = await ReviewState.aggregate([
    { $match: match },
    {
      $lookup: {
        from: "cards",
        localField: "card",
        foreignField: "_id",
        as: "cardDoc",
      },
    },
    { $unwind: "$cardDoc" },
    { $match: deckFilter.deck ? { "cardDoc.deck": deckFilter.deck } : {} },
    { $sort: { due: 1 } },
    { $limit: Math.max(1, Math.min(Number(limit) || 20, 100)) },
    {
      $project: {
        _id: 0,
        cardId: "$card",
        deckId: "$cardDoc.deck",
        front: "$cardDoc.front",
        due: 1,
        stats: { repetition: 1, interval: 1 },
      },
    },
  ]);

  // If none due in that deck, seed initial states as due now
  if (result.length === 0 && deckFilter.deck) {
    const existing = await ReviewState.find({ user: userId }).distinct("card");
    const candidates = await Card.find({ deck: deckFilter.deck, _id: { $nin: existing } })
      .sort({ createdAt: 1 })
      .limit(10);
    await Promise.all(
      candidates.map(c =>
        ReviewState.updateOne(
          { user: userId, card: c._id },
          { $setOnInsert: { repetition: 0, interval: 0, efactor: 2.5, due: new Date() } },
          { upsert: true }
        )
      )
    );
    const seeded = await ReviewState.aggregate([
      { $match: { user: userId, due: { $lte: new Date() } } },
      { $lookup: { from:"cards", localField:"card", foreignField:"_id", as:"cardDoc" } },
      { $unwind: "$cardDoc" },
      { $match: { "cardDoc.deck": deckFilter.deck } },
      { $sort: { due: 1 } },
      { $limit: Math.max(1, Math.min(Number(limit) || 20, 100)) },
      { $project: { _id:0, cardId:"$card", deckId:"$cardDoc.deck", front:"$cardDoc.front", due:1, stats:{ repetition:1, interval:1 } } }
    ]);
    return res.json(seeded);
  }

  res.json(result);
}

export async function answer(req: Request, res: Response) {
  const userId = (req as any).user?.sub;
  const { cardId, rating } = req.body as { cardId: string; rating: Rating };

  if (!cardId || !rating) return res.status(400).json({ error: "cardId and rating required" });
  if (!["again","hard","good","easy"].includes(rating)) return res.status(400).json({ error: "invalid rating" });
  if (!mongoose.isValidObjectId(cardId)) return res.status(400).json({ error: "invalid cardId" });

  const card = await Card.findById(cardId).populate("deck", "user");
  if (!card) return res.status(404).json({ error: "Card not found" });
  if (String((card.deck as any).user) !== String(userId)) return res.status(403).json({ error: "Not your card" });

  const state =
    (await ReviewState.findOne({ user: userId, card: cardId })) ||
    (await ReviewState.create({ user: userId, card: cardId, repetition: 0, interval: 0, efactor: 2.5, due: new Date(0) }));

  const next = nextSM2({ repetition: state.repetition, interval: state.interval, efactor: state.efactor }, rating);
  const nextDue = new Date(Date.now() + next.interval * 24 * 60 * 60 * 1000);

  state.repetition = next.repetition;
  state.interval = next.interval;
  state.efactor = next.efactor;
  state.lastRating = rating;
  state.lastReviewedAt = new Date();
  if (rating === "again") state.lapses = (state.lapses || 0) + 1;
  state.due = nextDue;
  await state.save();

  res.json({ ok: true, nextIntervalDays: next.interval, repetition: next.repetition, efactor: next.efactor, due: nextDue.toISOString() });
}

import { Request, Response } from "express";
import ReviewState from "../models/ReviewState";
import Deck from "../models/Deck";

export async function overview(req: Request, res: Response) {
  const userId = (req as any).user?.sub;
  const start = new Date(); start.setHours(0,0,0,0);
  const end = new Date(); end.setHours(23,59,59,999);

  const dueToday = await ReviewState.countDocuments({ user: userId, due: { $lte: end } });
  const reviewedToday = await ReviewState.countDocuments({ user: userId, lastReviewedAt: { $gte: start, $lte: end } });

  const todays = await ReviewState.find({ user: userId, lastReviewedAt: { $gte: start, $lte: end } }, { lastRating: 1 });
  const ok = todays.filter(t => t.lastRating && t.lastRating !== "again").length;
  const accuracy = todays.length ? ok / todays.length : 1;

  // Past 30 days streak (naive)
  const past = new Date(Date.now() - 29*24*60*60*1000);
  const days = await ReviewState.aggregate([
    { $match: { user: userId, lastReviewedAt: { $gte: past } } },
    { $project: { day: { $dateToString: { format: "%Y-%m-%d", date: "$lastReviewedAt" } } } },
    { $group: { _id: "$day" } },
    { $sort: { _id: 1 } }
  ]);
  const setDays = new Set(days.map(d => d._id));
  let streak = 0;
  for (let i=0; i<1000; i++) {
    const d = new Date(); d.setDate(d.getDate()-i);
    const key = d.toISOString().slice(0,10);
    if (setDays.has(key)) streak++; else break;
  }

  const decks = await Deck.find({ user: userId }, { title: 1 });
  const byDeck = await Promise.all(decks.map(async d => {
    const due = await ReviewState.countDocuments({ user: userId, due: { $lte: end } })
    const reviewed = await ReviewState.countDocuments({ user: userId, lastReviewedAt: { $gte: start, $lte: end } })
    return { deckId: d._id, title: d.title, due, reviewedToday: reviewed };
  }));

  res.json({ dueToday, reviewedToday, accuracy, streakDays: streak, byDeck });
}




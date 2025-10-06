import { Request, Response } from "express";
import mongoose from "mongoose";
import Card from "../models/Card.js";
import Deck from "../models/Deck.js";

const { isValidObjectId } = mongoose;
const getUserId = (req: Request) => (req as any).user?.sub as string;

export async function createDeck(req: Request, res: Response) {
  try {
    let { title } = req.body as { title?: string };
    title = title?.trim();
    if (!title) return res.status(400).json({ error: "Missing title" });

    const deck = await Deck.create({ title, user: getUserId(req) });
    return res.status(201).json(deck);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function listDecks(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    // simple pagination: /decks?limit=50&page=1
    const limit = Math.min(Number(req.query.limit ?? 50), 200);
    const page = Math.max(Number(req.query.page ?? 1), 1);

    const decks = await Deck.find({ user: userId })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json(decks); // keep array shape consistent with your smoke test
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function getDeck(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ error: "Invalid deck id" });

    const deck = await Deck.findOne({ _id: id, user: getUserId(req) }).lean();
    if (!deck) return res.status(404).json({ error: "Deck not found" });

    return res.json(deck);
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

export async function deleteDeck(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ error: "Invalid deck id" });

    // confirm ownership
    const deck = await Deck.findOne({ _id: id, user: getUserId(req) }).select(
      "_id"
    );
    if (!deck) return res.status(404).json({ error: "Deck not found" });

    // cascade delete cards to avoid orphans
    await Card.deleteMany({ deck: id });
    await Deck.deleteOne({ _id: id });

    return res.json({ message: "Deck deleted" });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}

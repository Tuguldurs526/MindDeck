// apps/server/src/models/Deck.ts
import mongoose, { Schema, Types } from "mongoose";

const DeckSchema = new Schema(
  {
    title: { type: String, required: true },

    // ✅ consistent with Card.owner and routes
    owner: { type: Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

// Unique per user: a user can't have two decks with same title
DeckSchema.index({ owner: 1, title: 1 }, { unique: true });

export default mongoose.models.Deck ?? mongoose.model("Deck", DeckSchema);

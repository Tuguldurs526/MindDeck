// apps/server/src/models/Deck.ts
import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type DeckSource = "manual" | "ai";

export interface DeckDocument extends Document {
  title: string;
  owner: Types.ObjectId;
  source?: DeckSource; // "manual" or "ai" (optional for older data)
  createdAt: Date;
  updatedAt: Date;
}

const DeckSchema = new Schema<DeckDocument>(
  {
    title: { type: String, required: true },

    // consistent with Card.owner and your routes
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // optional tag so you can show an "AI" pill in the UI
    source: {
      type: String,
      enum: ["manual", "ai"],
      default: "manual",
    },
  },
  { timestamps: true }
);

// A user can't have two decks with the same title
DeckSchema.index({ owner: 1, title: 1 }, { unique: true });

const Deck: Model<DeckDocument> =
  mongoose.models.Deck || mongoose.model<DeckDocument>("Deck", DeckSchema);

export default Deck;

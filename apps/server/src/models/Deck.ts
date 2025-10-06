import mongoose from "mongoose";

const deckSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

deckSchema.index({ user: 1, title: 1 }, { unique: true });
export default mongoose.model("Deck", deckSchema);

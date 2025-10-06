import mongoose from "mongoose";

const deckSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// add near the bottom, before export
deckSchema.index({ user: 1 });
deckSchema.index({ user: 1, title: 1 }, { unique: true }); // prevent duplicate titles per user
export default mongoose.model("Deck", deckSchema);

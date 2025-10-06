import mongoose from "mongoose";

const deckSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

export default mongoose.model("Deck", deckSchema);
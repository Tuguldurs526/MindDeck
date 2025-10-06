import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    front: { type: String, required: true, trim: true },
    back: { type: String, required: true, trim: true },
    deck: { type: mongoose.Schema.Types.ObjectId, ref: "Deck", required: true },
  },
  { timestamps: true }
);

cardSchema.index({ deck: 1 });
export default mongoose.model("Card", cardSchema);

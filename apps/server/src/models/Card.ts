import mongoose, { Schema, Types } from "mongoose";

const CardSchema = new Schema(
  {
    deck: { type: Types.ObjectId, ref: "Deck", required: true, index: true },
    owner: { type: Types.ObjectId, ref: "User", required: true, index: true },
    front: { type: String, required: true },
    back: { type: String, required: true },
    sm2: {
      reps: { type: Number, default: 0 },
      interval: { type: Number, default: 0 },
      ease: { type: Number, default: 2.5 },
      due: { type: Date, default: () => new Date() }, // due now by default
    },
  },
  { timestamps: true }
);

CardSchema.index({ owner: 1, "sm2.due": 1 });

export default mongoose.models.Card ?? mongoose.model("Card", CardSchema);

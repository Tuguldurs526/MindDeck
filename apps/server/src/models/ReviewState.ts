import mongoose from "mongoose";

export type Rating = "again" | "hard" | "good" | "easy";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    card: { type: mongoose.Schema.Types.ObjectId, ref: "Card", required: true },
    repetition: { type: Number, default: 0 },
    interval: { type: Number, default: 0 },   // days
    efactor: { type: Number, default: 2.5 },
    due: { type: Date, default: () => new Date() },
    lastRating: { type: String, enum: ["again","hard","good","easy"], default: "again" },
    lapses: { type: Number, default: 0 },
    lastReviewedAt: { type: Date },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, card: 1 }, { unique: true });
reviewSchema.index({ user: 1, due: 1 });

const ReviewState = mongoose.model("ReviewState", reviewSchema);
export default ReviewState;

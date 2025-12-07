import mongoose, { Schema, Types } from "mongoose";

const reviewSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, index: true },
    due: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, due: 1 });

export default mongoose.models.ReviewState ??
  mongoose.model("ReviewState", reviewSchema);




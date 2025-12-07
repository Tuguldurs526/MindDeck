import mongoose, { Schema, model } from "mongoose";

const AICacheSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true, maxlength: 256 },
    value: { type: String, required: true },
  },
  { timestamps: true }
);

// If you want TTL later, uncomment:
// AICacheSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

export default mongoose.models.AICache || model("AICache", AICacheSchema);

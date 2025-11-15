import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    type: { type: String, enum: ["hint","explain"], required: true },
    card: { type: mongoose.Schema.Types.ObjectId, ref: "Card" },
    textHash: { type: String },
    output: { type: String, required: true },
  },
  { timestamps: true }
);

// expire after 7 days
schema.index({ createdAt: 1 }, { expireAfterSeconds: 60*60*24*7 });
schema.index({ user: 1, type: 1, card: 1, textHash: 1 });

const AICache = mongoose.model("AICache", schema);
export default AICache;

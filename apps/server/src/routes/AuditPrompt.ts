import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    type: { type: String, enum: ["explain", "hint"] },
    prompt: String,
    source: { type: String, enum: ["card", "text"] },
  },
  { timestamps: true }
);
export default mongoose.model("AuditPrompt", schema);




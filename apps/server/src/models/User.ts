import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true, // keep this
      index: true, // this is fine together with unique
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

// REMOVE this if you have it, it's the duplicate:
// userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model("User", userSchema);

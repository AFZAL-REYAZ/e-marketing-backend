import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    subscribed: {
      type: Boolean,
      default: true, // ✅ subscribed by default
    },

    unsubscribedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Subscriber", subscriberSchema);

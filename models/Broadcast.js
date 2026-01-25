import mongoose from "mongoose";

const broadcastSchema = new mongoose.Schema(
  {
    title: String,
    subject: String,
    message: String,

    recipients: [String],

    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    stats: {
      sent: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      opened: { type: Number, default: 0 },
      clicked: { type: Number, default: 0 },
      unsubscribed: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Broadcast", broadcastSchema);

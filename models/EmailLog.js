import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
  {
    recipients: {
      type: [String],
      required: true,
    },
    subject: String,
    message: String,
    status: {
      type: String,
      enum: ["sent", "failed", "partial"],
      default: "sent",
    },
    error: String,

    // optional (recommended for dashboards)
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);
// 🚀 PERFORMANCE INDEX (VERY IMPORTANT)
emailLogSchema.index({ sentBy: 1, createdAt: -1 });
// ✅ SAFE EXPORT (prevents OverwriteModelError)
const EmailLog =
  mongoose.models.EmailLog || mongoose.model("EmailLog", emailLogSchema);

export default EmailLog;
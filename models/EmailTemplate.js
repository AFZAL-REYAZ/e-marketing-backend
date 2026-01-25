import mongoose from "mongoose";

const blockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["header", "text", "button", "divider", "unsubscribe"],
    required: true,
  },
  text: String,
  url: String,
});

const emailTemplateSchema = new mongoose.Schema(
  {
    name: String,               // e.g. "Discount Offer"
    subject: String,
    blocks: [blockSchema],      // 🔥 dynamic blocks
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

export default mongoose.model("EmailTemplate", emailTemplateSchema);

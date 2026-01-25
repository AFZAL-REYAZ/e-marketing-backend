import express from "express";
import EmailLog from "../models/EmailLog.js";
import { protect } from "../middleware/authMiddleware.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/stats", protect, async (req, res) => {
  try {
    const adminObjectId = new mongoose.Types.ObjectId(req.adminId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ TOTAL CAMPAIGNS
    const totalCampaigns = await EmailLog.countDocuments({
      sentBy: adminObjectId,
    });

    const stats = await EmailLog.aggregate([
      {
        $match: {
          sentBy: adminObjectId, // ✅ FIXED
        },
      },
      {
        $addFields: {
          recipientsSafe: {
            $cond: [
              { $isArray: "$recipients" },
              "$recipients",
              [],
            ],
          },
        },
      },
      {
        $group: {
          _id: null,

          totalEmails: {
            $sum: { $size: "$recipientsSafe" },
          },

          emailsToday: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", today] },
                { $size: "$recipientsSafe" },
                0,
              ],
            },
          },

          failedEmails: {
            $sum: {
              $cond: [
                { $in: ["$status", ["failed", "partial"]] },
                { $size: "$recipientsSafe" },
                0,
              ],
            },
          },
        },
      },
    ]);

    res.json({
      totalCampaigns,
      totalEmails: stats[0]?.totalEmails || 0,
      emailsToday: stats[0]?.emailsToday || 0,
      failedEmails: stats[0]?.failedEmails || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




export default router;

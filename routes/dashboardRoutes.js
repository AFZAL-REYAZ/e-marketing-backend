import express from "express";
import Admin from "../models/Admin.js";
import EmailLog from "../models/EmailLog.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
console.log("🔥 dashboardRoutes file loaded");

router.get("/stats", protect, async (req, res) => {
  try {
    // 👑 Only superadmin should access this
    if (req.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // 👤 ADMIN STATS
    const totalAdmins = await Admin.countDocuments();
    const activeAdmins = await Admin.countDocuments({ isActive: true });

    // 📅 TODAY
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 📊 AGGREGATED EMAIL STATS (ALL ADMINS)
    const stats = await EmailLog.aggregate([
      {
        $project: {
          recipientsCount: { $size: "$recipients" },
          failedCount: {
            $cond: [
              { $in: ["$status", ["failed", "partial"]] },
              { $size: "$recipients" },
              0,
            ],
          },
          isToday: {
            $cond: [{ $gte: ["$createdAt", today] }, 1, 0],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalCampaigns: { $sum: 1 },
          totalEmails: { $sum: "$recipientsCount" },
          emailsToday: {
            $sum: {
              $cond: ["$isToday", "$recipientsCount", 0],
            },
          },
          failedEmails: { $sum: "$failedCount" },
        },
      },
    ]);

    res.json({
      totalAdmins,
      activeAdmins,
      totalCampaigns: stats[0]?.totalCampaigns || 0,
      totalEmails: stats[0]?.totalEmails || 0,
      emailsToday: stats[0]?.emailsToday || 0,
      failedEmails: stats[0]?.failedEmails || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


export default router;

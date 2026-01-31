import Admin from "../models/Admin.js";
import Broadcast from "../models/Broadcast.js";

export const getDashboardStats = async (req, res) => {
  try {
    /* ================= SECURITY ================= */
    if (req.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    /* ================= ADMIN STATS ================= */
    const totalAdmins = await Admin.countDocuments();
    const activeAdmins = await Admin.countDocuments({ isActive: true });

    /* ================= DATE HELPERS ================= */
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    /* ================= 🔥 SINGLE SOURCE OF TRUTH ================= */
    /* Everything calculated ONLY from Broadcast */

    const stats = await Broadcast.aggregate([
      {
        $project: {
          recipientsCount: { $size: "$recipients" },
          opened: "$stats.opened",
          clicked: "$stats.clicked",
          unsubscribed: "$stats.unsubscribed",
          createdAt: 1,
        },
      },
      {
        $group: {
          _id: null,

          totalCampaigns: { $sum: 1 },
          totalEmails: { $sum: "$recipientsCount" },

          // ✅ emails today
          emailsToday: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", today] },
                "$recipientsCount",
                0,
              ],
            },
          },

          // totals
          opened: { $sum: "$opened" },
          clicked: { $sum: "$clicked" },
          unsubscribed: { $sum: "$unsubscribed" },

          // weekly
          weeklyOpens: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", weekAgo] }, "$opened", 0],
            },
          },
          weeklyClicks: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", weekAgo] }, "$clicked", 0],
            },
          },
          weeklyUnsubs: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", weekAgo] }, "$unsubscribed", 0],
            },
          },

          // monthly
          monthlyOpens: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", monthAgo] }, "$opened", 0],
            },
          },
          monthlyClicks: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", monthAgo] }, "$clicked", 0],
            },
          },
          monthlyUnsubs: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", monthAgo] }, "$unsubscribed", 0],
            },
          },
        },
      },
    ]);

    const s = stats[0] || {};

    /* ================= RESPONSE ================= */
    res.json({
      totalAdmins,
      activeAdmins,

      totalCampaigns: s.totalCampaigns || 0,
      totalEmails: s.totalEmails || 0,
      emailsToday: s.emailsToday || 0,
      failedEmails: 0,

      opened: s.opened || 0,
      clicked: s.clicked || 0,
      unsubscribed: s.unsubscribed || 0,

      weekly: {
        opens: s.weeklyOpens || 0,
        clicks: s.weeklyClicks || 0,
        unsubscribes: s.weeklyUnsubs || 0,
      },

      monthly: {
        opens: s.monthlyOpens || 0,
        clicks: s.monthlyClicks || 0,
        unsubscribes: s.monthlyUnsubs || 0,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

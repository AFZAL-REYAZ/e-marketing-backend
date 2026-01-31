import Admin from "../models/Admin.js";
import Broadcast from "../models/Broadcast.js";

export const getDashboardStats = async (req, res) => {
  try {
    if (req.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    /* ================= ADMINS ================= */
    const totalAdmins = await Admin.countDocuments();
    const activeAdmins = await Admin.countDocuments({ isActive: true });

    /* ================= 🔥 USE ONLY BROADCAST ================= */
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
          opened: { $sum: "$opened" },
          clicked: { $sum: "$clicked" },
          unsubscribed: { $sum: "$unsubscribed" },
        },
      },
    ]);

    const s = stats[0] || {};

    res.json({
      totalAdmins,
      activeAdmins,

      totalCampaigns: s.totalCampaigns || 0,
      totalEmails: s.totalEmails || 0,

      emailsToday: 0,
      failedEmails: 0,

      opened: s.opened || 0,
      clicked: s.clicked || 0,
      unsubscribed: s.unsubscribed || 0,

      weekly: {
        opens: s.opened || 0,
        clicks: s.clicked || 0,
        unsubscribes: s.unsubscribed || 0,
      },

      monthly: {
        opens: s.opened || 0,
        clicks: s.clicked || 0,
        unsubscribes: s.unsubscribed || 0,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

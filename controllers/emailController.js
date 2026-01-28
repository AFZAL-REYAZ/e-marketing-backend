import { Resend } from "resend";
import EmailLog from "../models/EmailLog.js";
import Broadcast from "../models/Broadcast.js";
import Subscriber from "../models/Subscriber.js";
import { renderEmailHTML } from "../utils/renderEmailHTML.js";
import EmailTemplate from "../models/EmailTemplate.js";


export const getEmailHistory = async (req, res) => {
  try {
    const filter =
      req.role === "superadmin"
        ? {}
        : { sentBy: req.adminId };

    const logs = await EmailLog.find(filter)
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




export const sendBulkEmail = async (req, res) => {
  try {
    const { emails, templateId, blocks, scheduledAt } = req.body;

    // ... (Validation and Email Array logic remains same)

    /* ================= SCHEDULING LOGIC ================= */
    let isScheduled = false;
    let scheduledDate = null;

    if (scheduledAt) {
      scheduledDate = new Date(scheduledAt);
      const now = new Date();

      // If the date is valid, TRUST the user and schedule it.
      // We only skip scheduling if the date is invalid.
      if (!isNaN(scheduledDate.getTime())) {
        isScheduled = true;
      }
    }

    /* ================= CREATE BROADCAST ================= */
    const broadcast = await Broadcast.create({
      title: template?.name || "Email Campaign",
      subject: subject || template?.subject || "Campaign",
      recipients: emailArray,
      sentBy: req.adminId,
      blocks: templateBlocks,
      scheduledAt: isScheduled ? scheduledDate : null,
      status: isScheduled ? "scheduled" : "sending", // 🔥 Correct status
      stats: { sent: 0 },
    });

    /* ================= STOP HERE IF SCHEDULED ================= */
    if (isScheduled) {
      console.log(`✅ Campaign ${broadcast._id} locked in for ${scheduledDate}`);
      return res.json({
        message: "Campaign scheduled successfully",
        broadcastId: broadcast._id,
        scheduledAt: scheduledDate,
      });
    }

    /* ================= IMMEDIATE SEND ONLY ================= */
    // This code ONLY runs if isScheduled was false.
    const resend = new Resend(process.env.RESEND_API_KEY);

    for (const email of emailArray) {
      const html = renderEmailHTML(templateBlocks, email, broadcast._id);
      await resend.emails.send({
        from: "ThePDFZone <noreply@thepdfzone.com>",
        to: email,
        subject: broadcast.subject,
        html,
      });
      await new Promise((r) => setTimeout(r, 1000));
    }

    await Broadcast.findByIdAndUpdate(broadcast._id, {
      status: "sent",
      "stats.sent": emailArray.length,
    });

    return res.json({ message: "Campaign sent immediately" });

  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ message: "Email processing failed" });
  }
};




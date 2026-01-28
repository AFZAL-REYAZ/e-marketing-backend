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
    const { emails, templateId, blocks, scheduledAt, subject: manualSubject } = req.body;

    // 1. Basic Validation
    if (!emails || (!templateId && !blocks)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const emailArray = emails.split(/[\n,]+/).map(e => e.trim().toLowerCase()).filter(Boolean);

    /* ================= LOAD TEMPLATE OR BLOCKS ================= */
    let template = null;
    let templateBlocks = blocks || [];
    let finalSubject = manualSubject || "No Subject";

    if (templateId) {
      template = await EmailTemplate.findById(templateId);
      if (!template) return res.status(404).json({ message: "Template not found" });
      
      templateBlocks = template.blocks;
      finalSubject = template.subject;
    }

    /* ================= SCHEDULING ================= */
    let isScheduled = false;
    let scheduledDate = null;

    if (scheduledAt) {
      scheduledDate = new Date(scheduledAt);
      // 🔥 Safety: Check if date is actually valid before calling toISOString()
      if (!isNaN(scheduledDate.getTime())) {
        const now = new Date();
        // Only schedule if it's at least 1 minute in the future
        if (scheduledDate > new Date(now.getTime() + 60000)) {
          isScheduled = true;
        }
      }
    }

    /* ================= CREATE BROADCAST ================= */
    const broadcast = await Broadcast.create({
      title: template?.name || "Manual Campaign",
      subject: finalSubject, // 🔥 Fix: Use the safe variable
      recipients: emailArray,
      sentBy: req.adminId,
      blocks: templateBlocks,
      scheduledAt: isScheduled ? scheduledDate : null,
      status: isScheduled ? "scheduled" : "sending",
      stats: { sent: 0 },
    });

    if (isScheduled) {
      return res.json({
        message: "Campaign scheduled successfully",
        broadcastId: broadcast._id,
        scheduledAt: scheduledDate,
      });
    }

    /* ================= IMMEDIATE SEND ================= */
    const resend = new Resend(process.env.RESEND_API_KEY);

    for (const email of emailArray) {
      const html = renderEmailHTML(templateBlocks, email, broadcast._id);

      await resend.emails.send({
        from: "ThePDFZone <noreply@thepdfzone.com>",
        to: email,
        subject: finalSubject, // 🔥 Fix: Use finalSubject instead of template.subject
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
    console.error("CRITICAL ERROR:", error); // This will show in Render logs
    res.status(500).json({ message: "Server Error: " + error.message });
  }
};




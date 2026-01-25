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
    const { emails, templateId, blocks } = req.body;

    /* ================= VALIDATION ================= */
    if (!emails || (!templateId && !blocks)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    /* ================= NORMALIZE EMAILS ================= */
    const emailArray = emails
      .split(/[\n,]+/)
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);

    if (!emailArray.length) {
      return res.status(400).json({ message: "No valid emails found" });
    }

    /* ================= AUTO-SUBSCRIBE ================= */
    for (const email of emailArray) {
      await Subscriber.findOneAndUpdate(
        { email },
        { $setOnInsert: { isSubscribed: true } },
        { upsert: true }
      );
    }

    /* ================= LOAD TEMPLATE ================= */
    let template = null;
    let templateBlocks = blocks || [];

    if (templateId) {
      template = await EmailTemplate.findById(templateId);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      templateBlocks = template.blocks;
    }

    /* ================= CREATE BROADCAST ================= */
    const broadcast = await Broadcast.create({
      title: template?.name || "Email Campaign",
      subject: template?.subject || "Campaign",
      recipients: emailArray,
      sentBy: req.adminId,
      stats: { sent: emailArray.length },
    });

    const resend = new Resend(process.env.RESEND_API_KEY);

    let sent = 0;
    let failed = 0;

    /* ================= SEND EMAILS ================= */
    for (let i = 0; i < emailArray.length; i++) {
      const email = emailArray[i];

      const subscriber = await Subscriber.findOne({ email });
      if (!subscriber || subscriber.isSubscribed === false) continue;

      try {
        const html = renderEmailHTML(
          templateBlocks,
          email,
          broadcast._id
        );

        await resend.emails.send({
          from: "ThePDFZone <noreply@thepdfzone.com>",
          to: email,
          subject: template.subject, // ✅ FIXED
          html,
          text: `
${template.subject}

This email contains rich content.
Please view in HTML mode.

Unsubscribe:
https://thepdfzone.com/api/unsubscribe?email=${email}
          `,
          replyTo: req.adminEmail,
          headers: {
            "X-Entity-Ref-ID": req.adminId,
          },
        });

        sent++;
      } catch (err) {
        failed++;
      }

      // Optional delay (safe sending)
      await new Promise(r => setTimeout(r, 1000));
    }

    /* ================= SAVE LOG ================= */
    await EmailLog.create({
      recipients: emailArray,
      subject: template.subject,
      message: "[TEMPLATE BASED EMAIL]",
      status: failed ? "partial" : "sent",
      error: failed ? `${failed} failed` : null,
      sentBy: req.adminId,
    });

    return res.json({
      message: "Campaign sent",
      total: emailArray.length,
      sent,
      failed,
    });

  } catch (error) {
    console.error("Send email error:", error);
    res.status(500).json({ message: "Email sending failed" });
  }
};




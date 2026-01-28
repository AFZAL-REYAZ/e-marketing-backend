import { Resend } from "resend";
import Subscriber from "../models/Subscriber.js";
import { renderEmailHTML } from "../utils/renderEmailHTML.js";

export const sendScheduledCampaign = async (broadcast) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  for (const email of broadcast.recipients) {
    const subscriber = await Subscriber.findOne({ email });
    if (!subscriber || subscriber.subscribed === false) continue;

    const html = renderEmailHTML(
      broadcast.blocks || [],
      email,
      broadcast._id
    );

    await resend.emails.send({
      from: "ThePDFZone <noreply@thepdfzone.com>",
      to: email,
      subject: broadcast.subject,
      html,
    });

    await new Promise((r) => setTimeout(r, 1000));
  }
};

import cron from "node-cron";
import Broadcast from "../models/Broadcast.js";
import { sendScheduledCampaign } from "../services/sendScheduledCampaign.js";

cron.schedule("* * * * *", async () => {
  console.log("⏰ Scheduler running...");

  const now = new Date();

  const campaigns = await Broadcast.find({
    status: "scheduled",
    scheduledAt: { $lte: now },
  });

  for (const campaign of campaigns) {
    campaign.status = "sending";
    await campaign.save();

    await sendScheduledCampaign(campaign);

    campaign.status = "sent";
    await campaign.save();
  }
});

import Subscriber from "../models/Subscriber.js";
import Broadcast from "../models/Broadcast.js";

export const unsubscribe = async (req, res) => {
  try {
    const { email, broadcastId } = req.query;

    if (!email) {
      return res.status(400).send("Invalid unsubscribe link");
    }

    // find subscriber first
    let subscriber = await Subscriber.findOne({ email });

    if (subscriber && subscriber.subscribed) {
      subscriber.subscribed = false;
      subscriber.unsubscribedAt = new Date();
      await subscriber.save();
    }

    // ALWAYS increment if broadcast exists
    if (broadcastId) {
      await Broadcast.findByIdAndUpdate(broadcastId, {
        $inc: { "stats.unsubscribed": 1 },
      });
    }

    res.send(`
      <h2>You are unsubscribed</h2>
      <p>You will no longer receive emails.</p>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};


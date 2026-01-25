import Subscriber from "../models/Subscriber.js";
import Broadcast from "../models/Broadcast.js";

export const unsubscribe = async (req, res) => {
  try {
    const { email, broadcastId } = req.query;

    if (!email) {
      return res.status(400).send("Invalid unsubscribe link");
    }

    // ✅ prevent double unsubscribe
    const subscriber = await Subscriber.findOneAndUpdate(
      { email, subscribed: true },
      {
        subscribed: false,
        unsubscribedAt: new Date(),
      },
      { new: true }
    );

    // ✅ increment only ONCE per broadcast
    if (subscriber && broadcastId) {
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

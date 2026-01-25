import Broadcast from "../models/Broadcast.js";

/* ================= OPEN TRACK ================= */

export const trackOpen = async (req, res) => {
  try {
    const { broadcastId } = req.params;

    await Broadcast.findByIdAndUpdate(broadcastId, {
      $inc: { "stats.opened": 1 },
    });

    // return 1x1 transparent pixel
    const pixel = Buffer.from(
      "R0lGODlhAQABAIAAAP///////yH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
      "base64"
    );

    res.set("Content-Type", "image/gif");
    res.send(pixel);
  } catch (error) {
    res.status(200).end(); // never break email loading
  }
};

/* ================= CLICK TRACK ================= */

export const trackClick = async (req, res) => {
  try {
    const { broadcastId } = req.params;
    const { url } = req.query;

    if (!url) return res.status(400).send("Invalid URL");

    await Broadcast.findByIdAndUpdate(broadcastId, {
      $inc: { 
        "stats.clicked": 1,
        "stats.opened": 1,
    },
    });

    res.redirect(url);
  } catch (error) {
    res.status(500).send("Tracking error");
  }
};

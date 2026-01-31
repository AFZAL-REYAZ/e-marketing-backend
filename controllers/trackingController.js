import Broadcast from "../models/Broadcast.js";

/* ================= OPEN TRACK ================= */

export const trackOpen = async (req, res) => {
  try {
    const { broadcastId } = req.params;

    await Broadcast.findByIdAndUpdate(broadcastId, {
      $inc: { "stats.opened": 1 },
    });

    const pixel = Buffer.from(
      "R0lGODlhAQABAIAAAP///////yH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
      "base64"
    );

    res.set("Content-Type", "image/gif");
    res.send(pixel);
  } catch {
    res.status(200).end();
  }
};

export const trackClick = async (req, res) => {
  try {
    const { broadcastId } = req.params;
    const { url } = req.query;

    await Broadcast.findByIdAndUpdate(broadcastId, {
      $inc: { "stats.clicked": 1 },
    });

    return res.redirect(302, decodeURIComponent(url));
  } catch {
    res.status(500).send("Tracking error");
  }
};



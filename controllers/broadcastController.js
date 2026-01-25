import Broadcast from "../models/Broadcast.js";

export const getBroadcasts = async (req, res) => {
  try {
    const filter =
      req.role === "superadmin"
        ? {}
        : { sentBy: req.adminId };

    const broadcasts = await Broadcast.find(filter)
      .sort({ createdAt: -1 });

    res.json(broadcasts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBroadcastById = async (req, res) => {
  try {
    const { id } = req.params;

    const filter =
      req.role === "superadmin"
        ? { _id: id }
        : { _id: id, sentBy: req.adminId };

    const broadcast = await Broadcast.findOne(filter);

    if (!broadcast) {
      return res.status(404).json({ message: "Broadcast not found" });
    }

    res.json(broadcast);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



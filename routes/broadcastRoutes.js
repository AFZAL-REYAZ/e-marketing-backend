import express from "express";
import {
  getBroadcasts,
  getBroadcastById,
} from "../controllers/broadcastController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📃 List broadcasts
router.get("/", protect, getBroadcasts);

// 📊 Broadcast analytics (NEW)
router.get("/:id", protect, getBroadcastById);

export default router;

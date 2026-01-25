import express from "express";
import {
  sendBulkEmail,
  getEmailHistory,
  // sendBulkEmailWithProgress,
} from "../controllers/emailController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📤 Send bulk email (normal)
router.post("/send", protect, sendBulkEmail);

// 📡 Send bulk email with progress (SSE)
// router.post("/send-progress", protect, sendBulkEmailWithProgress);

// 📜 Email history
router.get("/history", protect, getEmailHistory);

export default router;
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getAdminDashboardStats } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/stats", protect, getAdminDashboardStats);

export default router;
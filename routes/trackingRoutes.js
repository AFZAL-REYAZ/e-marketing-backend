import express from "express";
import { trackOpen, trackClick } from "../controllers/trackingController.js";

const router = express.Router();

router.get("/open/:broadcastId", trackOpen);
router.get("/click/:broadcastId", trackClick);

export default router;

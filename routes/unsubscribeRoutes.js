import express from "express";
import { unsubscribe } from "../controllers/unsubscribeController.js";

const router = express.Router();

router.get("/", unsubscribe);

export default router;

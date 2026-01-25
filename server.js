import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import emailRoutes from "./routes/emailRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import trackingRoutes from "./routes/trackingRoutes.js";
import broadcastRoutes from "./routes/broadcastRoutes.js";
import unsubscribeRoutes from "./routes/unsubscribeRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// 🔗 MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));


app.use("/api/auth", authRoutes);
app.use("/api/email", emailRoutes);

app.use("/api/admin", adminRoutes);

// console.log("🔥 Registering dashboard routes");
app.use("/api/dashboard", dashboardRoutes);

app.use("/api/admin-dashboard", adminDashboardRoutes);
app.use("/api/track", trackingRoutes);
app.use("/api/broadcasts", broadcastRoutes);

app.use("/api/unsubscribe", unsubscribeRoutes);
app.use("/api/templates", templateRoutes);

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
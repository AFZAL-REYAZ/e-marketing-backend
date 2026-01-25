import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "./models/Admin.js";
import "dotenv/config";

await mongoose.connect(process.env.MONGO_URI);

const hashedPassword = await bcrypt.hash("admin123", 10);

await Admin.create({
  email: "softwarebeatz@gmail.com",
  password: hashedPassword,
  role: "superadmin", // 👑 IMPORTANT
});

console.log("✅ Super Admin created");
process.exit();

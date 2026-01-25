import express from "express";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import { protect } from "../middleware/authMiddleware.js";
import { superAdminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// 👑 Superadmin creates admin
router.post("/create", protect, superAdminOnly, async (req, res) => {
  const { email, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await Admin.create({
    email,
    password: hashedPassword,
    role: role || "admin",
  });

  res.json({
    message: "Admin created successfully",
    admin: {
      email: admin.email,
      role: admin.role,
    },
  });
});

/* 🔹 GET ALL ADMINS */
router.get("/", protect, async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* 🔹 ENABLE / DISABLE ADMIN */
router.put("/:id/status", protect, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.isActive = !admin.isActive;
    await admin.save();

    res.json({
      message: "Admin status updated",
      isActive: admin.isActive,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



router.delete("/:id", protect, superAdminOnly, async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.role === "superadmin") {
      return res.status(403).json({ message: "Cannot delete superadmin" });
    }

    await admin.deleteOne();

    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;


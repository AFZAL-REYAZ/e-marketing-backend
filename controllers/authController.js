import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });

  if (!admin) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // 🚫 BLOCK DISABLED ADMINS
  if (!admin.isActive) {
    return res.status(403).json({
      message: "Your account has been disabled. Contact super admin.",
    });
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      id: admin._id,
      role: admin.role,
      email: admin.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    admin: {
      email: admin.email,
      role: admin.role,
    },
  });
};

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  console.log("📩 Email received:", email);
  console.log("🔑 Password received:", password);
  console.log("EMAIL:", email);
  console.log("PASSWORD:", password);

  const admin = await Admin.findOne({ email });
  console.log("👤 Admin found:", admin);

  if (!admin) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  console.log("🔐 Password match:", isMatch);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
  {
    id: admin._id,
    role: admin.role, // 👈 ADD ROLE
    email: admin.email,
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

res.json({
  token,
  admin: {
    email: admin.email,
    role: admin.role, // 👈 SEND ROLE TO FRONTEND
  },
});

};

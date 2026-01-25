import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive) {
      return res.status(403).json({ message: "Account disabled" });
    }

    req.adminId = admin._id;
    req.role = admin.role;
    req.adminEmail = admin.email;

    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

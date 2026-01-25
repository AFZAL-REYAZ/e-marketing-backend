import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.adminId = decoded.id;
    req.role = decoded.role; // 👈 STORE ROLE
    req.adminEmail = decoded.email;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

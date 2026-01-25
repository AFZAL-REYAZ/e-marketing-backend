export const superAdminOnly = (req, res, next) => {
  if (req.role !== "superadmin") {
    return res.status(403).json({
      message: "Access denied. Super admin only.",
    });
  }
  next();
};

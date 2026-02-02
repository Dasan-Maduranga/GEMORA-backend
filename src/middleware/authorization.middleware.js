/**
 * Authorization Middleware
 * Checks if user has required role(s) for accessing resources
 */

/**
 * Check if user has required role
 * Usage: router.get("/admin", authorize("admin"), controller)
 * or: router.get("/resource", authorize(["admin", "moderator"]), controller)
 */
exports.authorize = (requiredRoles) => {
  return (req, res, next) => {
    // Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Convert single role to array for consistency
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    // Check if user has one of the required roles
    if (!rolesArray.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${rolesArray.join(", ")}` 
      });
    }

    next();
  };
};

/**
 * Check if user is admin
 * Shorthand for authorize("admin")
 */
exports.adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

/**
 * Check if user is either owner or admin
 * Useful for resource-specific permissions
 */
exports.ownerOrAdmin = (resourceOwnerField = "userId") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const isOwner = req.params.userId === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied. Not owner or admin" });
    }

    next();
  };
};

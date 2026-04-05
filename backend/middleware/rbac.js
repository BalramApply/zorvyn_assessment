/**
 * Role-Based Access Control (RBAC) Middleware
 *
 * Role hierarchy:
 *   viewer   → read-only (dashboard + records)
 *   analyst  → viewer + summary/insight endpoints
 *   admin    → full access including user management
 *
 * Usage:
 *   router.post("/records", authenticate, authorize("admin"), createRecord);
 *   router.get("/summary", authenticate, authorize("analyst", "admin"), getSummary);
 */

const ROLE_HIERARCHY = {
  viewer: 1,
  analyst: 2,
  admin: 3,
};

/**
 * Returns middleware that allows access only if req.user's role
 * matches one of the provided allowedRoles.
 *
 * @param  {...string} allowedRoles - roles permitted to access the route
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userRoleLevel = ROLE_HIERARCHY[req.user.role] ?? 0;
    const hasPermission = allowedRoles.some(
      (role) => ROLE_HIERARCHY[role] !== undefined && userRoleLevel >= ROLE_HIERARCHY[role]
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of: [${allowedRoles.join(", ")}]. Your role: ${req.user.role}.`,
      });
    }

    next();
  };
};

/**
 * Convenience: require at least analyst-level access
 */
const analystOrAbove = authorize("analyst");

/**
 * Convenience: require admin-level access
 */
const adminOnly = authorize("admin");

module.exports = { authorize, analystOrAbove, adminOnly };
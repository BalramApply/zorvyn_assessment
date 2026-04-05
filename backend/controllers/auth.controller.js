const authService = require("../services/auth.service");

/**
 * POST /api/auth/register
 * Public – creates a new user account.
 * Only admins may create other admin accounts (enforced here).
 */
// const authService = require("../services/auth.service");

// ✅ Normal user register (PUBLIC)
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const { user, token } = await authService.register({
      name,
      email,
      password,
      role: "viewer", // force viewer
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Admin register (PROTECTED)
const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // 🔒 Only admin allowed
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can create admin accounts.",
      });
    }

    const { user, token } = await authService.register({
      name,
      email,
      password,
      role: role || "admin",
    });

    return res.status(201).json({
      success: true,
      message: "Admin created successfully.",
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
};

// login + me (same as before)
/**
 * POST /api/auth/login
 * Public – authenticates a user and returns a JWT.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login({ email, password });

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Protected – returns the currently authenticated user's profile.
 */
const getMe = (req, res) => {
  return res.status(200).json({
    success: true,
    data: { user: req.user },
  });
};

module.exports = {
  register,
  registerAdmin,
  login,
  getMe,
};
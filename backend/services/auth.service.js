const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Generates a signed JWT for the given user id.
 */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/**
 * Registers a new user.
 * Only admins may assign the admin role via the API; otherwise
 * role defaults to viewer (as enforced in the controller layer).
 */
const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("An account with this email already exists.");
    err.statusCode = 409;
    throw err;
  }

  const user = await User.create({ name, email, password, role });
  const token = signToken(user._id);
  return { user, token };
};

/**
 * Authenticates a user and returns a token.
 */
const login = async ({ email, password }) => {
  // Explicitly select password since it is hidden by default
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    const err = new Error("Incorrect email or password.");
    err.statusCode = 401;
    throw err;
  }

  if (user.status === "inactive") {
    const err = new Error("Your account is deactivated. Contact an administrator.");
    err.statusCode = 403;
    throw err;
  }

  const token = signToken(user._id);
  return { user, token };
};

module.exports = { register, login };
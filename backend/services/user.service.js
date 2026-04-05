const User = require("../models/User");

/**
 * Returns all users (admin-only operation).
 */
const getAllUsers = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(),
  ]);
  return { users, total, page: Number(page), limit: Number(limit) };
};

/**
 * Returns a single user by id.
 */
const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }
  return user;
};

/**
 * Updates role and/or status of a user.
 * Prevents an admin from deactivating their own account.
 */
const updateUser = async (targetId, updates, requesterId) => {
  if (
    String(targetId) === String(requesterId) &&
    updates.status === "inactive"
  ) {
    const err = new Error("Admins cannot deactivate their own account.");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findByIdAndUpdate(
    targetId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }

  return user;
};

/**
 * Deletes a user (permanent, admin-only).
 * Prevents self-deletion.
 */
const deleteUser = async (targetId, requesterId) => {
  if (String(targetId) === String(requesterId)) {
    const err = new Error("Admins cannot delete their own account.");
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findByIdAndDelete(targetId);
  if (!user) {
    const err = new Error("User not found.");
    err.statusCode = 404;
    throw err;
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
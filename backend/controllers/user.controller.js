const userService = require("../services/user.service");

/**
 * GET /api/users
 * Admin only – returns all users with pagination.
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await userService.getAllUsers({ page, limit });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:id
 * Admin only – returns a single user.
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/users/:id
 * Admin only – updates role or status of a user.
 */
const updateUser = async (req, res, next) => {
  try {
    // Only allow role and status to be changed via this route
    const { role, status, name } = req.body;
    const updates = {};
    if (role !== undefined) updates.role = role;
    if (status !== undefined) updates.status = status;
    if (name !== undefined) updates.name = name;

    const user = await userService.updateUser(
      req.params.id,
      updates,
      req.user._id
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/users/:id
 * Admin only – permanently removes a user.
 */
const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req.user._id);
    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser }; 
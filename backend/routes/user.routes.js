const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const authenticate = require("../middleware/authenticate");
const { adminOnly } = require("../middleware/rbac");
const { updateUserRules } = require("../validators/user.validator");
const { validate } = require("../middleware/errorHandler");

// All user-management routes require authentication + admin role
router.use(authenticate, adminOnly);

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.patch("/:id", updateUserRules, validate, userController.updateUser);
router.delete("/:id", userController.deleteUser);

module.exports = router;
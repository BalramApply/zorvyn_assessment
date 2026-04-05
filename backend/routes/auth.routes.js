const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authenticate = require("../middleware/authenticate");
const { registerRules, loginRules } = require("../validators/auth.validator");
const { validate } = require("../middleware/errorHandler");

// Public routes
router.post("/register", registerRules, validate, authController.register);
router.post("/login", loginRules, validate, authController.login);

// Protected – any authenticated user can view their own profile
router.post("/register-admin", authenticate, registerRules, validate, authController.registerAdmin, );

router.get("/me", authenticate, authController.getMe);

module.exports = router;

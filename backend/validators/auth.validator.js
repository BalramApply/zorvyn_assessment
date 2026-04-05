const { body } = require("express-validator");

const registerRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ max: 80 }).withMessage("Name cannot exceed 80 characters."),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),

  body("role")
    .optional()
    .isIn(["viewer", "analyst", "admin"]).withMessage("Role must be viewer, analyst, or admin."),
];

const loginRules = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required."),
];

module.exports = { registerRules, loginRules };
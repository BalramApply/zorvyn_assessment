const { body } = require("express-validator");

const updateUserRules = [
  body("name")
    .optional()
    .trim()
    .isLength({ max: 80 }).withMessage("Name cannot exceed 80 characters."),

  body("role")
    .optional()
    .isIn(["viewer", "analyst", "admin"]).withMessage("Role must be viewer, analyst, or admin."),

  body("status")
    .optional()
    .isIn(["active", "inactive"]).withMessage("Status must be active or inactive."),
];

module.exports = { updateUserRules };
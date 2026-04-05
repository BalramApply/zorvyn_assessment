const { body, query } = require("express-validator");

const createRules = [
  body("amount")
    .notEmpty().withMessage("Amount is required.")
    .isFloat({ gt: 0 }).withMessage("Amount must be a positive number."),

  body("type")
    .notEmpty().withMessage("Type is required.")
    .isIn(["income", "expense"]).withMessage("Type must be income or expense."),

  body("category")
    .trim()
    .notEmpty().withMessage("Category is required.")
    .isLength({ max: 60 }).withMessage("Category cannot exceed 60 characters."),

  body("date")
    .optional()
    .isISO8601().withMessage("Date must be a valid ISO 8601 date (e.g. 2024-06-01)."),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters."),
];

const updateRules = [
  body("amount")
    .optional()
    .isFloat({ gt: 0 }).withMessage("Amount must be a positive number."),

  body("type")
    .optional()
    .isIn(["income", "expense"]).withMessage("Type must be income or expense."),

  body("category")
    .optional()
    .trim()
    .isLength({ max: 60 }).withMessage("Category cannot exceed 60 characters."),

  body("date")
    .optional()
    .isISO8601().withMessage("Date must be a valid ISO 8601 date."),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters."),
];

const filterRules = [
  query("type")
    .optional()
    .isIn(["income", "expense"]).withMessage("Type must be income or expense."),

  query("startDate")
    .optional()
    .isISO8601().withMessage("startDate must be a valid ISO 8601 date."),

  query("endDate")
    .optional()
    .isISO8601().withMessage("endDate must be a valid ISO 8601 date."),

  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("Page must be a positive integer."),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100."),
];

module.exports = { createRules, updateRules, filterRules };
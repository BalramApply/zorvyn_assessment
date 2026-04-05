const express = require("express");
const router = express.Router();

const txController = require("../controllers/transaction.controller");
const authenticate = require("../middleware/authenticate");
const { authorize, adminOnly } = require("../middleware/rbac");
const {
  createRules,
  updateRules,
  filterRules,
} = require("../validators/transaction.validator");
const { validate } = require("../middleware/errorHandler");

// All transaction routes require a valid token
router.use(authenticate);

// Viewer, Analyst, and Admin can read records
router.get("/", filterRules, validate, authorize("viewer"), txController.getAll);
router.get("/:id", authorize("viewer"), txController.getById);

// Only admins can create, update, or delete records
router.post("/", adminOnly, createRules, validate, txController.create);
router.patch("/:id", adminOnly, updateRules, validate, txController.update);
router.delete("/:id", adminOnly, txController.remove);

module.exports = router;
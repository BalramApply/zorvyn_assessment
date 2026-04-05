const transactionService = require("../services/transaction.service");

/**
 * GET /api/transactions
 * Viewer+ – returns paginated, filterable list of transactions.
 *
 * Query params:
 *   type, category, startDate, endDate, search,
 *   page, limit, sortBy, order
 */
const getAll = async (req, res, next) => {
  try {
    const result = await transactionService.getAll(req.query);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/transactions/:id
 * Viewer+ – returns a single transaction by id.
 */
const getById = async (req, res, next) => {
  try {
    const transaction = await transactionService.getById(req.params.id);
    return res.status(200).json({ success: true, data: { transaction } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/transactions
 * Admin only – creates a new financial record.
 */
const create = async (req, res, next) => {
  try {
    const transaction = await transactionService.create(req.body, req.user._id);
    return res.status(201).json({
      success: true,
      message: "Transaction created successfully.",
      data: { transaction },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/transactions/:id
 * Admin only – updates an existing transaction.
 * (Ownership check inside service layer allows creator to edit too.)
 */
const update = async (req, res, next) => {
  try {
    const transaction = await transactionService.update(
      req.params.id,
      req.body,
      req.user
    );
    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully.",
      data: { transaction },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/transactions/:id
 * Admin only – soft-deletes a transaction.
 */
const remove = async (req, res, next) => {
  try {
    await transactionService.softDelete(req.params.id, req.user);
    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
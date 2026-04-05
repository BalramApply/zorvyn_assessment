const Transaction = require("../models/Transaction");

/**
 * Builds a Mongoose query filter from request query parameters.
 */
const buildFilter = ({ type, category, startDate, endDate, search }) => {
  const filter = {};

  if (type) filter.type = type;
  if (category) filter.category = { $regex: category, $options: "i" };
  if (search) filter.notes = { $regex: search, $options: "i" };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  return filter;
};

/**
 * Returns paginated list of transactions with optional filters.
 */
const getAll = async (queryParams) => {
  const { page = 1, limit = 20, sortBy = "date", order = "desc" } = queryParams;
  const skip = (page - 1) * limit;
  const filter = buildFilter(queryParams);
  const sortOrder = order === "asc" ? 1 : -1;

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate("createdBy", "name email role")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit)),
    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Returns a single transaction by id.
 */
const getById = async (id) => {
  const transaction = await Transaction.findById(id).populate(
    "createdBy",
    "name email role"
  );
  if (!transaction) {
    const err = new Error("Transaction not found.");
    err.statusCode = 404;
    throw err;
  }
  return transaction;
};

/**
 * Creates a new transaction.
 */
const create = async (data, userId) => {
  const transaction = await Transaction.create({ ...data, createdBy: userId });
  return transaction;
};

/**
 * Updates a transaction. Only the creator or an admin may update.
 */
const update = async (id, data, user) => {
  const transaction = await Transaction.findById(id);

  if (!transaction) {
    const err = new Error("Transaction not found.");
    err.statusCode = 404;
    throw err;
  }

  const isOwner = String(transaction.createdBy) === String(user._id);
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    const err = new Error("You do not have permission to update this transaction.");
    err.statusCode = 403;
    throw err;
  }

  Object.assign(transaction, data);
  await transaction.save();
  return transaction;
};

/**
 * Soft-deletes a transaction by setting isDeleted = true.
 * Only the creator or an admin may delete.
 */
const softDelete = async (id, user) => {
  // Bypass the pre-find middleware to allow finding already-deleted docs if needed
  const transaction = await Transaction.findOne({ _id: id, isDeleted: false });

  if (!transaction) {
    const err = new Error("Transaction not found.");
    err.statusCode = 404;
    throw err;
  }

  const isOwner = String(transaction.createdBy) === String(user._id);
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAdmin) {
    const err = new Error("You do not have permission to delete this transaction.");
    err.statusCode = 403;
    throw err;
  }

  transaction.isDeleted = true;
  transaction.deletedAt = new Date();
  await transaction.save();
};

module.exports = { getAll, getById, create, update, softDelete };
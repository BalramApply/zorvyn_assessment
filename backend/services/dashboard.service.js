const Transaction = require("../models/Transaction");

/**
 * Returns high-level summary: total income, total expenses, net balance.
 */
const getOverview = async () => {
  const result = await Transaction.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  const summary = { totalIncome: 0, totalExpenses: 0, incomeCount: 0, expenseCount: 0 };

  for (const row of result) {
    if (row._id === "income") {
      summary.totalIncome = row.total;
      summary.incomeCount = row.count;
    } else if (row._id === "expense") {
      summary.totalExpenses = row.total;
      summary.expenseCount = row.count;
    }
  }

  summary.netBalance = summary.totalIncome - summary.totalExpenses;
  summary.totalTransactions = summary.incomeCount + summary.expenseCount;

  return summary;
};

/**
 * Returns totals broken down by category.
 */
const getCategoryBreakdown = async () => {
  const breakdown = await Transaction.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { category: "$category", type: "$type" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: "$_id.category",
        entries: {
          $push: {
            type: "$_id.type",
            total: "$total",
            count: "$count",
          },
        },
        grandTotal: { $sum: "$total" },
      },
    },
    { $sort: { grandTotal: -1 } },
  ]);

  return breakdown.map((item) => ({
    category: item._id,
    grandTotal: item.grandTotal,
    breakdown: item.entries,
  }));
};

/**
 * Returns monthly income and expense totals for the given year.
 * Defaults to current year.
 */
const getMonthlyTrends = async (year) => {
  const targetYear = parseInt(year) || new Date().getFullYear();

  const trends = await Transaction.aggregate([
    {
      $match: {
        isDeleted: false,
        date: {
          $gte: new Date(`${targetYear}-01-01`),
          $lte: new Date(`${targetYear}-12-31T23:59:59`),
        },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  // Build a full 12-month matrix even for months with no data
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: new Date(targetYear, i, 1).toLocaleString("default", { month: "long" }),
    income: 0,
    expense: 0,
    net: 0,
  }));

  for (const row of trends) {
    const monthIdx = row._id.month - 1;
    if (row._id.type === "income") months[monthIdx].income = row.total;
    if (row._id.type === "expense") months[monthIdx].expense = row.total;
  }

  for (const m of months) {
    m.net = m.income - m.expense;
  }

  return { year: targetYear, months };
};

/**
 * Returns the N most recent transactions (default 10).
 */
const getRecentActivity = async (limit = 10) => {
  return Transaction.find()
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .limit(Number(limit));
};

/**
 * Returns weekly totals for the past N weeks (default 4 weeks).
 */
const getWeeklyTrends = async (weeks = 4) => {
  const weeksBack = parseInt(weeks) || 4;
  const since = new Date();
  since.setDate(since.getDate() - weeksBack * 7);

  const trends = await Transaction.aggregate([
    {
      $match: {
        isDeleted: false,
        date: { $gte: since },
      },
    },
    {
      $group: {
        _id: {
          week: { $isoWeek: "$date" },
          year: { $isoWeekYear: "$date" },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.week": 1 } },
  ]);

  return trends;
};

module.exports = {
  getOverview,
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentActivity,
  getWeeklyTrends,
};
const dashboardService = require("../services/dashboard.service");

/**
 * GET /api/dashboard/overview
 * Analyst+ – returns total income, expenses, and net balance.
 */
const getOverview = async (req, res, next) => {
  try {
    const summary = await dashboardService.getOverview();
    return res.status(200).json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/categories
 * Analyst+ – returns spending/income breakdown by category.
 */
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const breakdown = await dashboardService.getCategoryBreakdown();
    return res.status(200).json({ success: true, data: breakdown });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/monthly?year=2024
 * Analyst+ – returns monthly income/expense totals for a given year.
 */
const getMonthlyTrends = async (req, res, next) => {
  try {
    const data = await dashboardService.getMonthlyTrends(req.query.year);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/recent?limit=10
 * Analyst+ – returns the most recent N transactions.
 */
const getRecentActivity = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const transactions = await dashboardService.getRecentActivity(limit);
    return res.status(200).json({ success: true, data: { transactions } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dashboard/weekly?weeks=4
 * Analyst+ – returns weekly income/expense totals for the past N weeks.
 */
const getWeeklyTrends = async (req, res, next) => {
  try {
    const { weeks } = req.query;
    const data = await dashboardService.getWeeklyTrends(weeks);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOverview,
  getCategoryBreakdown,
  getMonthlyTrends,
  getRecentActivity,
  getWeeklyTrends,
};
const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboard.controller");
const authenticate = require("../middleware/authenticate");
const { analystOrAbove } = require("../middleware/rbac");

// All dashboard routes require analyst-level access or above
router.use(authenticate, analystOrAbove);

router.get("/overview", dashboardController.getOverview);
router.get("/categories", dashboardController.getCategoryBreakdown);
router.get("/monthly", dashboardController.getMonthlyTrends);
router.get("/recent", dashboardController.getRecentActivity);
router.get("/weekly", dashboardController.getWeeklyTrends);

module.exports = router;
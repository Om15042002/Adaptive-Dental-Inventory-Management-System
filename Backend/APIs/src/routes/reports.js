const express = require('express');
const router = express.Router();
const ReportsController = require('../controllers/reportsController');
const { 
    validateDateRange,
    handleValidationErrors,
    sanitizeBody 
} = require('../middleware/validation');
const { 
    authenticateToken, 
    requireStaff 
} = require('../middleware/auth');

// Apply sanitization to all routes
router.use(sanitizeBody);

// All report routes require at least staff authentication
router.use(authenticateToken);
router.use(requireStaff);

// GET /api/reports/dashboard - Get comprehensive dashboard report
router.get('/dashboard',
    ReportsController.getDashboardReport
);

// GET /api/reports/usage - Usage analytics
router.get('/usage',
    ReportsController.getUsageReport
);

// GET /api/reports/costs - Cost analysis
router.get('/costs',
    validateDateRange,
    handleValidationErrors,
    ReportsController.getCostReport
);

// GET /api/reports/low-stock-summary - Low stock by category
router.get('/low-stock-summary',
    ReportsController.getLowStockSummaryReport
);

// GET /api/reports/stock-value - Total inventory value
router.get('/stock-value',
    ReportsController.getInventoryValueReport
);

// GET /api/reports/custom - Generate custom report
router.get('/custom',
    ReportsController.getCustomReport
);

module.exports = router;
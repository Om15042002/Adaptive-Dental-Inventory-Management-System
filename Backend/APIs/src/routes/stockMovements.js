const express = require('express');
const router = express.Router();
const StockMovementController = require('../controllers/stockMovementController');
const { 
    validateStockMovement,
    validateIdParam,
    validateProductIdParam,
    validateDateRange,
    validatePagination,
    handleValidationErrors,
    sanitizeBody 
} = require('../middleware/validation');
const { 
    authenticateToken, 
    requireAdmin, 
    requireStaff 
} = require('../middleware/auth');

// Apply sanitization to all routes
router.use(sanitizeBody);

// All stock movement routes require at least staff authentication
router.use(authenticateToken);
router.use(requireStaff);

// GET /api/stock-movements - Get movement history
router.get('/',
    validatePagination,
    validateDateRange,
    handleValidationErrors,
    StockMovementController.getAllStockMovements
);

// GET /api/stock-movements/recent - Get recent stock movements
router.get('/recent',
    StockMovementController.getRecentMovements
);

// GET /api/stock-movements/stats - Get movement statistics
router.get('/stats',
    validateDateRange,
    handleValidationErrors,
    StockMovementController.getMovementStats
);

// GET /api/stock-movements/usage-analytics - Get usage analytics
router.get('/usage-analytics',
    StockMovementController.getUsageAnalytics
);

// GET /api/stock-movements/cost-analysis - Get cost analysis
router.get('/cost-analysis',
    validateDateRange,
    handleValidationErrors,
    StockMovementController.getCostAnalysis
);

// GET /api/stock-movements/product/:productId - Get movements for specific product
router.get('/product/:productId',
    validateProductIdParam,
    handleValidationErrors,
    StockMovementController.getStockMovementsByProduct
);

// GET /api/stock-movements/:id - Get specific stock movement
router.get('/:id',
    validateIdParam,
    handleValidationErrors,
    StockMovementController.getStockMovementById
);

// POST /api/stock-movements - Record stock transaction
router.post('/',
    validateStockMovement,
    handleValidationErrors,
    StockMovementController.createStockMovement
);

// POST /api/stock-movements/bulk - Bulk create stock movements (admin only)
router.post('/bulk',
    requireAdmin,
    StockMovementController.bulkCreateMovements
);

// DELETE /api/stock-movements/:id - Delete stock movement (admin only)
router.delete('/:id',
    requireAdmin,
    validateIdParam,
    handleValidationErrors,
    StockMovementController.deleteStockMovement
);

module.exports = router;
const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/inventoryController');
const { 
    validateInventory,
    validateStockUpdate,
    validateStockAdjustment,
    validateIdParam,
    validateProductIdParam,
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

// All inventory routes require at least staff authentication
router.use(authenticateToken);
router.use(requireStaff);

// GET /api/inventory - List all inventory items
router.get('/',
    validatePagination,
    handleValidationErrors,
    InventoryController.getAllInventory
);

// GET /api/inventory/dashboard - Get dashboard stats
router.get('/dashboard',
    InventoryController.getDashboardStats
);

// GET /api/inventory/low-stock - Get items below threshold
router.get('/low-stock',
    InventoryController.getLowStockItems
);

// GET /api/inventory/low-stock-summary - Get low stock summary by category
router.get('/low-stock-summary',
    InventoryController.getLowStockSummary
);

// GET /api/inventory/value - Get total inventory value
router.get('/value',
    InventoryController.getInventoryValue
);

// GET /api/inventory/by-frequency/:frequency - Get items by reorder frequency
router.get('/by-frequency/:frequency',
    InventoryController.getInventoryByFrequency
);

// GET /api/inventory/product/:productId - Get inventory for specific product
router.get('/product/:productId',
    validateProductIdParam,
    handleValidationErrors,
    InventoryController.getInventoryByProduct
);

// GET /api/inventory/:id - Get specific inventory item
router.get('/:id',
    validateIdParam,
    handleValidationErrors,
    InventoryController.getInventoryById
);

// POST /api/inventory - Create inventory record for a product (admin only)
router.post('/',
    requireAdmin,
    validateInventory,
    handleValidationErrors,
    InventoryController.createInventory
);

// PUT /api/inventory/:id - Update stock levels
router.put('/:id',
    validateIdParam,
    validateStockUpdate,
    handleValidationErrors,
    InventoryController.updateStock
);

// POST /api/inventory/adjust/:productId - Adjust stock (add or subtract)
router.post('/adjust/:productId',
    validateProductIdParam,
    validateStockAdjustment,
    handleValidationErrors,
    InventoryController.adjustStock
);

// DELETE /api/inventory/:id - Delete inventory record (admin only)
router.delete('/:id',
    requireAdmin,
    validateIdParam,
    handleValidationErrors,
    InventoryController.deleteInventory
);

module.exports = router;
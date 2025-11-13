const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const router = express.Router();

// Fetch all inventory with pagination and search
router.get('/', inventoryController.getAllInventory);

// Get dashboard statistics
router.get('/stats/dashboard', inventoryController.getInventoryStats);

// Get low stock alerts
router.get('/alerts/low-stock', inventoryController.getLowStockAlerts);

// Get overstock items
router.get('/alerts/overstock', inventoryController.getOverstockItems);

// Get specific inventory by product ID
router.get('/:productId', inventoryController.getInventoryByProductId);

// Update inventory levels
router.put('/:productId', inventoryController.updateInventory);

module.exports = router;

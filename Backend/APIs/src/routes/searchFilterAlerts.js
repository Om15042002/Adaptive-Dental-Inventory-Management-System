const express = require('express');
const router = express.Router();
const SearchFilterController = require('../controllers/searchFilterController');
const LowStockAlertController = require('../controllers/lowStockAlertController');
const { authenticateToken, requireStaff } = require('../middleware/auth');
const { handleValidationErrors, sanitizeBody } = require('../middleware/validation');

// Apply sanitization to all routes
router.use(sanitizeBody);

// All routes require authentication
router.use(authenticateToken);

// ===== SEARCH ROUTES =====
/**
 * @route GET /api/search/products
 * @description Search products by name, SKU, or description
 * @query {string} query - Search query (required)
 * @query {number} limit - Results per page (default: 50)
 * @query {number} offset - Pagination offset (default: 0)
 */
router.get('/products', SearchFilterController.searchProducts);

// ===== FILTER ROUTES =====
/**
 * @route GET /api/filter/category
 * @description Filter products by category
 * @query {number} categoryId - Category ID (required)
 * @query {number} limit - Results per page (default: 50)
 * @query {number} offset - Pagination offset (default: 0)
 */
router.get('/category', SearchFilterController.filterByCategory);

/**
 * @route GET /api/filter/supplier
 * @description Filter products by supplier
 * @query {number} supplierId - Supplier ID (required)
 * @query {number} limit - Results per page (default: 50)
 * @query {number} offset - Pagination offset (default: 0)
 */
router.get('/supplier', SearchFilterController.filterBySupplier);

/**
 * @route GET /api/filter/advanced
 * @description Advanced filter with multiple criteria
 * @query {number} categoryId - Category ID (optional)
 * @query {number} supplierId - Supplier ID (optional)
 * @query {number} minPrice - Minimum price (optional)
 * @query {number} maxPrice - Maximum price (optional)
 * @query {boolean} inStock - Filter in stock items (default: true)
 * @query {number} limit - Results per page (default: 50)
 * @query {number} offset - Pagination offset (default: 0)
 */
router.get('/advanced', SearchFilterController.advancedFilter);

/**
 * @route GET /api/filter/stock-status
 * @description Filter products by stock status
 * @query {string} status - Stock status (out_of_stock, low_stock, in_stock)
 * @query {number} limit - Results per page (default: 50)
 * @query {number} offset - Pagination offset (default: 0)
 */
router.get('/stock-status', SearchFilterController.filterByStockStatus);

// ===== LOW STOCK ALERT ROUTES =====
/**
 * @route GET /api/alerts/low-stock
 * @description Get all low stock items
 * @query {number} limit - Results per page (default: 100)
 * @query {number} offset - Pagination offset (default: 0)
 */
router.get('/low-stock', LowStockAlertController.getLowStockAlerts);

/**
 * @route GET /api/alerts/critical
 * @description Get critical low stock items only
 */
router.get('/critical', LowStockAlertController.getCriticalAlerts);

/**
 * @route GET /api/alerts/category/:categoryId
 * @description Get low stock alerts by category
 * @param {number} categoryId - Category ID
 * @query {number} limit - Results per page (default: 50)
 * @query {number} offset - Pagination offset (default: 0)
 */
router.get('/category/:categoryId', LowStockAlertController.getLowStockByCategory);

/**
 * @route POST /api/alerts/threshold
 * @description Set or update alert threshold for a product
 * @body {number} productId - Product ID (required)
 * @body {number} threshold - New threshold level (required)
 */
router.post('/threshold', 
    requireStaff,
    handleValidationErrors,
    LowStockAlertController.setAlertThreshold
);

/**
 * @route GET /api/alerts/statistics
 * @description Get alert statistics
 */
router.get('/statistics', LowStockAlertController.getAlertStatistics);

/**
 * @route GET /api/alerts/reorder-suggestions
 * @description Get reorder suggestions for low stock items
 */
router.get('/reorder-suggestions', LowStockAlertController.getReorderSuggestions);

module.exports = router;

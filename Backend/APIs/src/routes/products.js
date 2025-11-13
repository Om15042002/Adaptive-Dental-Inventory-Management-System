const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { 
    validateProduct,
    validateIdParam,
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

// All product routes require at least staff authentication
router.use(authenticateToken);
router.use(requireStaff);

// GET /api/products - List all products with filters
router.get('/', 
    validatePagination,
    handleValidationErrors,
    ProductController.getAllProducts
);

// GET /api/products/search - Search products
router.get('/search',
    ProductController.searchProducts
);

// GET /api/products/stats - Get product statistics
router.get('/stats',
    ProductController.getProductStats
);

// GET /api/products/low-stock - Get low stock products
router.get('/low-stock',
    ProductController.getLowStockProducts
);

// GET /api/products/inventory-value - Get total inventory value
router.get('/inventory-value',
    ProductController.getInventoryValue
);

// GET /api/products/frequency/:frequency - Get products by reorder frequency
router.get('/frequency/:frequency',
    ProductController.getProductsByFrequency
);

// GET /api/products/:id - Get specific product details
router.get('/:id',
    validateIdParam,
    handleValidationErrors,
    ProductController.getProductById
);

// POST /api/products - Add new product (admin only)
router.post('/',
    requireAdmin,
    validateProduct,
    handleValidationErrors,
    ProductController.createProduct
);

// POST /api/products/bulk - Bulk create products (admin only)
router.post('/bulk',
    requireAdmin,
    ProductController.bulkCreateProducts
);

// PUT /api/products/:id - Update product (admin only)
router.put('/:id',
    requireAdmin,
    validateIdParam,
    validateProduct,
    handleValidationErrors,
    ProductController.updateProduct
);

// DELETE /api/products/:id - Remove product (admin only)
router.delete('/:id',
    requireAdmin,
    validateIdParam,
    handleValidationErrors,
    ProductController.deleteProduct
);

module.exports = router;
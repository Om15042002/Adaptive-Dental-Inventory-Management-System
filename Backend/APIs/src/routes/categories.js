const express = require('express');
const router = express.Router();
const { CategoryController } = require('../controllers/categorySupplierController');
const { 
    validateCategory,
    validateIdParam,
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

// All category routes require at least staff authentication
router.use(authenticateToken);
router.use(requireStaff);

// GET /api/categories - Get all categories
router.get('/',
    CategoryController.getAllCategories
);

// GET /api/categories/:id/stats - Get category statistics
router.get('/:id/stats',
    validateIdParam,
    handleValidationErrors,
    CategoryController.getCategoryStats
);

// GET /api/categories/:id - Get specific category
router.get('/:id',
    validateIdParam,
    handleValidationErrors,
    CategoryController.getCategoryById
);

// POST /api/categories - Create new category (admin only)
router.post('/',
    requireAdmin,
    validateCategory,
    handleValidationErrors,
    CategoryController.createCategory
);

// PUT /api/categories/:id - Update category (admin only)
router.put('/:id',
    requireAdmin,
    validateIdParam,
    validateCategory,
    handleValidationErrors,
    CategoryController.updateCategory
);

// DELETE /api/categories/:id - Delete category (admin only)
router.delete('/:id',
    requireAdmin,
    validateIdParam,
    handleValidationErrors,
    CategoryController.deleteCategory
);

module.exports = router;
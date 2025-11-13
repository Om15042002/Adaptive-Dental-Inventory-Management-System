const express = require('express');
const router = express.Router();
const { SupplierController } = require('../controllers/categorySupplierController');
const { 
    validateSupplier,
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

// All supplier routes require at least staff authentication
router.use(authenticateToken);
router.use(requireStaff);

// GET /api/suppliers - Get all suppliers
router.get('/',
    SupplierController.getAllSuppliers
);

// GET /api/suppliers/search - Search suppliers
router.get('/search',
    SupplierController.searchSuppliers
);

// GET /api/suppliers/:id/stats - Get supplier statistics
router.get('/:id/stats',
    validateIdParam,
    handleValidationErrors,
    SupplierController.getSupplierStats
);

// GET /api/suppliers/:id - Get specific supplier
router.get('/:id',
    validateIdParam,
    handleValidationErrors,
    SupplierController.getSupplierById
);

// POST /api/suppliers - Add new supplier (admin only)
router.post('/',
    requireAdmin,
    validateSupplier,
    handleValidationErrors,
    SupplierController.createSupplier
);

// PUT /api/suppliers/:id - Update supplier (admin only)
router.put('/:id',
    requireAdmin,
    validateIdParam,
    validateSupplier,
    handleValidationErrors,
    SupplierController.updateSupplier
);

// DELETE /api/suppliers/:id - Delete supplier (admin only)
router.delete('/:id',
    requireAdmin,
    validateIdParam,
    handleValidationErrors,
    SupplierController.deleteSupplier
);

module.exports = router;
const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { 
    validateUserIdParam,
    handleValidationErrors,
    sanitizeBody 
} = require('../middleware/validation');
const { 
    authenticateToken, 
    requireAdmin, 
    canAccessResource 
} = require('../middleware/auth');

// Apply sanitization to all routes
router.use(sanitizeBody);

// All user routes require authentication
router.use(authenticateToken);

// GET /api/users - Get all users (admin only)
router.get('/',
    requireAdmin,
    UserController.getAllUsers
);

// GET /api/users/:id - Get user profile (own profile or admin)
router.get('/:id',
    validateUserIdParam,
    handleValidationErrors,
    canAccessResource,
    UserController.getUserProfile
);

// PUT /api/users/:id - Update user profile (own profile or admin)
router.put('/:id',
    validateUserIdParam,
    handleValidationErrors,
    canAccessResource,
    UserController.updateUserProfile
);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id',
    requireAdmin,
    validateUserIdParam,
    handleValidationErrors,
    UserController.deleteUser
);

module.exports = router;
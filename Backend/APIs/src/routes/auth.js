const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { 
    validateUserLogin, 
    validateUserRegistration, 
    validatePasswordChange,
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

// Public routes
router.post('/login', 
    validateUserLogin, 
    handleValidationErrors, 
    AuthController.login
);

router.post('/register', 
    validateUserRegistration, 
    handleValidationErrors, 
    AuthController.register
);

router.post('/logout', 
    AuthController.logout
);

// Protected routes (require authentication)
router.get('/profile', 
    authenticateToken, 
    AuthController.getProfile
);

router.put('/profile', 
    authenticateToken,
    validateUserRegistration.slice(0, 2), // Only username and email validation
    handleValidationErrors,
    AuthController.updateProfile
);

router.put('/change-password',
    authenticateToken,
    validatePasswordChange,
    handleValidationErrors,
    AuthController.changePassword
);

// Admin only routes
router.get('/users',
    authenticateToken,
    requireAdmin,
    AuthController.getAllUsers
);

router.put('/users/:userId/role',
    authenticateToken,
    requireAdmin,
    validateUserIdParam,
    handleValidationErrors,
    AuthController.updateUserRole
);

module.exports = router;
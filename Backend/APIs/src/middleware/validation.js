const { body, param, query, validationResult } = require('express-validator');
const { formatResponse } = require('../utils/helpers');

// User validation rules
const validateUserRegistration = [
    body('username')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('role')
        .optional()
        .isIn(['admin', 'staff'])
        .withMessage('Role must be either admin or staff')
];

const validateUserLogin = [
    body('email')
        .optional()
        .isEmail()
        .withMessage('Invalid email format'),
    body('username')
        .optional()
        .notEmpty()
        .withMessage('Username is required if email not provided'),
    // Custom validator to ensure at least one is provided
    body().custom((value, { req }) => {
        if (!req.body.email && !req.body.username) {
            throw new Error('Either email or username is required');
        }
        return true;
    }),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Product validation rules
const validateProduct = [
    body('name')
        .isLength({ min: 2, max: 255 })
        .withMessage('Product name must be between 2 and 255 characters')
        .trim(),
    body('category_id')
        .isInt({ gt: 0 })
        .withMessage('Category ID must be a positive integer'),
    body('supplier_id')
        .isInt({ gt: 0 })
        .withMessage('Supplier ID must be a positive integer'),
    body('unit_cost')
        .isFloat({ gt: 0 })
        .withMessage('Unit cost must be a positive number'),
    body('reorder_frequency')
        .isIn(['Weekly', 'Monthly', 'Quarterly', 'One-Time'])
        .withMessage('Reorder frequency must be Weekly, Monthly, Quarterly, or One-Time')
];

// Inventory validation rules
const validateInventory = [
    body('product_id')
        .isInt({ gt: 0 })
        .withMessage('Product ID must be a positive integer'),
    body('current_stock')
        .isInt({ min: 0 })
        .withMessage('Current stock must be a non-negative integer'),
    body('min_stock')
        .isInt({ min: 0 })
        .withMessage('Minimum stock must be a non-negative integer'),
    body('max_stock')
        .isInt({ min: 1 })
        .withMessage('Maximum stock must be a positive integer')
        .custom((value, { req }) => {
            if (value <= req.body.min_stock) {
                throw new Error('Maximum stock must be greater than minimum stock');
            }
            return true;
        })
];

const validateStockUpdate = [
    body('current_stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Current stock must be a non-negative integer'),
    body('min_stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Minimum stock must be a non-negative integer'),
    body('max_stock')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Maximum stock must be a positive integer')
];

const validateStockAdjustment = [
    body('quantity')
        .isInt({ gt: 0 })
        .withMessage('Quantity must be a positive integer'),
    body('type')
        .isIn(['IN', 'OUT'])
        .withMessage('Type must be either IN or OUT'),
    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Notes cannot exceed 500 characters')
        .trim()
];

// Stock movement validation rules
const validateStockMovement = [
    body('product_id')
        .isInt({ gt: 0 })
        .withMessage('Product ID must be a positive integer'),
    body('quantity')
        .isInt({ gt: 0 })
        .withMessage('Quantity must be a positive integer'),
    body('movement_type')
        .isIn(['IN', 'OUT'])
        .withMessage('Movement type must be either IN or OUT'),
    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Notes cannot exceed 500 characters')
        .trim()
];

// Category validation rules
const validateCategory = [
    body('name')
        .isLength({ min: 2, max: 100 })
        .withMessage('Category name must be between 2 and 100 characters')
        .trim(),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters')
        .trim()
];

// Supplier validation rules
const validateSupplier = [
    body('name')
        .isLength({ min: 2, max: 100 })
        .withMessage('Supplier name must be between 2 and 100 characters')
        .trim(),
    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('phone')
        .notEmpty()
        .withMessage('Phone is required')
        .matches(/^[\d\s\-\+\(\)]+$/)
        .withMessage('Please provide a valid phone number')
];

// Parameter validation rules
const validateIdParam = [
    param('id')
        .isInt({ gt: 0 })
        .withMessage('ID must be a positive integer')
];

const validateProductIdParam = [
    param('productId')
        .isInt({ gt: 0 })
        .withMessage('Product ID must be a positive integer')
];

const validateUserIdParam = [
    param('userId')
        .isInt({ gt: 0 })
        .withMessage('User ID must be a positive integer')
];

// Query parameter validation
const validateDateRange = [
    query('date_from')
        .optional()
        .isISO8601()
        .withMessage('date_from must be a valid date (YYYY-MM-DD)'),
    query('date_to')
        .optional()
        .isISO8601()
        .withMessage('date_to must be a valid date (YYYY-MM-DD)')
];

const validatePagination = [
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset must be a non-negative integer')
];

// Validation result handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
    }
    next();
};

// Sanitization middleware
const sanitizeBody = (req, res, next) => {
    if (req.body) {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        }
    }
    next();
};

module.exports = {
    // User validations
    validateUserRegistration,
    validateUserLogin,
    validatePasswordChange,
    
    // Product validations
    validateProduct,
    
    // Inventory validations
    validateInventory,
    validateStockUpdate,
    validateStockAdjustment,
    
    // Stock movement validations
    validateStockMovement,
    
    // Category and supplier validations
    validateCategory,
    validateSupplier,
    
    // Parameter validations
    validateIdParam,
    validateProductIdParam,
    validateUserIdParam,
    
    // Query validations
    validateDateRange,
    validatePagination,
    
    // Middleware
    handleValidationErrors,
    sanitizeBody,
    
    // Legacy support
    validateInventoryItem: validateInventory,
    validateUser: validateUserRegistration,
    validateRequest: handleValidationErrors
};
const jwt = require('jsonwebtoken');
const { formatResponse } = require('../utils/helpers');

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

    if (!token) {
        return res.status(401).json(formatResponse(null, 'Access token is required', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json(formatResponse(null, 'Token has expired', 401));
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json(formatResponse(null, 'Invalid token', 401));
        } else {
            return res.status(401).json(formatResponse(null, 'Token verification failed', 401));
        }
    }
};

// Authorization middleware for admin only
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json(formatResponse(null, 'Authentication required', 401));
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json(formatResponse(null, 'Admin access required', 403));
    }

    next();
};

// Authorization middleware for staff or admin
const requireStaff = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json(formatResponse(null, 'Authentication required', 401));
    }

    if (!['admin', 'staff'].includes(req.user.role)) {
        return res.status(403).json(formatResponse(null, 'Staff or admin access required', 403));
    }

    next();
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (error) {
        req.user = null;
    }

    next();
};

// Middleware to check if user can access resource (own resource or admin)
const canAccessResource = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json(formatResponse(null, 'Authentication required', 401));
    }

    const resourceUserId = req.params.userId || req.body.userId || req.query.userId;
    
    // Admin can access any resource
    if (req.user.role === 'admin') {
        return next();
    }

    // User can only access their own resources
    if (resourceUserId && parseInt(resourceUserId) !== req.user.userId) {
        return res.status(403).json(formatResponse(null, 'Access denied. Can only access own resources', 403));
    }

    next();
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireStaff,
    optionalAuth,
    canAccessResource,
    // Legacy support
    authMiddleware: authenticateToken
};
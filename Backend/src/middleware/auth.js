const jwt = require('jsonwebtoken');
const { formatResponse } = require('../utils/helpers');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json(
            formatResponse(null, 'Access denied. No token provided.', false)
        );
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json(
            formatResponse(null, 'Invalid token.', false)
        );
    }
};

// Middleware to check if user has admin role
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json(
            formatResponse(null, 'Access denied. Admin privileges required.', false)
        );
    }
    next();
};

// Middleware to check if user has admin or staff role
const requireAuth = (req, res, next) => {
    if (!['admin', 'staff'].includes(req.user.role)) {
        return res.status(403).json(
            formatResponse(null, 'Access denied. Insufficient privileges.', false)
        );
    }
    next();
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireAuth
};
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const inventoryRoutes = require('./routes/inventory');
const stockMovementRoutes = require('./routes/stockMovements');
const categoryRoutes = require('./routes/categories');
const supplierRoutes = require('./routes/suppliers');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');

// Import utilities
const { formatResponse } = require('./utils/helpers');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for rate limiting (if behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware
app.use(compression());

// Request logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: formatResponse(null, 'Too many requests from this IP, please try again later.', 429),
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json(formatResponse({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
    }, 'Service is healthy'));
});

// API Documentation endpoint
app.get('/api', (req, res) => {
    res.json(formatResponse({
        name: 'Adaptive Dental Inventory Management API',
        version: '1.0.0',
        description: 'Intelligent inventory management system for dental practices',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            inventory: '/api/inventory',
            stock_movements: '/api/stock-movements',
            categories: '/api/categories',
            suppliers: '/api/suppliers',
            reports: '/api/reports',
            users: '/api/users'
        },
        documentation: 'https://github.com/your-repo/adaptive-dental-inventory-api'
    }, 'API Information'));
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/stock-movements', stockMovementRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json(formatResponse(null, `Route ${req.originalUrl} not found`, 404));
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    
    // Handle specific error types
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json(formatResponse(null, 'Invalid JSON payload', 400));
    }
    
    if (error.type === 'entity.too.large') {
        return res.status(413).json(formatResponse(null, 'Payload too large', 413));
    }

    // Default error response
    const status = error.status || error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    
    res.status(status).json(formatResponse(null, message, status, 
        process.env.NODE_ENV === 'development' ? { stack: error.stack } : null
    ));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Dental Inventory API Server running on port ${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🏥 Ready to manage dental inventory!`);
        
        if (process.env.NODE_ENV === 'development') {
            console.log(`📖 API Documentation: http://localhost:${PORT}/api`);
            console.log(`💚 Health Check: http://localhost:${PORT}/health`);
        }
    });
}

module.exports = app;
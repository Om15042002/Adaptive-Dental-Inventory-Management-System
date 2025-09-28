const { validationResult } = require('express-validator');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const { formatResponse, handleError } = require('../utils/helpers');

class StockMovementController {
    // Create stock movement
    async createStockMovement(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
            }

            const { product_id, quantity, movement_type, notes } = req.body;

            // Validate movement type
            if (!['IN', 'OUT'].includes(movement_type)) {
                return res.status(400).json(formatResponse(null, 'Movement type must be IN or OUT', 400));
            }

            // Check if product exists
            const product = await Product.findById(product_id);
            if (!product) {
                return res.status(404).json(formatResponse(null, 'Product not found', 404));
            }

            // Create stock movement
            const stockMovement = await StockMovement.create({
                product_id,
                quantity,
                movement_type,
                notes
            });

            res.status(201).json(formatResponse(stockMovement, 'Stock movement recorded successfully', 201));

        } catch (error) {
            console.error('Create stock movement error:', error);
            handleError(error, res);
        }
    }

    // Get all stock movements with filtering
    async getAllStockMovements(req, res) {
        try {
            const filters = {
                product_id: req.query.product_id,
                movement_type: req.query.movement_type,
                category_id: req.query.category_id,
                date_from: req.query.date_from,
                date_to: req.query.date_to,
                search: req.query.search,
                sort_by: req.query.sort_by,
                sort_order: req.query.sort_order,
                limit: req.query.limit,
                offset: req.query.offset
            };

            // Remove undefined values
            Object.keys(filters).forEach(key => {
                if (filters[key] === undefined) {
                    delete filters[key];
                }
            });

            const stockMovements = await StockMovement.findAll(filters);
            const totalCount = await StockMovement.getCount(filters);

            res.json(formatResponse({
                stock_movements: stockMovements,
                pagination: {
                    limit: parseInt(filters.limit) || 50,
                    offset: parseInt(filters.offset) || 0,
                    total: totalCount
                }
            }, 'Stock movements retrieved successfully'));

        } catch (error) {
            console.error('Get stock movements error:', error);
            handleError(error, res);
        }
    }

    // Get stock movement by ID
    async getStockMovementById(req, res) {
        try {
            const { id } = req.params;
            const stockMovement = await StockMovement.findById(id);

            if (!stockMovement) {
                return res.status(404).json(formatResponse(null, 'Stock movement not found', 404));
            }

            res.json(formatResponse(stockMovement, 'Stock movement retrieved successfully'));

        } catch (error) {
            console.error('Get stock movement error:', error);
            handleError(error, res);
        }
    }

    // Get stock movements for a specific product
    async getStockMovementsByProduct(req, res) {
        try {
            const { productId } = req.params;
            const limit = parseInt(req.query.limit) || 50;

            // Check if product exists
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json(formatResponse(null, 'Product not found', 404));
            }

            const stockMovements = await StockMovement.findByProduct(productId, limit);

            res.json(formatResponse({
                stock_movements: stockMovements,
                product_id: productId,
                product_name: product.name,
                count: stockMovements.length
            }, 'Product stock movements retrieved successfully'));

        } catch (error) {
            console.error('Get product stock movements error:', error);
            handleError(error, res);
        }
    }

    // Get recent stock movements
    async getRecentMovements(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 20;
            const stockMovements = await StockMovement.getRecent(limit);

            res.json(formatResponse({
                stock_movements: stockMovements,
                count: stockMovements.length
            }, 'Recent stock movements retrieved successfully'));

        } catch (error) {
            console.error('Get recent movements error:', error);
            handleError(error, res);
        }
    }

    // Get movement statistics
    async getMovementStats(req, res) {
        try {
            const { date_from, date_to } = req.query;

            if (!date_from || !date_to) {
                return res.status(400).json(formatResponse(null, 'Date range (date_from and date_to) is required', 400));
            }

            const stats = await StockMovement.getMovementStats(date_from, date_to);

            // Calculate totals
            const totals = stats.reduce((acc, stat) => {
                acc.total_movements += stat.movement_count;
                acc.total_quantity += stat.total_quantity;
                acc.total_value += stat.total_value;
                return acc;
            }, { total_movements: 0, total_quantity: 0, total_value: 0 });

            res.json(formatResponse({
                date_range: { from: date_from, to: date_to },
                statistics: stats,
                totals,
                formatted_total_value: `$${totals.total_value.toFixed(2)}`
            }, 'Movement statistics retrieved successfully'));

        } catch (error) {
            console.error('Get movement stats error:', error);
            handleError(error, res);
        }
    }

    // Get usage analytics
    async getUsageAnalytics(req, res) {
        try {
            const days = parseInt(req.query.days) || 30;
            const analytics = await StockMovement.getUsageAnalytics(days);

            res.json(formatResponse({
                analytics,
                period_days: days,
                total_products_used: analytics.length,
                top_used_products: analytics.slice(0, 10)
            }, 'Usage analytics retrieved successfully'));

        } catch (error) {
            console.error('Get usage analytics error:', error);
            handleError(error, res);
        }
    }

    // Get cost analysis
    async getCostAnalysis(req, res) {
        try {
            const { date_from, date_to } = req.query;

            if (!date_from || !date_to) {
                return res.status(400).json(formatResponse(null, 'Date range (date_from and date_to) is required', 400));
            }

            const analysis = await StockMovement.getCostAnalysis(date_from, date_to);

            // Calculate totals
            const totals = analysis.reduce((acc, item) => {
                acc.total_purchases += parseFloat(item.purchases);
                acc.total_usage_cost += parseFloat(item.usage_cost);
                acc.total_purchase_transactions += item.purchase_transactions;
                acc.total_usage_transactions += item.usage_transactions;
                return acc;
            }, {
                total_purchases: 0,
                total_usage_cost: 0,
                total_purchase_transactions: 0,
                total_usage_transactions: 0
            });

            res.json(formatResponse({
                date_range: { from: date_from, to: date_to },
                analysis,
                totals: {
                    ...totals,
                    formatted_purchases: `$${totals.total_purchases.toFixed(2)}`,
                    formatted_usage_cost: `$${totals.total_usage_cost.toFixed(2)}`
                }
            }, 'Cost analysis retrieved successfully'));

        } catch (error) {
            console.error('Get cost analysis error:', error);
            handleError(error, res);
        }
    }

    // Delete stock movement (admin only)
    async deleteStockMovement(req, res) {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin') {
                return res.status(403).json(formatResponse(null, 'Access denied. Admin role required', 403));
            }

            const { id } = req.params;

            // Check if stock movement exists
            const existingMovement = await StockMovement.findById(id);
            if (!existingMovement) {
                return res.status(404).json(formatResponse(null, 'Stock movement not found', 404));
            }

            // Delete stock movement
            const deleted = await StockMovement.delete(id);

            if (deleted) {
                res.json(formatResponse(null, 'Stock movement deleted successfully'));
            } else {
                res.status(500).json(formatResponse(null, 'Failed to delete stock movement', 500));
            }

        } catch (error) {
            console.error('Delete stock movement error:', error);
            handleError(error, res);
        }
    }

    // Bulk create stock movements (for admin)
    async bulkCreateMovements(req, res) {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin') {
                return res.status(403).json(formatResponse(null, 'Access denied. Admin role required', 403));
            }

            const { movements } = req.body;

            if (!Array.isArray(movements) || movements.length === 0) {
                return res.status(400).json(formatResponse(null, 'Movements array is required', 400));
            }

            const createdMovements = [];
            const errors = [];

            for (let i = 0; i < movements.length; i++) {
                try {
                    const movement = await StockMovement.create({
                        ...movements[i]
                    });
                    createdMovements.push(movement);
                } catch (error) {
                    errors.push({
                        index: i,
                        movement: movements[i],
                        error: error.message
                    });
                }
            }

            res.status(201).json(formatResponse({
                created_movements: createdMovements,
                created_count: createdMovements.length,
                errors,
                error_count: errors.length
            }, 'Bulk movement creation completed', 201));

        } catch (error) {
            console.error('Bulk create movements error:', error);
            handleError(error, res);
        }
    }
}

module.exports = new StockMovementController();
const db = require('../config/database');
const { formatResponse, handleError } = require('../utils/helpers');

class LowStockAlertController {
    // Get all low stock items
    async getLowStockAlerts(req, res) {
        try {
            const { limit = 100, offset = 0 } = req.query;

            const sqlQuery = `
                SELECT 
                    p.id,
                    p.name,
                    p.sku,
                    p.reorder_level,
                    c.name as category_name,
                    s.name as supplier_name,
                    i.quantity as current_stock,
                    (p.reorder_level - i.quantity) as quantity_needed,
                    CASE 
                        WHEN i.quantity = 0 THEN 'critical'
                        WHEN i.quantity <= (p.reorder_level * 0.25) THEN 'critical'
                        WHEN i.quantity <= (p.reorder_level * 0.5) THEN 'warning'
                        WHEN i.quantity <= p.reorder_level THEN 'low'
                    END as alert_level,
                    ROUND((i.quantity / p.reorder_level) * 100, 2) as stock_percentage
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                LEFT JOIN inventory i ON p.id = i.product_id
                WHERE i.quantity <= p.reorder_level
                ORDER BY i.quantity ASC
                LIMIT ? OFFSET ?
            `;

            const [alerts] = await db.execute(sqlQuery, [parseInt(limit), parseInt(offset)]);

            // Group by alert level
            const groupedAlerts = {
                critical: alerts.filter(a => a.alert_level === 'critical'),
                warning: alerts.filter(a => a.alert_level === 'warning'),
                low: alerts.filter(a => a.alert_level === 'low')
            };

            res.json(formatResponse({
                alerts,
                summary: {
                    total_low_stock: alerts.length,
                    critical_count: groupedAlerts.critical.length,
                    warning_count: groupedAlerts.warning.length,
                    low_count: groupedAlerts.low.length
                },
                grouped: groupedAlerts,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total: alerts.length
                }
            }, 'Low stock alerts retrieved successfully'));

        } catch (error) {
            console.error('Get low stock alerts error:', error);
            handleError(error, res);
        }
    }

    // Get critical low stock items only
    async getCriticalAlerts(req, res) {
        try {
            const sqlQuery = `
                SELECT 
                    p.id,
                    p.name,
                    p.sku,
                    p.reorder_level,
                    c.name as category_name,
                    s.name as supplier_name,
                    s.email as supplier_email,
                    s.phone as supplier_phone,
                    i.quantity as current_stock,
                    (p.reorder_level - i.quantity) as quantity_needed,
                    p.unit_cost,
                    ((p.reorder_level - i.quantity) * p.unit_cost) as estimated_cost
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                LEFT JOIN inventory i ON p.id = i.product_id
                WHERE i.quantity <= (p.reorder_level * 0.25)
                ORDER BY i.quantity ASC
            `;

            const [criticalAlerts] = await db.execute(sqlQuery);

            res.json(formatResponse({
                alerts: criticalAlerts,
                count: criticalAlerts.length,
                total_estimated_cost: criticalAlerts.reduce((sum, alert) => sum + (alert.estimated_cost || 0), 0)
            }, 'Critical low stock alerts retrieved successfully'));

        } catch (error) {
            console.error('Get critical alerts error:', error);
            handleError(error, res);
        }
    }

    // Get low stock alerts by category
    async getLowStockByCategory(req, res) {
        try {
            const { categoryId, limit = 50, offset = 0 } = req.query;

            if (!categoryId) {
                return res.status(400).json(formatResponse(null, 'Category ID is required', 400));
            }

            const sqlQuery = `
                SELECT 
                    p.id,
                    p.name,
                    p.sku,
                    p.reorder_level,
                    c.name as category_name,
                    i.quantity as current_stock,
                    (p.reorder_level - i.quantity) as quantity_needed,
                    CASE 
                        WHEN i.quantity <= (p.reorder_level * 0.25) THEN 'critical'
                        WHEN i.quantity <= (p.reorder_level * 0.5) THEN 'warning'
                        ELSE 'low'
                    END as alert_level
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN inventory i ON p.id = i.product_id
                WHERE p.category_id = ? AND i.quantity <= p.reorder_level
                ORDER BY i.quantity ASC
                LIMIT ? OFFSET ?
            `;

            const [alerts] = await db.execute(sqlQuery, [categoryId, parseInt(limit), parseInt(offset)]);

            res.json(formatResponse({
                alerts,
                category_id: categoryId,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total: alerts.length
                }
            }, 'Low stock alerts for category retrieved successfully'));

        } catch (error) {
            console.error('Get low stock by category error:', error);
            handleError(error, res);
        }
    }

    // Create or update alert threshold
    async setAlertThreshold(req, res) {
        try {
            const { productId, threshold } = req.body;

            if (!productId || threshold === undefined) {
                return res.status(400).json(formatResponse(null, 'Product ID and threshold are required', 400));
            }

            if (threshold < 0) {
                return res.status(400).json(formatResponse(null, 'Threshold must be a positive number', 400));
            }

            // Update product reorder level
            const updateQuery = `UPDATE products SET reorder_level = ? WHERE id = ?`;
            await db.execute(updateQuery, [threshold, productId]);

            // Get updated product
            const selectQuery = `
                SELECT 
                    p.id,
                    p.name,
                    p.reorder_level,
                    i.quantity as current_stock
                FROM products p
                LEFT JOIN inventory i ON p.id = i.product_id
                WHERE p.id = ?
            `;

            const [product] = await db.execute(selectQuery, [productId]);

            res.json(formatResponse({
                product: product[0],
                message: 'Alert threshold updated successfully'
            }, 'Alert threshold set successfully'));

        } catch (error) {
            console.error('Set alert threshold error:', error);
            handleError(error, res);
        }
    }

    // Get alert statistics
    async getAlertStatistics(req, res) {
        try {
            const sqlQuery = `
                SELECT 
                    COUNT(*) as total_products,
                    SUM(CASE WHEN i.quantity = 0 THEN 1 ELSE 0 END) as out_of_stock,
                    SUM(CASE WHEN i.quantity > 0 AND i.quantity <= (p.reorder_level * 0.25) THEN 1 ELSE 0 END) as critical,
                    SUM(CASE WHEN i.quantity > (p.reorder_level * 0.25) AND i.quantity <= (p.reorder_level * 0.5) THEN 1 ELSE 0 END) as warning,
                    SUM(CASE WHEN i.quantity > (p.reorder_level * 0.5) AND i.quantity <= p.reorder_level THEN 1 ELSE 0 END) as low,
                    SUM(CASE WHEN i.quantity > p.reorder_level THEN 1 ELSE 0 END) as in_stock
                FROM products p
                LEFT JOIN inventory i ON p.id = i.product_id
            `;

            const [stats] = await db.execute(sqlQuery);

            res.json(formatResponse({
                statistics: stats[0]
            }, 'Alert statistics retrieved successfully'));

        } catch (error) {
            console.error('Get alert statistics error:', error);
            handleError(error, res);
        }
    }

    // Get reorder suggestions
    async getReorderSuggestions(req, res) {
        try {
            const sqlQuery = `
                SELECT 
                    p.id,
                    p.name,
                    p.sku,
                    p.reorder_level,
                    s.name as supplier_name,
                    s.email as supplier_email,
                    s.phone as supplier_phone,
                    i.quantity as current_stock,
                    CEIL((p.reorder_level * 1.5) - i.quantity) as suggested_quantity,
                    p.unit_cost,
                    CEIL((p.reorder_level * 1.5) - i.quantity) * p.unit_cost as estimated_cost
                FROM products p
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                LEFT JOIN inventory i ON p.id = i.product_id
                WHERE i.quantity <= p.reorder_level
                ORDER BY estimated_cost DESC
            `;

            const [suggestions] = await db.execute(sqlQuery);

            const totalCost = suggestions.reduce((sum, s) => sum + (s.estimated_cost || 0), 0);

            res.json(formatResponse({
                suggestions,
                total_suggested_cost: totalCost,
                count: suggestions.length
            }, 'Reorder suggestions retrieved successfully'));

        } catch (error) {
            console.error('Get reorder suggestions error:', error);
            handleError(error, res);
        }
    }
}

module.exports = new LowStockAlertController();

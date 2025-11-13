const { validationResult } = require('express-validator');
const db = require('../config/database');
const { formatResponse, handleError } = require('../utils/helpers');

class SearchFilterController {
    // Search products by name, SKU, or description
    async searchProducts(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
            }

            const { query, limit = 50, offset = 0 } = req.query;

            if (!query || query.trim().length === 0) {
                return res.status(400).json(formatResponse(null, 'Search query is required', 400));
            }

            const searchTerm = `%${query}%`;
            const sqlQuery = `
                SELECT 
                    p.id,
                    p.name,
                    p.description,
                    p.sku,
                    p.category_id,
                    p.supplier_id,
                    p.unit_cost,
                    p.selling_price,
                    p.reorder_level,
                    c.name as category_name,
                    s.name as supplier_name,
                    i.quantity as current_stock
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                LEFT JOIN inventory i ON p.id = i.product_id
                WHERE 
                    p.name LIKE ? 
                    OR p.sku LIKE ? 
                    OR p.description LIKE ?
                LIMIT ? OFFSET ?
            `;

            const [products] = await db.execute(sqlQuery, [searchTerm, searchTerm, searchTerm, parseInt(limit), parseInt(offset)]);

            res.json(formatResponse({
                products,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total: products.length
                }
            }, 'Products found successfully'));

        } catch (error) {
            console.error('Search products error:', error);
            handleError(error, res);
        }
    }

    // Filter products by category
    async filterByCategory(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
            }

            const { categoryId, limit = 50, offset = 0 } = req.query;

            if (!categoryId) {
                return res.status(400).json(formatResponse(null, 'Category ID is required', 400));
            }

            const sqlQuery = `
                SELECT 
                    p.id,
                    p.name,
                    p.description,
                    p.sku,
                    p.category_id,
                    p.supplier_id,
                    p.unit_cost,
                    p.selling_price,
                    p.reorder_level,
                    c.name as category_name,
                    s.name as supplier_name,
                    i.quantity as current_stock
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                LEFT JOIN inventory i ON p.id = i.product_id
                WHERE p.category_id = ?
                LIMIT ? OFFSET ?
            `;

            const [products] = await db.execute(sqlQuery, [categoryId, parseInt(limit), parseInt(offset)]);

            res.json(formatResponse({
                products,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total: products.length
                }
            }, 'Products filtered by category successfully'));

        } catch (error) {
            console.error('Filter by category error:', error);
            handleError(error, res);
        }
    }

    // Filter products by supplier
    async filterBySupplier(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
            }

            const { supplierId, limit = 50, offset = 0 } = req.query;

            if (!supplierId) {
                return res.status(400).json(formatResponse(null, 'Supplier ID is required', 400));
            }

            const sqlQuery = `
                SELECT 
                    p.id,
                    p.name,
                    p.description,
                    p.sku,
                    p.category_id,
                    p.supplier_id,
                    p.unit_cost,
                    p.selling_price,
                    p.reorder_level,
                    c.name as category_name,
                    s.name as supplier_name,
                    i.quantity as current_stock
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                LEFT JOIN inventory i ON p.id = i.product_id
                WHERE p.supplier_id = ?
                LIMIT ? OFFSET ?
            `;

            const [products] = await db.execute(sqlQuery, [supplierId, parseInt(limit), parseInt(offset)]);

            res.json(formatResponse({
                products,
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total: products.length
                }
            }, 'Products filtered by supplier successfully'));

        } catch (error) {
            console.error('Filter by supplier error:', error);
            handleError(error, res);
        }
    }

    // Advanced filter with multiple criteria
    async advancedFilter(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
            }

            const { 
                categoryId, 
                supplierId, 
                minPrice, 
                maxPrice, 
                inStock = true,
                limit = 50, 
                offset = 0 
            } = req.query;

            let sqlQuery = `
                SELECT 
                    p.id,
                    p.name,
                    p.description,
                    p.sku,
                    p.category_id,
                    p.supplier_id,
                    p.unit_cost,
                    p.selling_price,
                    p.reorder_level,
                    c.name as category_name,
                    s.name as supplier_name,
                    i.quantity as current_stock
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN suppliers s ON p.supplier_id = s.id
                LEFT JOIN inventory i ON p.id = i.product_id
                WHERE 1=1
            `;

            const params = [];

            if (categoryId) {
                sqlQuery += ` AND p.category_id = ?`;
                params.push(categoryId);
            }

            if (supplierId) {
                sqlQuery += ` AND p.supplier_id = ?`;
                params.push(supplierId);
            }

            if (minPrice) {
                sqlQuery += ` AND p.selling_price >= ?`;
                params.push(minPrice);
            }

            if (maxPrice) {
                sqlQuery += ` AND p.selling_price <= ?`;
                params.push(maxPrice);
            }

            if (inStock === 'true') {
                sqlQuery += ` AND i.quantity > 0`;
            }

            sqlQuery += ` LIMIT ? OFFSET ?`;
            params.push(parseInt(limit), parseInt(offset));

            const [products] = await db.execute(sqlQuery, params);

            res.json(formatResponse({
                products,
                filters: {
                    categoryId,
                    supplierId,
                    minPrice,
                    maxPrice,
                    inStock
                },
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total: products.length
                }
            }, 'Advanced filter applied successfully'));

        } catch (error) {
            console.error('Advanced filter error:', error);
            handleError(error, res);
        }
    }

    // Filter by stock status
    async filterByStockStatus(req, res) {
        try {
            const { status, limit = 50, offset = 0 } = req.query;

            let sqlQuery = `
                SELECT 
                    p.id,
                    p.name,
                    p.sku,
                    p.category_id,
                    p.supplier_id,
                    p.reorder_level,
                    c.name as category_name,
                    i.quantity as current_stock,
                    CASE 
                        WHEN i.quantity = 0 THEN 'out_of_stock'
                        WHEN i.quantity <= p.reorder_level THEN 'low_stock'
                        ELSE 'in_stock'
                    END as stock_status
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN inventory i ON p.id = i.product_id
                WHERE 1=1
            `;

            const params = [];

            if (status) {
                if (status === 'out_of_stock') {
                    sqlQuery += ` AND i.quantity = 0`;
                } else if (status === 'low_stock') {
                    sqlQuery += ` AND i.quantity > 0 AND i.quantity <= p.reorder_level`;
                } else if (status === 'in_stock') {
                    sqlQuery += ` AND i.quantity > p.reorder_level`;
                }
            }

            sqlQuery += ` LIMIT ? OFFSET ?`;
            params.push(parseInt(limit), parseInt(offset));

            const [products] = await db.execute(sqlQuery, params);

            res.json(formatResponse({
                products,
                filter: { status },
                pagination: {
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    total: products.length
                }
            }, 'Products filtered by stock status successfully'));

        } catch (error) {
            console.error('Filter by stock status error:', error);
            handleError(error, res);
        }
    }
}

module.exports = new SearchFilterController();

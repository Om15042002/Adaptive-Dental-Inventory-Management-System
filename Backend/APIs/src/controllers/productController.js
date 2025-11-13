const { validationResult } = require('express-validator');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const { formatResponse, handleError } = require('../utils/helpers');

class ProductController {
    // Get all products with filtering and pagination
    async getAllProducts(req, res) {
        try {
            const filters = {
                category_id: req.query.category_id,
                supplier_id: req.query.supplier_id,
                reorder_frequency: req.query.reorder_frequency,
                search: req.query.search,
                low_stock: req.query.low_stock,
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

            const products = await Product.findAll(filters);
            const totalCount = await Product.getCount(filters);

            res.json(formatResponse({
                products,
                pagination: {
                    limit: parseInt(filters.limit) || 50,
                    offset: parseInt(filters.offset) || 0,
                    total: totalCount
                }
            }, 'Products retrieved successfully'));

        } catch (error) {
            console.error('Get products error:', error);
            handleError(error, res);
        }
    }

    // Get product by ID
    async getProductById(req, res) {
        try {
            const { id } = req.params;
            const product = await Product.findById(id);

            if (!product) {
                return res.status(404).json(formatResponse(null, 'Product not found', 404));
            }

            res.json(formatResponse(product, 'Product retrieved successfully'));

        } catch (error) {
            console.error('Get product error:', error);
            handleError(error, res);
        }
    }

    // Create new product
    async createProduct(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
            }

            const { name, category_id, supplier_id, unit_cost, reorder_frequency } = req.body;

            // Create product
            const product = await Product.create({
                name,
                category_id,
                supplier_id,
                unit_cost,
                reorder_frequency
            });

            res.status(201).json(formatResponse(product, 'Product created successfully', 201));

        } catch (error) {
            console.error('Create product error:', error);
            handleError(error, res);
        }
    }

    // Update product
    async updateProduct(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
            }

            const { id } = req.params;
            const updateData = req.body;

            // Check if product exists
            const existingProduct = await Product.findById(id);
            if (!existingProduct) {
                return res.status(404).json(formatResponse(null, 'Product not found', 404));
            }

            // Update product
            const updatedProduct = await Product.update(id, updateData);

            res.json(formatResponse(updatedProduct, 'Product updated successfully'));

        } catch (error) {
            console.error('Update product error:', error);
            handleError(error, res);
        }
    }

    // Delete product
    async deleteProduct(req, res) {
        try {
            const { id } = req.params;

            // Check if product exists
            const existingProduct = await Product.findById(id);
            if (!existingProduct) {
                return res.status(404).json(formatResponse(null, 'Product not found', 404));
            }

            // Check if product has inventory records
            const inventory = await Inventory.findByProductId(id);
            if (inventory && inventory.current_stock > 0) {
                return res.status(400).json(formatResponse(null, 'Cannot delete product with existing inventory', 400));
            }

            // Delete product
            const deleted = await Product.delete(id);

            if (deleted) {
                res.json(formatResponse(null, 'Product deleted successfully'));
            } else {
                res.status(500).json(formatResponse(null, 'Failed to delete product', 500));
            }

        } catch (error) {
            console.error('Delete product error:', error);
            handleError(error, res);
        }
    }

    // Get products by reorder frequency
    async getProductsByFrequency(req, res) {
        try {
            const { frequency } = req.params;
            
            // Validate frequency
            const validFrequencies = ['Weekly', 'Monthly', 'Quarterly', 'One-Time'];
            if (!validFrequencies.includes(frequency)) {
                return res.status(400).json(formatResponse(null, 'Invalid reorder frequency', 400));
            }

            const products = await Product.findByFrequency(frequency);

            res.json(formatResponse({
                products,
                frequency,
                count: products.length
            }, `Products with ${frequency} reorder frequency retrieved successfully`));

        } catch (error) {
            console.error('Get products by frequency error:', error);
            handleError(error, res);
        }
    }

    // Get low stock products
    async getLowStockProducts(req, res) {
        try {
            const products = await Product.findLowStock();

            res.json(formatResponse({
                products,
                count: products.length,
                urgent_count: products.filter(p => p.current_stock === 0).length
            }, 'Low stock products retrieved successfully'));

        } catch (error) {
            console.error('Get low stock products error:', error);
            handleError(error, res);
        }
    }

    // Get product inventory value
    async getInventoryValue(req, res) {
        try {
            const totalValue = await Product.getTotalInventoryValue();

            res.json(formatResponse({
                total_inventory_value: totalValue,
                formatted_value: `$${totalValue.toFixed(2)}`
            }, 'Inventory value calculated successfully'));

        } catch (error) {
            console.error('Get inventory value error:', error);
            handleError(error, res);
        }
    }

    // Search products
    async searchProducts(req, res) {
        try {
            const { q: searchTerm } = req.query;
            
            if (!searchTerm || searchTerm.trim().length < 2) {
                return res.status(400).json(formatResponse(null, 'Search term must be at least 2 characters', 400));
            }

            const filters = {
                search: searchTerm.trim(),
                limit: req.query.limit || 20
            };

            const products = await Product.findAll(filters);

            res.json(formatResponse({
                products,
                search_term: searchTerm,
                count: products.length
            }, 'Search completed successfully'));

        } catch (error) {
            console.error('Search products error:', error);
            handleError(error, res);
        }
    }

    // Get product statistics
    async getProductStats(req, res) {
        try {
            const stats = {
                total_products: await Product.getCount(),
                low_stock_count: (await Product.findLowStock()).length,
                total_inventory_value: await Product.getTotalInventoryValue(),
                by_frequency: {
                    weekly: await Product.getCount({ reorder_frequency: 'Weekly' }),
                    monthly: await Product.getCount({ reorder_frequency: 'Monthly' }),
                    quarterly: await Product.getCount({ reorder_frequency: 'Quarterly' }),
                    one_time: await Product.getCount({ reorder_frequency: 'One-Time' })
                }
            };

            res.json(formatResponse(stats, 'Product statistics retrieved successfully'));

        } catch (error) {
            console.error('Get product stats error:', error);
            handleError(error, res);
        }
    }

    // Bulk create products (for admin)
    async bulkCreateProducts(req, res) {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin') {
                return res.status(403).json(formatResponse(null, 'Access denied. Admin role required', 403));
            }

            const { products } = req.body;

            if (!Array.isArray(products) || products.length === 0) {
                return res.status(400).json(formatResponse(null, 'Products array is required', 400));
            }

            const createdProducts = [];
            const errors = [];

            for (let i = 0; i < products.length; i++) {
                try {
                    const product = await Product.create(products[i]);
                    createdProducts.push(product);
                } catch (error) {
                    errors.push({
                        index: i,
                        product: products[i],
                        error: error.message
                    });
                }
            }

            res.status(201).json(formatResponse({
                created_products: createdProducts,
                created_count: createdProducts.length,
                errors,
                error_count: errors.length
            }, 'Bulk product creation completed', 201));

        } catch (error) {
            console.error('Bulk create products error:', error);
            handleError(error, res);
        }
    }
}

module.exports = new ProductController();
const { validationResult } = require('express-validator');
const Inventory = require('../models/Inventory');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const { formatResponse, handleError } = require('../utils/helpers');

class InventoryController {
    // Get all inventory items with filtering
    async getAllInventory(req, res) {
        try {
            const filters = {
                category_id: req.query.category_id,
                supplier_id: req.query.supplier_id,
                low_stock: req.query.low_stock,
                out_of_stock: req.query.out_of_stock,
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

            const inventory = await Inventory.findAll(filters);

            res.json(formatResponse({
                inventory,
                pagination: {
                    limit: parseInt(filters.limit) || 50,
                    offset: parseInt(filters.offset) || 0,
                    total: inventory.length
                }
            }, 'Inventory retrieved successfully'));

        } catch (error) {
            console.error('Get inventory error:', error);
            handleError(error, res);
        }
    }

    // Get specific inventory item by ID
    async getInventoryById(req, res) {
        try {
            const { id } = req.params;
            const inventory = await Inventory.findById(id);

            if (!inventory) {
                return res.status(404).json(formatResponse(null, 'Inventory item not found', 404));
            }

            res.json(formatResponse(inventory, 'Inventory item retrieved successfully'));

        } catch (error) {
            console.error('Get inventory item error:', error);
            handleError(error, res);
        }
    }

    // Get inventory by product ID
    async getInventoryByProduct(req, res) {
        try {
            const { productId } = req.params;
            const inventory = await Inventory.findByProductId(productId);

            if (!inventory) {
                return res.status(404).json(formatResponse(null, 'Inventory item not found for this product', 404));
            }

            res.json(formatResponse(inventory, 'Inventory item retrieved successfully'));

        } catch (error) {
            console.error('Get inventory by product error:', error);
            handleError(error, res);
        }
    }

    // Update stock levels
    async updateStock(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
            }

            const { id } = req.params;
            const stockData = req.body;

            // Check if inventory exists
            const existingInventory = await Inventory.findById(id);
            if (!existingInventory) {
                return res.status(404).json(formatResponse(null, 'Inventory item not found', 404));
            }

            // Update stock levels
            const updatedInventory = await Inventory.updateStock(id, stockData);

            // Create stock movement record if current_stock was updated
            if (stockData.current_stock !== undefined) {
                const quantityDifference = stockData.current_stock - existingInventory.current_stock;
                
                if (quantityDifference !== 0) {
                    await StockMovement.create({
                        product_id: existingInventory.product_id,
                        quantity: Math.abs(quantityDifference),
                        movement_type: quantityDifference > 0 ? 'IN' : 'OUT',
                        notes: `Stock level updated via API`,
                        created_by: req.user.userId
                    });
                }
            }

            res.json(formatResponse(updatedInventory, 'Stock levels updated successfully'));

        } catch (error) {
            console.error('Update stock error:', error);
            handleError(error, res);
        }
    }

    // Adjust stock (add or subtract)
    async adjustStock(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
            }

            const { productId } = req.params;
            const { quantity, type, notes } = req.body;

            // Validate type
            if (!['IN', 'OUT'].includes(type)) {
                return res.status(400).json(formatResponse(null, 'Type must be IN or OUT', 400));
            }

            // Adjust stock
            const updatedInventory = await Inventory.adjustStock(productId, quantity, type);

            // Create stock movement record
            await StockMovement.create({
                product_id: productId,
                quantity,
                movement_type: type,
                notes: notes || `Stock ${type === 'IN' ? 'added' : 'removed'} via API`,
                created_by: req.user.userId
            });

            res.json(formatResponse(updatedInventory, `Stock ${type === 'IN' ? 'added' : 'removed'} successfully`));

        } catch (error) {
            console.error('Adjust stock error:', error);
            handleError(error, res);
        }
    }

    // Get low stock items
    async getLowStockItems(req, res) {
        try {
            const lowStockItems = await Inventory.findLowStock();

            res.json(formatResponse({
                inventory: lowStockItems,
                count: lowStockItems.length,
                critical_count: lowStockItems.filter(item => item.current_stock === 0).length
            }, 'Low stock items retrieved successfully'));

        } catch (error) {
            console.error('Get low stock items error:', error);
            handleError(error, res);
        }
    }

    // Get inventory by reorder frequency
    async getInventoryByFrequency(req, res) {
        try {
            const { frequency } = req.params;
            
            // Validate frequency
            const validFrequencies = ['Weekly', 'Monthly', 'Quarterly', 'One-Time'];
            if (!validFrequencies.includes(frequency)) {
                return res.status(400).json(formatResponse(null, 'Invalid reorder frequency', 400));
            }

            const inventory = await Inventory.findByFrequency(frequency);

            res.json(formatResponse({
                inventory,
                frequency,
                count: inventory.length
            }, `Inventory items with ${frequency} reorder frequency retrieved successfully`));

        } catch (error) {
            console.error('Get inventory by frequency error:', error);
            handleError(error, res);
        }
    }

    // Get low stock summary by category
    async getLowStockSummary(req, res) {
        try {
            const summary = await Inventory.getLowStockSummary();

            res.json(formatResponse({
                summary,
                total_categories_affected: summary.length,
                total_low_stock_items: summary.reduce((sum, cat) => sum + cat.low_stock_count, 0)
            }, 'Low stock summary retrieved successfully'));

        } catch (error) {
            console.error('Get low stock summary error:', error);
            handleError(error, res);
        }
    }

    // Get total inventory value
    async getInventoryValue(req, res) {
        try {
            const totalValue = await Inventory.getTotalStockValue();

            res.json(formatResponse({
                total_inventory_value: totalValue,
                formatted_value: `$${totalValue.toFixed(2)}`
            }, 'Total inventory value calculated successfully'));

        } catch (error) {
            console.error('Get inventory value error:', error);
            handleError(error, res);
        }
    }

    // Create inventory record for a product
    async createInventory(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
            }

            const { product_id, current_stock, min_stock, max_stock } = req.body;

            // Check if product exists
            const product = await Product.findById(product_id);
            if (!product) {
                return res.status(404).json(formatResponse(null, 'Product not found', 404));
            }

            // Check if inventory already exists for this product
            const existingInventory = await Inventory.findByProductId(product_id);
            if (existingInventory) {
                return res.status(409).json(formatResponse(null, 'Inventory already exists for this product', 409));
            }

            // Create inventory
            const inventory = await Inventory.create({
                product_id,
                current_stock,
                min_stock,
                max_stock
            });

            // Create initial stock movement if current_stock > 0
            if (current_stock > 0) {
                await StockMovement.create({
                    product_id,
                    quantity: current_stock,
                    movement_type: 'IN',
                    notes: 'Initial inventory setup',
                    created_by: req.user.userId
                });
            }

            res.status(201).json(formatResponse(inventory, 'Inventory created successfully', 201));

        } catch (error) {
            console.error('Create inventory error:', error);
            handleError(error, res);
        }
    }

    // Delete inventory record
    async deleteInventory(req, res) {
        try {
            const { id } = req.params;

            // Check if inventory exists
            const existingInventory = await Inventory.findById(id);
            if (!existingInventory) {
                return res.status(404).json(formatResponse(null, 'Inventory item not found', 404));
            }

            // Check if there's current stock
            if (existingInventory.current_stock > 0) {
                return res.status(400).json(formatResponse(null, 'Cannot delete inventory with current stock. Set stock to 0 first.', 400));
            }

            // Delete inventory
            const deleted = await Inventory.delete(id);

            if (deleted) {
                res.json(formatResponse(null, 'Inventory deleted successfully'));
            } else {
                res.status(500).json(formatResponse(null, 'Failed to delete inventory', 500));
            }

        } catch (error) {
            console.error('Delete inventory error:', error);
            handleError(error, res);
        }
    }

    // Get inventory dashboard stats
    async getDashboardStats(req, res) {
        try {
            const [
                totalValue,
                lowStockItems,
                lowStockSummary
            ] = await Promise.all([
                Inventory.getTotalStockValue(),
                Inventory.findLowStock(),
                Inventory.getLowStockSummary()
            ]);

            const stats = {
                total_inventory_value: totalValue,
                formatted_total_value: `$${totalValue.toFixed(2)}`,
                low_stock_count: lowStockItems.length,
                out_of_stock_count: lowStockItems.filter(item => item.current_stock === 0).length,
                categories_with_low_stock: lowStockSummary.length,
                recent_activity: await StockMovement.getRecent(10)
            };

            res.json(formatResponse(stats, 'Dashboard stats retrieved successfully'));

        } catch (error) {
            console.error('Get dashboard stats error:', error);
            handleError(error, res);
        }
    }
}

module.exports = new InventoryController();
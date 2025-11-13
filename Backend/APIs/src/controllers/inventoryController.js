const Inventory = require('../models/Inventory');
const { validationResult } = require('express-validator');

class InventoryController {
    // Get all inventory items
    static async getAllInventory(req, res) {
        try {
            const {
                search,
                category,
                supplier,
                storage_area,
                frequency_of_use,
                status,
                sort_by = 'product_name',
                sort_order = 'ASC',
                page = 1,
                limit = 50
            } = req.query;

            const filters = {};
            if (search) filters.search = search;
            if (category) filters.category = category;
            if (supplier) filters.supplier = supplier;
            if (storage_area) filters.storage_area = storage_area;
            if (frequency_of_use) filters.frequency_of_use = frequency_of_use;
            if (status) filters.status = status;

            const inventory = await Inventory.findAll({
                ...filters,
                sort_by,
                sort_order,
                page: parseInt(page),
                limit: parseInt(limit)
            });

            res.status(200).json({
                success: true,
                data: inventory,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Error fetching inventory:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch inventory',
                error: error.message
            });
        }
    }

    // Get dashboard statistics
    static async getDashboardStats(req, res) {
        try {
            const stats = await Inventory.getDashboardStats();
            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch dashboard statistics',
                error: error.message
            });
        }
    }

    // Get low stock items
    static async getLowStockItems(req, res) {
        try {
            const lowStockItems = await Inventory.getLowStockItems();
            res.status(200).json({
                success: true,
                data: lowStockItems
            });
        } catch (error) {
            console.error('Error fetching low stock items:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch low stock items',
                error: error.message
            });
        }
    }

    // Get low stock summary
    static async getLowStockSummary(req, res) {
        try {
            const summary = await Inventory.getLowStockSummary();
            res.status(200).json({
                success: true,
                data: summary
            });
        } catch (error) {
            console.error('Error fetching low stock summary:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch low stock summary',
                error: error.message
            });
        }
    }

    // Get inventory value
    static async getInventoryValue(req, res) {
        try {
            const value = await Inventory.getInventoryValue();
            res.status(200).json({
                success: true,
                data: value
            });
        } catch (error) {
            console.error('Error calculating inventory value:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to calculate inventory value',
                error: error.message
            });
        }
    }

    // Get inventory by frequency
    static async getInventoryByFrequency(req, res) {
        try {
            const { frequency } = req.params;
            const inventory = await Inventory.findByFrequency(frequency);
            res.status(200).json({
                success: true,
                data: inventory
            });
        } catch (error) {
            console.error('Error fetching inventory by frequency:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch inventory by frequency',
                error: error.message
            });
        }
    }

    // Get inventory by product
    static async getInventoryByProduct(req, res) {
        try {
            const { productId } = req.params;
            const inventory = await Inventory.findByProductId(productId);
            
            if (!inventory) {
                return res.status(404).json({
                    success: false,
                    message: 'Inventory not found for this product'
                });
            }

            res.status(200).json({
                success: true,
                data: inventory
            });
        } catch (error) {
            console.error('Error fetching inventory by product:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch inventory by product',
                error: error.message
            });
        }
    }

    // Get inventory by ID
    static async getInventoryById(req, res) {
        try {
            const { id } = req.params;
            const inventory = await Inventory.findById(id);
            
            if (!inventory) {
                return res.status(404).json({
                    success: false,
                    message: 'Inventory item not found'
                });
            }

            res.status(200).json({
                success: true,
                data: inventory
            });
        } catch (error) {
            console.error('Error fetching inventory item:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch inventory item',
                error: error.message
            });
        }
    }

    // Create new inventory
    static async createInventory(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const inventoryData = req.body;
            const newInventory = await Inventory.create(inventoryData);

            res.status(201).json({
                success: true,
                message: 'Inventory created successfully',
                data: newInventory
            });
        } catch (error) {
            console.error('Error creating inventory:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create inventory',
                error: error.message
            });
        }
    }

    // Update stock level
    static async updateStock(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const { quantity } = req.body;

            const updated = await Inventory.updateStock(id, quantity);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Inventory item not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Stock updated successfully',
                data: updated
            });
        } catch (error) {
            console.error('Error updating stock:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update stock',
                error: error.message
            });
        }
    }

    // Adjust stock (manual adjustment)
    static async adjustStock(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { id } = req.params;
            const { adjustment, reason } = req.body;

            const updated = await Inventory.adjustStock(id, adjustment, reason);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Inventory item not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Stock adjusted successfully',
                data: updated
            });
        } catch (error) {
            console.error('Error adjusting stock:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to adjust stock',
                error: error.message
            });
        }
    }

    // Delete inventory
    static async deleteInventory(req, res) {
        try {
            const { id } = req.params;
            const deleted = await Inventory.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Inventory item not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Inventory deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting inventory:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete inventory',
                error: error.message
            });
        }
    }
}

module.exports = InventoryController;

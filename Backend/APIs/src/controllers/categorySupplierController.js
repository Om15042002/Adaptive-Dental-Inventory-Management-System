const { validationResult } = require('express-validator');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const { formatResponse, handleError } = require('../utils/helpers');

class CategoryController {
    // Get all categories
    async getAllCategories(req, res) {
        try {
            const includeStats = req.query.include_stats === 'true';
            const categories = await Category.findAll(includeStats);

            res.json(formatResponse({
                categories,
                count: categories.length
            }, 'Categories retrieved successfully'));

        } catch (error) {
            console.error('Get categories error:', error);
            handleError(error, res);
        }
    }

    // Get category by ID
    async getCategoryById(req, res) {
        try {
            const { id } = req.params;
            const category = await Category.findById(id);

            if (!category) {
                return res.status(404).json(formatResponse(null, 'Category not found', 404));
            }

            res.json(formatResponse(category, 'Category retrieved successfully'));

        } catch (error) {
            console.error('Get category error:', error);
            handleError(error, res);
        }
    }

    // Create new category
    async createCategory(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
            }

            const { name, description } = req.body;

            // Create category
            const category = await Category.create({ name, description });

            res.status(201).json(formatResponse(category, 'Category created successfully', 201));

        } catch (error) {
            console.error('Create category error:', error);
            handleError(error, res);
        }
    }

    // Update category
    async updateCategory(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
            }

            const { id } = req.params;
            const updateData = req.body;

            // Check if category exists
            const existingCategory = await Category.findById(id);
            if (!existingCategory) {
                return res.status(404).json(formatResponse(null, 'Category not found', 404));
            }

            // Update category
            const updatedCategory = await Category.update(id, updateData);

            res.json(formatResponse(updatedCategory, 'Category updated successfully'));

        } catch (error) {
            console.error('Update category error:', error);
            handleError(error, res);
        }
    }

    // Delete category
    async deleteCategory(req, res) {
        try {
            const { id } = req.params;

            // Check if category exists
            const existingCategory = await Category.findById(id);
            if (!existingCategory) {
                return res.status(404).json(formatResponse(null, 'Category not found', 404));
            }

            // Delete category
            const deleted = await Category.delete(id);

            if (deleted) {
                res.json(formatResponse(null, 'Category deleted successfully'));
            } else {
                res.status(500).json(formatResponse(null, 'Failed to delete category', 500));
            }

        } catch (error) {
            console.error('Delete category error:', error);
            if (error.message.includes('Cannot delete category with existing products')) {
                return res.status(409).json(formatResponse(null, error.message, 409));
            }
            handleError(error, res);
        }
    }

    // Get category statistics
    async getCategoryStats(req, res) {
        try {
            const { id } = req.params;
            const stats = await Category.getStats(id);

            if (!stats) {
                return res.status(404).json(formatResponse(null, 'Category not found', 404));
            }

            res.json(formatResponse(stats, 'Category statistics retrieved successfully'));

        } catch (error) {
            console.error('Get category stats error:', error);
            handleError(error, res);
        }
    }
}

class SupplierController {
    // Get all suppliers
    async getAllSuppliers(req, res) {
        try {
            const includeStats = req.query.include_stats === 'true';
            const suppliers = await Supplier.findAll(includeStats);

            res.json(formatResponse({
                suppliers,
                count: suppliers.length
            }, 'Suppliers retrieved successfully'));

        } catch (error) {
            console.error('Get suppliers error:', error);
            handleError(error, res);
        }
    }

    // Get supplier by ID
    async getSupplierById(req, res) {
        try {
            const { id } = req.params;
            const supplier = await Supplier.findById(id);

            if (!supplier) {
                return res.status(404).json(formatResponse(null, 'Supplier not found', 404));
            }

            res.json(formatResponse(supplier, 'Supplier retrieved successfully'));

        } catch (error) {
            console.error('Get supplier error:', error);
            handleError(error, res);
        }
    }

    // Create new supplier
    async createSupplier(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
            }

            const { name, email, phone, address, contact_person } = req.body;

            // Check if supplier with email already exists
            if (email) {
                const existingSupplier = await Supplier.findByEmail(email);
                if (existingSupplier) {
                    return res.status(409).json(formatResponse(null, 'Supplier with this email already exists', 409));
                }
            }

            // Create supplier
            const supplier = await Supplier.create({
                name,
                email,
                phone,
                address,
                contact_person
            });

            res.status(201).json(formatResponse(supplier, 'Supplier created successfully', 201));

        } catch (error) {
            console.error('Create supplier error:', error);
            handleError(error, res);
        }
    }

    // Update supplier
    async updateSupplier(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
            }

            const { id } = req.params;
            const updateData = req.body;

            // Check if supplier exists
            const existingSupplier = await Supplier.findById(id);
            if (!existingSupplier) {
                return res.status(404).json(formatResponse(null, 'Supplier not found', 404));
            }

            // Check if new email already exists (exclude current supplier)
            if (updateData.email) {
                const supplierWithEmail = await Supplier.findByEmail(updateData.email);
                if (supplierWithEmail && supplierWithEmail.id !== parseInt(id)) {
                    return res.status(409).json(formatResponse(null, 'Supplier with this email already exists', 409));
                }
            }

            // Update supplier
            const updatedSupplier = await Supplier.update(id, updateData);

            res.json(formatResponse(updatedSupplier, 'Supplier updated successfully'));

        } catch (error) {
            console.error('Update supplier error:', error);
            handleError(error, res);
        }
    }

    // Delete supplier
    async deleteSupplier(req, res) {
        try {
            const { id } = req.params;

            // Check if supplier exists
            const existingSupplier = await Supplier.findById(id);
            if (!existingSupplier) {
                return res.status(404).json(formatResponse(null, 'Supplier not found', 404));
            }

            // Delete supplier
            const deleted = await Supplier.delete(id);

            if (deleted) {
                res.json(formatResponse(null, 'Supplier deleted successfully'));
            } else {
                res.status(500).json(formatResponse(null, 'Failed to delete supplier', 500));
            }

        } catch (error) {
            console.error('Delete supplier error:', error);
            if (error.message.includes('Cannot delete supplier with existing products')) {
                return res.status(409).json(formatResponse(null, error.message, 409));
            }
            handleError(error, res);
        }
    }

    // Get supplier statistics
    async getSupplierStats(req, res) {
        try {
            const { id } = req.params;
            const stats = await Supplier.getStats(id);

            if (!stats) {
                return res.status(404).json(formatResponse(null, 'Supplier not found', 404));
            }

            res.json(formatResponse(stats, 'Supplier statistics retrieved successfully'));

        } catch (error) {
            console.error('Get supplier stats error:', error);
            handleError(error, res);
        }
    }

    // Search suppliers
    async searchSuppliers(req, res) {
        try {
            const { q: searchTerm } = req.query;
            
            if (!searchTerm || searchTerm.trim().length < 2) {
                return res.status(400).json(formatResponse(null, 'Search term must be at least 2 characters', 400));
            }

            const suppliers = await Supplier.search(searchTerm.trim());

            res.json(formatResponse({
                suppliers,
                search_term: searchTerm,
                count: suppliers.length
            }, 'Supplier search completed successfully'));

        } catch (error) {
            console.error('Search suppliers error:', error);
            handleError(error, res);
        }
    }
}

module.exports = {
    CategoryController: new CategoryController(),
    SupplierController: new SupplierController()
};
const db = require('../config/database');

class Product {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.category_id = data.category_id;
        this.supplier_id = data.supplier_id;
        this.unit_cost = data.unit_cost;
        this.reorder_frequency = data.reorder_frequency;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        
        // Include related data if available
        this.category_name = data.category_name;
        this.supplier_name = data.supplier_name;
        this.current_stock = data.current_stock;
        this.min_stock = data.min_stock;
        this.max_stock = data.max_stock;
    }

    // Create a new product
    static async create(productData) {
        const { name, category_id, supplier_id, unit_cost, reorder_frequency } = productData;
        
        const query = `
            INSERT INTO products (name, category_id, supplier_id, unit_cost, reorder_frequency) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        try {
            const [result] = await db.execute(query, [name, category_id, supplier_id, unit_cost, reorder_frequency]);
            return await this.findById(result.insertId);
        } catch (error) {
            throw new Error(`Error creating product: ${error.message}`);
        }
    }

    // Find product by ID
    static async findById(id) {
        const query = `
            SELECT p.*, c.name as category_name, s.name as supplier_name,
                   i.current_stock, i.min_stock, i.max_stock
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            LEFT JOIN inventory i ON p.id = i.product_id
            WHERE p.id = ?
        `;
        
        try {
            const [rows] = await db.execute(query, [id]);
            return rows.length > 0 ? new Product(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error finding product: ${error.message}`);
        }
    }

    // Get all products with filtering and pagination
    static async findAll(filters = {}) {
        let query = `
            SELECT p.*, c.name as category_name, s.name as supplier_name,
                   i.current_stock, i.min_stock, i.max_stock
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            LEFT JOIN inventory i ON p.id = i.product_id
            WHERE 1=1
        `;
        
        const params = [];

        // Apply filters
        if (filters.category_id) {
            query += ' AND p.category_id = ?';
            params.push(filters.category_id);
        }

        if (filters.supplier_id) {
            query += ' AND p.supplier_id = ?';
            params.push(filters.supplier_id);
        }

        if (filters.reorder_frequency) {
            query += ' AND p.reorder_frequency = ?';
            params.push(filters.reorder_frequency);
        }

        if (filters.search) {
            query += ' AND (p.name LIKE ? OR c.name LIKE ? OR s.name LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (filters.low_stock === 'true') {
            query += ' AND i.current_stock <= i.min_stock';
        }

        // Sorting
        const sortBy = filters.sort_by || 'p.name';
        const sortOrder = filters.sort_order || 'ASC';
        query += ` ORDER BY ${sortBy} ${sortOrder}`;

        // Pagination
        const limit = parseInt(filters.limit) || 50;
        const offset = parseInt(filters.offset) || 0;
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);

        try {
            const [rows] = await db.execute(query, params);
            return rows.map(row => new Product(row));
        } catch (error) {
            throw new Error(`Error fetching products: ${error.message}`);
        }
    }

    // Update product
    static async update(id, updateData) {
        const allowedFields = ['name', 'category_id', 'supplier_id', 'unit_cost', 'reorder_frequency'];
        const updates = [];
        const values = [];

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (updates.length === 0) {
            throw new Error('No valid fields to update');
        }

        values.push(id);
        const query = `UPDATE products SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        
        try {
            await db.execute(query, values);
            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating product: ${error.message}`);
        }
    }

    // Delete product
    static async delete(id) {
        const query = 'DELETE FROM products WHERE id = ?';
        
        try {
            const [result] = await db.execute(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting product: ${error.message}`);
        }
    }

    // Get products by reorder frequency
    static async findByFrequency(frequency) {
        const query = `
            SELECT p.*, c.name as category_name, s.name as supplier_name,
                   i.current_stock, i.min_stock, i.max_stock
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            LEFT JOIN inventory i ON p.id = i.product_id
            WHERE p.reorder_frequency = ?
            ORDER BY p.name
        `;
        
        try {
            const [rows] = await db.execute(query, [frequency]);
            return rows.map(row => new Product(row));
        } catch (error) {
            throw new Error(`Error fetching products by frequency: ${error.message}`);
        }
    }

    // Get low stock products
    static async findLowStock() {
        const query = `
            SELECT p.*, c.name as category_name, s.name as supplier_name,
                   i.current_stock, i.min_stock, i.max_stock
            FROM products p
            JOIN inventory i ON p.id = i.product_id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE i.current_stock <= i.min_stock
            ORDER BY (i.current_stock / i.min_stock) ASC
        `;
        
        try {
            const [rows] = await db.execute(query);
            return rows.map(row => new Product(row));
        } catch (error) {
            throw new Error(`Error fetching low stock products: ${error.message}`);
        }
    }

    // Calculate total inventory value for all products
    static async getTotalInventoryValue() {
        const query = `
            SELECT SUM(p.unit_cost * i.current_stock) as total_value
            FROM products p
            JOIN inventory i ON p.id = i.product_id
        `;
        
        try {
            const [rows] = await db.execute(query);
            return parseFloat(rows[0].total_value) || 0;
        } catch (error) {
            throw new Error(`Error calculating inventory value: ${error.message}`);
        }
    }

    // Get product count
    static async getCount(filters = {}) {
        let query = 'SELECT COUNT(*) as count FROM products p WHERE 1=1';
        const params = [];

        if (filters.category_id) {
            query += ' AND p.category_id = ?';
            params.push(filters.category_id);
        }

        if (filters.supplier_id) {
            query += ' AND p.supplier_id = ?';
            params.push(filters.supplier_id);
        }

        if (filters.reorder_frequency) {
            query += ' AND p.reorder_frequency = ?';
            params.push(filters.reorder_frequency);
        }

        try {
            const [rows] = await db.execute(query, params);
            return rows[0].count;
        } catch (error) {
            throw new Error(`Error getting product count: ${error.message}`);
        }
    }
}

module.exports = Product;
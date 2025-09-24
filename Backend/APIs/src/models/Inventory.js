const db = require('../config/database');

class Inventory {
    constructor(data) {
        this.id = data.id;
        this.product_id = data.product_id;
        this.current_stock = data.current_stock;
        this.min_stock = data.min_stock;
        this.max_stock = data.max_stock;
        this.last_updated = data.last_updated;
        
        // Include product data if available
        this.product_name = data.product_name;
        this.unit_cost = data.unit_cost;
        this.category_name = data.category_name;
        this.supplier_name = data.supplier_name;
        this.reorder_frequency = data.reorder_frequency;
    }

    // Create new inventory record
    static async create(inventoryData) {
        const { product_id, current_stock, min_stock, max_stock } = inventoryData;
        
        const query = `
            INSERT INTO inventory (product_id, current_stock, min_stock, max_stock) 
            VALUES (?, ?, ?, ?)
        `;
        
        try {
            const [result] = await db.execute(query, [product_id, current_stock, min_stock, max_stock]);
            return await this.findById(result.insertId);
        } catch (error) {
            throw new Error(`Error creating inventory record: ${error.message}`);
        }
    }

    // Find inventory by ID
    static async findById(id) {
        const query = `
            SELECT i.*, p.name as product_name, p.unit_cost, p.reorder_frequency,
                   c.name as category_name, s.name as supplier_name
            FROM inventory i
            JOIN products p ON i.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE i.id = ?
        `;
        
        try {
            const [rows] = await db.execute(query, [id]);
            return rows.length > 0 ? new Inventory(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error finding inventory: ${error.message}`);
        }
    }

    // Find inventory by product ID
    static async findByProductId(productId) {
        const query = `
            SELECT i.*, p.name as product_name, p.unit_cost, p.reorder_frequency,
                   c.name as category_name, s.name as supplier_name
            FROM inventory i
            JOIN products p ON i.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE i.product_id = ?
        `;
        
        try {
            const [rows] = await db.execute(query, [productId]);
            return rows.length > 0 ? new Inventory(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error finding inventory by product: ${error.message}`);
        }
    }

    // Get all inventory items with filtering
    static async findAll(filters = {}) {
        let query = `
            SELECT i.*, p.name as product_name, p.unit_cost, p.reorder_frequency,
                   c.name as category_name, s.name as supplier_name
            FROM inventory i
            JOIN products p ON i.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
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

        if (filters.low_stock === 'true') {
            query += ' AND i.current_stock <= i.min_stock';
        }

        if (filters.out_of_stock === 'true') {
            query += ' AND i.current_stock = 0';
        }

        if (filters.search) {
            query += ' AND (p.name LIKE ? OR c.name LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
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
            return rows.map(row => new Inventory(row));
        } catch (error) {
            throw new Error(`Error fetching inventory: ${error.message}`);
        }
    }

    // Get low stock items
    static async findLowStock() {
        const query = `
            SELECT i.*, p.name as product_name, p.unit_cost, p.reorder_frequency,
                   c.name as category_name, s.name as supplier_name
            FROM inventory i
            JOIN products p ON i.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE i.current_stock <= i.min_stock
            ORDER BY (i.current_stock / i.min_stock) ASC
        `;
        
        try {
            const [rows] = await db.execute(query);
            return rows.map(row => new Inventory(row));
        } catch (error) {
            throw new Error(`Error fetching low stock items: ${error.message}`);
        }
    }

    // Get items by reorder frequency
    static async findByFrequency(frequency) {
        const query = `
            SELECT i.*, p.name as product_name, p.unit_cost, p.reorder_frequency,
                   c.name as category_name, s.name as supplier_name
            FROM inventory i
            JOIN products p ON i.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN suppliers s ON p.supplier_id = s.id
            WHERE p.reorder_frequency = ?
            ORDER BY p.name
        `;
        
        try {
            const [rows] = await db.execute(query, [frequency]);
            return rows.map(row => new Inventory(row));
        } catch (error) {
            throw new Error(`Error fetching inventory by frequency: ${error.message}`);
        }
    }

    // Update stock levels
    static async updateStock(id, stockData) {
        const allowedFields = ['current_stock', 'min_stock', 'max_stock'];
        const updates = [];
        const values = [];

        for (const [key, value] of Object.entries(stockData)) {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (updates.length === 0) {
            throw new Error('No valid fields to update');
        }

        values.push(id);
        const query = `UPDATE inventory SET ${updates.join(', ')}, last_updated = CURRENT_TIMESTAMP WHERE id = ?`;
        
        try {
            await db.execute(query, values);
            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating inventory: ${error.message}`);
        }
    }

    // Adjust stock (add or subtract)
    static async adjustStock(productId, quantity, type = 'IN') {
        // First get current inventory
        const inventory = await this.findByProductId(productId);
        if (!inventory) {
            throw new Error('Product not found in inventory');
        }

        const adjustment = type === 'IN' ? quantity : -quantity;
        const newStock = inventory.current_stock + adjustment;

        if (newStock < 0) {
            throw new Error('Insufficient stock for this operation');
        }

        const query = `
            UPDATE inventory 
            SET current_stock = ?, last_updated = CURRENT_TIMESTAMP 
            WHERE product_id = ?
        `;
        
        try {
            await db.execute(query, [newStock, productId]);
            return await this.findByProductId(productId);
        } catch (error) {
            throw new Error(`Error adjusting stock: ${error.message}`);
        }
    }

    // Get low stock summary by category
    static async getLowStockSummary() {
        const query = `
            SELECT c.name as category_name, COUNT(*) as low_stock_count,
                   SUM(i.current_stock * p.unit_cost) as total_value
            FROM inventory i
            JOIN products p ON i.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            WHERE i.current_stock <= i.min_stock
            GROUP BY c.id, c.name
            ORDER BY low_stock_count DESC
        `;
        
        try {
            const [rows] = await db.execute(query);
            return rows;
        } catch (error) {
            throw new Error(`Error getting low stock summary: ${error.message}`);
        }
    }

    // Get total inventory value
    static async getTotalStockValue() {
        const query = `
            SELECT SUM(i.current_stock * p.unit_cost) as total_value
            FROM inventory i
            JOIN products p ON i.product_id = p.id
        `;
        
        try {
            const [rows] = await db.execute(query);
            return parseFloat(rows[0].total_value) || 0;
        } catch (error) {
            throw new Error(`Error calculating total stock value: ${error.message}`);
        }
    }

    // Delete inventory record
    static async delete(id) {
        const query = 'DELETE FROM inventory WHERE id = ?';
        
        try {
            const [result] = await db.execute(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting inventory: ${error.message}`);
        }
    }
}

module.exports = Inventory;
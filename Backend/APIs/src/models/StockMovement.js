const db = require('../config/database');
const moment = require('moment');

class StockMovement {
    constructor(data) {
        this.id = data.id;
        this.product_id = data.product_id;
        this.quantity = data.quantity;
        this.movement_type = data.movement_type;
        this.notes = data.notes;
        this.created_at = data.created_at;
        
        // Include related data if available
        this.product_name = data.product_name;
        this.category_name = data.category_name;
        this.unit_cost = data.unit_cost;
    }

    // Create a new stock movement
    static async create(movementData) {
        const { product_id, quantity, movement_type, notes } = movementData;
        
        const query = `
            INSERT INTO stock_movements (product_id, quantity, movement_type, notes) 
            VALUES (?, ?, ?, ?)
        `;
        
        try {
            const [result] = await db.execute(query, [product_id, quantity, movement_type, notes]);
            return await this.findById(result.insertId);
        } catch (error) {
            throw new Error(`Error creating stock movement: ${error.message}`);
        }
    }

    // Find stock movement by ID
    static async findById(id) {
        const query = `
            SELECT sm.*, p.name as product_name, p.unit_cost, 
                   c.name as category_name
            FROM stock_movements sm
            JOIN products p ON sm.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE sm.id = ?
        `;
        
        try {
            const [rows] = await db.execute(query, [id]);
            return rows.length > 0 ? new StockMovement(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error finding stock movement: ${error.message}`);
        }
    }

    // Get all stock movements with filtering
    static async findAll(filters = {}) {
        let query = `
            SELECT sm.*, p.name as product_name, p.unit_cost,
                   c.name as category_name
            FROM stock_movements sm
            JOIN products p ON sm.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;
        
        const params = [];

        // Apply filters
        if (filters.product_id) {
            query += ' AND sm.product_id = ?';
            params.push(filters.product_id);
        }

        if (filters.movement_type) {
            query += ' AND sm.movement_type = ?';
            params.push(filters.movement_type);
        }

        if (filters.category_id) {
            query += ' AND p.category_id = ?';
            params.push(filters.category_id);
        }

        if (filters.date_from) {
            query += ' AND DATE(sm.created_at) >= ?';
            params.push(filters.date_from);
        }

        if (filters.date_to) {
            query += ' AND DATE(sm.created_at) <= ?';
            params.push(filters.date_to);
        }

        if (filters.search) {
            query += ' AND (p.name LIKE ? OR sm.notes LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }

        // Sorting
        const sortBy = filters.sort_by || 'sm.created_at';
        const sortOrder = filters.sort_order || 'DESC';
        query += ` ORDER BY ${sortBy} ${sortOrder}`;

        // Pagination
        const limit = parseInt(filters.limit) || 50;
        const offset = parseInt(filters.offset) || 0;
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);

        try {
            const [rows] = await db.execute(query, params);
            return rows.map(row => new StockMovement(row));
        } catch (error) {
            throw new Error(`Error fetching stock movements: ${error.message}`);
        }
    }

    // Get stock movements for a specific product
    static async findByProduct(productId, limit = 50) {
        const query = `
            SELECT sm.*, p.name as product_name, p.unit_cost,
                   c.name as category_name
            FROM stock_movements sm
            JOIN products p ON sm.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE sm.product_id = ?
            ORDER BY sm.created_at DESC
            LIMIT ?
        `;
        
        try {
            const [rows] = await db.execute(query, [productId, limit]);
            return rows.map(row => new StockMovement(row));
        } catch (error) {
            throw new Error(`Error fetching product movements: ${error.message}`);
        }
    }

    // Get recent stock movements
    static async getRecent(limit = 20) {
        const query = `
            SELECT sm.*, p.name as product_name, p.unit_cost,
                   c.name as category_name
            FROM stock_movements sm
            JOIN products p ON sm.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY sm.created_at DESC
            LIMIT ?
        `;
        
        try {
            const [rows] = await db.execute(query, [limit]);
            return rows.map(row => new StockMovement(row));
        } catch (error) {
            throw new Error(`Error fetching recent movements: ${error.message}`);
        }
    }

    // Get movement statistics for a date range
    static async getMovementStats(dateFrom, dateTo) {
        const query = `
            SELECT 
                movement_type,
                COUNT(*) as movement_count,
                SUM(ABS(quantity)) as total_quantity,
                SUM(ABS(quantity) * p.unit_cost) as total_value
            FROM stock_movements sm
            JOIN products p ON sm.product_id = p.id
            WHERE DATE(sm.created_at) BETWEEN ? AND ?
            GROUP BY movement_type
        `;
        
        try {
            const [rows] = await db.execute(query, [dateFrom, dateTo]);
            return rows;
        } catch (error) {
            throw new Error(`Error getting movement stats: ${error.message}`);
        }
    }

    // Get usage analytics for products
    static async getUsageAnalytics(days = 30) {
        const dateFrom = moment().subtract(days, 'days').format('YYYY-MM-DD');
        
        const query = `
            SELECT 
                p.id,
                p.name as product_name,
                c.name as category_name,
                SUM(CASE WHEN sm.movement_type = 'OUT' THEN ABS(sm.quantity) ELSE 0 END) as total_used,
                COUNT(CASE WHEN sm.movement_type = 'OUT' THEN 1 END) as usage_frequency,
                SUM(CASE WHEN sm.movement_type = 'OUT' THEN ABS(sm.quantity) * p.unit_cost ELSE 0 END) as usage_value,
                AVG(CASE WHEN sm.movement_type = 'OUT' THEN ABS(sm.quantity) ELSE NULL END) as avg_usage_per_transaction
            FROM products p
            LEFT JOIN stock_movements sm ON p.id = sm.product_id AND DATE(sm.created_at) >= ?
            LEFT JOIN categories c ON p.category_id = c.id
            GROUP BY p.id, p.name, c.name
            HAVING total_used > 0
            ORDER BY total_used DESC
        `;
        
        try {
            const [rows] = await db.execute(query, [dateFrom]);
            return rows;
        } catch (error) {
            throw new Error(`Error getting usage analytics: ${error.message}`);
        }
    }

    // Get cost analysis for a date range
    static async getCostAnalysis(dateFrom, dateTo) {
        const query = `
            SELECT 
                c.name as category_name,
                SUM(CASE WHEN sm.movement_type = 'IN' THEN sm.quantity * p.unit_cost ELSE 0 END) as purchases,
                SUM(CASE WHEN sm.movement_type = 'OUT' THEN ABS(sm.quantity) * p.unit_cost ELSE 0 END) as usage_cost,
                COUNT(CASE WHEN sm.movement_type = 'IN' THEN 1 END) as purchase_transactions,
                COUNT(CASE WHEN sm.movement_type = 'OUT' THEN 1 END) as usage_transactions
            FROM stock_movements sm
            JOIN products p ON sm.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            WHERE DATE(sm.created_at) BETWEEN ? AND ?
            GROUP BY c.id, c.name
            ORDER BY usage_cost DESC
        `;
        
        try {
            const [rows] = await db.execute(query, [dateFrom, dateTo]);
            return rows;
        } catch (error) {
            throw new Error(`Error getting cost analysis: ${error.message}`);
        }
    }

    // Delete stock movement (admin only)
    static async delete(id) {
        const query = 'DELETE FROM stock_movements WHERE id = ?';
        
        try {
            const [result] = await db.execute(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting stock movement: ${error.message}`);
        }
    }

    // Get movement count
    static async getCount(filters = {}) {
        let query = 'SELECT COUNT(*) as count FROM stock_movements sm JOIN products p ON sm.product_id = p.id WHERE 1=1';
        const params = [];

        if (filters.product_id) {
            query += ' AND sm.product_id = ?';
            params.push(filters.product_id);
        }

        if (filters.movement_type) {
            query += ' AND sm.movement_type = ?';
            params.push(filters.movement_type);
        }

        if (filters.date_from) {
            query += ' AND DATE(sm.created_at) >= ?';
            params.push(filters.date_from);
        }

        if (filters.date_to) {
            query += ' AND DATE(sm.created_at) <= ?';
            params.push(filters.date_to);
        }

        try {
            const [rows] = await db.execute(query, params);
            return rows[0].count;
        } catch (error) {
            throw new Error(`Error getting movement count: ${error.message}`);
        }
    }
}

module.exports = StockMovement;
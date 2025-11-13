const db = require('../config/database');

class Supplier {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.phone = data.phone;
        this.created_at = data.created_at;
        
        // Include aggregated data if available
        this.product_count = data.product_count;
        this.total_inventory_value = data.total_inventory_value;
    }

    // Create a new supplier
    static async create(supplierData) {
        const { name, email, phone } = supplierData;
        
        const query = `
            INSERT INTO suppliers (name, email, phone) 
            VALUES (?, ?, ?)
        `;
        
        try {
            const [result] = await db.execute(query, [name, email, phone]);
            return await this.findById(result.insertId);
        } catch (error) {
            throw new Error(`Error creating supplier: ${error.message}`);
        }
    }

    // Find supplier by ID
    static async findById(id) {
        const query = 'SELECT * FROM suppliers WHERE id = ?';
        
        try {
            const [rows] = await db.execute(query, [id]);
            return rows.length > 0 ? new Supplier(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error finding supplier: ${error.message}`);
        }
    }

    // Get all suppliers
    static async findAll(includeStats = false) {
        let query = 'SELECT s.*';
        
        if (includeStats) {
            query += `, 
                COUNT(p.id) as product_count,
                COALESCE(SUM(i.current_stock * p.unit_cost), 0) as total_inventory_value
            FROM suppliers s
            LEFT JOIN products p ON s.id = p.supplier_id
            LEFT JOIN inventory i ON p.id = i.product_id
            GROUP BY s.id, s.name, s.email, s.phone, s.created_at
            `;
        } else {
            query += ' FROM suppliers s';
        }
        
        query += ' ORDER BY s.name';

        try {
            const [rows] = await db.execute(query);
            return rows.map(row => new Supplier(row));
        } catch (error) {
            throw new Error(`Error fetching suppliers: ${error.message}`);
        }
    }

    // Update supplier
    static async update(id, updateData) {
        const allowedFields = ['name', 'email', 'phone'];
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
        const query = `UPDATE suppliers SET ${updates.join(', ')} WHERE id = ?`;
        
        try {
            await db.execute(query, values);
            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating supplier: ${error.message}`);
        }
    }

    // Delete supplier
    static async delete(id) {
        // Check if supplier has products
        const productCheckQuery = 'SELECT COUNT(*) as count FROM products WHERE supplier_id = ?';
        const [productCheck] = await db.execute(productCheckQuery, [id]);
        
        if (productCheck[0].count > 0) {
            throw new Error('Cannot delete supplier with existing products');
        }

        const query = 'DELETE FROM suppliers WHERE id = ?';
        
        try {
            const [result] = await db.execute(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting supplier: ${error.message}`);
        }
    }

    // Get supplier statistics
    static async getStats(id) {
        const query = `
            SELECT s.*, 
                COUNT(p.id) as product_count,
                COUNT(CASE WHEN i.current_stock <= i.min_stock THEN 1 END) as low_stock_count,
                COALESCE(SUM(i.current_stock * p.unit_cost), 0) as total_inventory_value,
                COALESCE(AVG(p.unit_cost), 0) as avg_unit_cost
            FROM suppliers s
            LEFT JOIN products p ON s.id = p.supplier_id
            LEFT JOIN inventory i ON p.id = i.product_id
            WHERE s.id = ?
            GROUP BY s.id, s.name, s.email, s.phone, s.created_at
        `;
        
        try {
            const [rows] = await db.execute(query, [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw new Error(`Error getting supplier stats: ${error.message}`);
        }
    }

    // Find supplier by email
    static async findByEmail(email) {
        const query = 'SELECT * FROM suppliers WHERE email = ?';
        
        try {
            const [rows] = await db.execute(query, [email]);
            return rows.length > 0 ? new Supplier(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error finding supplier by email: ${error.message}`);
        }
    }

    // Search suppliers
    static async search(searchTerm) {
        const query = `
            SELECT * FROM suppliers 
            WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?
            ORDER BY name
        `;
        
        const searchPattern = `%${searchTerm}%`;
        
        try {
            const [rows] = await db.execute(query, [searchPattern, searchPattern, searchPattern]);
            return rows.map(row => new Supplier(row));
        } catch (error) {
            throw new Error(`Error searching suppliers: ${error.message}`);
        }
    }
}

module.exports = Supplier;
const db = require('../config/database');

class Category {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        
        // Include aggregated data if available
        this.product_count = data.product_count;
        this.total_inventory_value = data.total_inventory_value;
    }

    // Create a new category
    static async create(categoryData) {
        const { name, description } = categoryData;
        
        const query = `
            INSERT INTO categories (name, description) 
            VALUES (?, ?)
        `;
        
        try {
            const [result] = await db.execute(query, [name, description]);
            return await this.findById(result.insertId);
        } catch (error) {
            throw new Error(`Error creating category: ${error.message}`);
        }
    }

    // Find category by ID
    static async findById(id) {
        const query = 'SELECT * FROM categories WHERE id = ?';
        
        try {
            const [rows] = await db.execute(query, [id]);
            return rows.length > 0 ? new Category(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error finding category: ${error.message}`);
        }
    }

    // Get all categories
    static async findAll(includeStats = false) {
        let query = 'SELECT c.*';
        
        if (includeStats) {
            query += `, 
                COUNT(p.id) as product_count,
                COALESCE(SUM(i.current_stock * p.unit_cost), 0) as total_inventory_value
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            LEFT JOIN inventory i ON p.id = i.product_id
            GROUP BY c.id, c.name, c.description, c.created_at, c.updated_at
            `;
        } else {
            query += ' FROM categories c';
        }
        
        query += ' ORDER BY c.name';

        try {
            const [rows] = await db.execute(query);
            return rows.map(row => new Category(row));
        } catch (error) {
            throw new Error(`Error fetching categories: ${error.message}`);
        }
    }

    // Update category
    static async update(id, updateData) {
        const allowedFields = ['name', 'description'];
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
        const query = `UPDATE categories SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        
        try {
            await db.execute(query, values);
            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating category: ${error.message}`);
        }
    }

    // Delete category
    static async delete(id) {
        // Check if category has products
        const productCheckQuery = 'SELECT COUNT(*) as count FROM products WHERE category_id = ?';
        const [productCheck] = await db.execute(productCheckQuery, [id]);
        
        if (productCheck[0].count > 0) {
            throw new Error('Cannot delete category with existing products');
        }

        const query = 'DELETE FROM categories WHERE id = ?';
        
        try {
            const [result] = await db.execute(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting category: ${error.message}`);
        }
    }

    // Get category statistics
    static async getStats(id) {
        const query = `
            SELECT c.*, 
                COUNT(p.id) as product_count,
                COUNT(CASE WHEN i.current_stock <= i.min_stock THEN 1 END) as low_stock_count,
                COALESCE(SUM(i.current_stock * p.unit_cost), 0) as total_inventory_value,
                COALESCE(AVG(p.unit_cost), 0) as avg_unit_cost
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id
            LEFT JOIN inventory i ON p.id = i.product_id
            WHERE c.id = ?
            GROUP BY c.id, c.name, c.description, c.created_at, c.updated_at
        `;
        
        try {
            const [rows] = await db.execute(query, [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw new Error(`Error getting category stats: ${error.message}`);
        }
    }
}

module.exports = Category;
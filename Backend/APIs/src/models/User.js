const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.email = data.email;
        this.password = data.password;
        this.role = data.role;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Create a new user
    static async create(userData) {
        const { username, email, password, role = 'staff' } = userData;
        
        // Hash password
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const query = `
            INSERT INTO users (username, email, password, role) 
            VALUES (?, ?, ?, ?)
        `;
        
        try {
            const [result] = await db.execute(query, [username, email, hashedPassword, role]);
            return await this.findById(result.insertId);
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    // Find user by ID
    static async findById(id) {
        const query = 'SELECT * FROM users WHERE id = ?';
        
        try {
            const [rows] = await db.execute(query, [id]);
            return rows.length > 0 ? new User(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error finding user: ${error.message}`);
        }
    }

    // Find user by username
    static async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = ?';
        
        try {
            const [rows] = await db.execute(query, [username]);
            return rows.length > 0 ? new User(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error finding user: ${error.message}`);
        }
    }

    // Find user by email
    static async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = ?';
        
        try {
            const [rows] = await db.execute(query, [email]);
            return rows.length > 0 ? new User(rows[0]) : null;
        } catch (error) {
            throw new Error(`Error finding user: ${error.message}`);
        }
    }

    // Get all users
    static async findAll(limit = 50, offset = 0) {
        const query = 'SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?';
        
        try {
            const [rows] = await db.execute(query, [limit, offset]);
            return rows.map(row => new User(row));
        } catch (error) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }

    // Update user
    static async update(id, updateData) {
        const allowedFields = ['username', 'email', 'role'];
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
        const query = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        
        try {
            await db.execute(query, values);
            return await this.findById(id);
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    // Delete user
    static async delete(id) {
        const query = 'DELETE FROM users WHERE id = ?';
        
        try {
            const [result] = await db.execute(query, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }

    // Validate password
    async validatePassword(password) {
        return await bcrypt.compare(password, this.password);
    }

    // Update password
    async updatePassword(newPassword) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        const query = 'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
        
        try {
            await db.execute(query, [hashedPassword, this.id]);
            return true;
        } catch (error) {
            throw new Error(`Error updating password: ${error.message}`);
        }
    }

    // Convert to JSON (exclude password)
    toJSON() {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}

module.exports = User;
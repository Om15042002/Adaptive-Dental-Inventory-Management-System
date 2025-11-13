const express = require("express");
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { formatResponse } = require("../utils/helpers");
const { connectDB } = require('../config/database');
const { authenticateToken, requireAdmin, requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const connection = await connectDB();
        
        const [users] = await connection.execute(
            'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
        );
        
        await connection.end();
        
        res.json(formatResponse(users, "Users retrieved successfully"));
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json(
            formatResponse(null, 'Internal server error', false)
        );
    }
});

// Get user by ID (admin only or own profile)
router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        // Check if user is admin or accessing their own profile
        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json(
                formatResponse(null, 'Access denied', false)
            );
        }
        
        const connection = await connectDB();
        
        const [users] = await connection.execute(
            'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
            [userId]
        );
        
        await connection.end();
        
        if (users.length === 0) {
            return res.status(404).json(
                formatResponse(null, 'User not found', false)
            );
        }
        
        res.json(formatResponse(users[0], "User retrieved successfully"));
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json(
            formatResponse(null, 'Internal server error', false)
        );
    }
});

// Update user (admin only or own profile for limited fields)
router.put("/:id", authenticateToken, [
    body('email').optional().isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
    body('role').optional().isIn(['admin', 'staff']).withMessage('Role must be either admin or staff')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(
                formatResponse(null, errors.array()[0].msg, false)
            );
        }

        const userId = parseInt(req.params.id);
        const { email, role } = req.body;
        
        // Check permissions
        const isAdmin = req.user.role === 'admin';
        const isOwnProfile = req.user.id === userId;
        
        if (!isAdmin && !isOwnProfile) {
            return res.status(403).json(
                formatResponse(null, 'Access denied', false)
            );
        }
        
        // Non-admins can only update their own email
        if (!isAdmin && role !== undefined) {
            return res.status(403).json(
                formatResponse(null, 'Only admins can change user roles', false)
            );
        }
        
        const connection = await connectDB();
        
        // Check if user exists
        const [existingUsers] = await connection.execute(
            'SELECT id FROM users WHERE id = ?',
            [userId]
        );
        
        if (existingUsers.length === 0) {
            await connection.end();
            return res.status(404).json(
                formatResponse(null, 'User not found', false)
            );
        }
        
        // Build update query dynamically
        const updateFields = [];
        const updateValues = [];
        
        if (email !== undefined) {
            // Check if email is already taken by another user
            const [emailCheck] = await connection.execute(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, userId]
            );
            
            if (emailCheck.length > 0) {
                await connection.end();
                return res.status(400).json(
                    formatResponse(null, 'Email already exists', false)
                );
            }
            
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        
        if (role !== undefined && isAdmin) {
            updateFields.push('role = ?');
            updateValues.push(role);
        }
        
        if (updateFields.length === 0) {
            await connection.end();
            return res.status(400).json(
                formatResponse(null, 'No valid fields to update', false)
            );
        }
        
        updateValues.push(userId);
        
        await connection.execute(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );
        
        // Get updated user data
        const [updatedUsers] = await connection.execute(
            'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
            [userId]
        );
        
        await connection.end();
        
        res.json(formatResponse(updatedUsers[0], "User updated successfully"));
        
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json(
            formatResponse(null, 'Internal server error', false)
        );
    }
});

// Delete user (admin only, cannot delete self)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        // Prevent admin from deleting themselves
        if (req.user.id === userId) {
            return res.status(400).json(
                formatResponse(null, 'Cannot delete your own account', false)
            );
        }
        
        const connection = await connectDB();
        
        // Check if user exists
        const [existingUsers] = await connection.execute(
            'SELECT id, username FROM users WHERE id = ?',
            [userId]
        );
        
        if (existingUsers.length === 0) {
            await connection.end();
            return res.status(404).json(
                formatResponse(null, 'User not found', false)
            );
        }
        
        // Delete user
        await connection.execute('DELETE FROM users WHERE id = ?', [userId]);
        
        await connection.end();
        
        res.json(formatResponse(null, `User ${existingUsers[0].username} deleted successfully`));
        
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json(
            formatResponse(null, 'Internal server error', false)
        );
    }
});

module.exports = router;

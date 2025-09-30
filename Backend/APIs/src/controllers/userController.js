const { validationResult } = require('express-validator');
const User = require('../models/User');
const { formatResponse, handleError } = require('../utils/helpers');

class UserController {
    // Get all users (admin only)
    async getAllUsers(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;

            const users = await User.findAll(limit, offset);
            
            // Remove passwords from response
            const userData = users.map(user => user.toJSON());

            res.json(formatResponse({
                users: userData,
                pagination: {
                    limit,
                    offset,
                    total: userData.length
                }
            }, 'Users retrieved successfully'));

        } catch (error) {
            console.error('Get all users error:', error);
            handleError(error, res);
        }
    }

    // Get user profile
    async getUserProfile(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);

            if (!user) {
                return res.status(404).json(formatResponse(null, 'User not found', 404));
            }

            // Return user data (exclude password)
            const userData = user.toJSON();
            res.json(formatResponse(userData, 'User profile retrieved successfully'));

        } catch (error) {
            console.error('Get user profile error:', error);
            handleError(error, res);
        }
    }

    // Update user profile
    async updateUserProfile(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
            }

            const { id } = req.params;
            const updateData = req.body;

            // Check if user exists
            const existingUser = await User.findById(id);
            if (!existingUser) {
                return res.status(404).json(formatResponse(null, 'User not found', 404));
            }

            // Check if new username/email already exists (exclude current user)
            if (updateData.username) {
                const userWithUsername = await User.findByUsername(updateData.username);
                if (userWithUsername && userWithUsername.id !== parseInt(id)) {
                    return res.status(409).json(formatResponse(null, 'Username already exists', 409));
                }
            }

            if (updateData.email) {
                const userWithEmail = await User.findByEmail(updateData.email);
                if (userWithEmail && userWithEmail.id !== parseInt(id)) {
                    return res.status(409).json(formatResponse(null, 'Email already exists', 409));
                }
            }

            // Remove password from update data (use separate endpoint for password changes)
            delete updateData.password;

            // Update user
            const updatedUser = await User.update(id, updateData);
            if (!updatedUser) {
                return res.status(404).json(formatResponse(null, 'User not found', 404));
            }

            // Return updated user data (exclude password)
            const userData = updatedUser.toJSON();
            res.json(formatResponse(userData, 'User profile updated successfully'));

        } catch (error) {
            console.error('Update user profile error:', error);
            handleError(error, res);
        }
    }

    // Delete user (admin only)
    async deleteUser(req, res) {
        try {
            const { id } = req.params;

            // Prevent admin from deleting themselves
            if (parseInt(id) === req.user.userId) {
                return res.status(400).json(formatResponse(null, 'Cannot delete your own account', 400));
            }

            // Check if user exists
            const existingUser = await User.findById(id);
            if (!existingUser) {
                return res.status(404).json(formatResponse(null, 'User not found', 404));
            }

            // Delete user
            const deleted = await User.delete(id);

            if (deleted) {
                res.json(formatResponse(null, 'User deleted successfully'));
            } else {
                res.status(500).json(formatResponse(null, 'Failed to delete user', 500));
            }

        } catch (error) {
            console.error('Delete user error:', error);
            handleError(error, res);
        }
    }

    // Get user statistics (admin only)
    async getUserStats(req, res) {
        try {
            // This would require additional database queries
            // For now, returning basic stats
            const allUsers = await User.findAll(1000, 0); // Get up to 1000 users for stats
            
            const stats = {
                total_users: allUsers.length,
                admin_users: allUsers.filter(user => user.role === 'admin').length,
                staff_users: allUsers.filter(user => user.role === 'staff').length,
                recent_registrations: allUsers.filter(user => {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    return new Date(user.created_at) > oneWeekAgo;
                }).length
            };

            res.json(formatResponse(stats, 'User statistics retrieved successfully'));

        } catch (error) {
            console.error('Get user stats error:', error);
            handleError(error, res);
        }
    }
}

module.exports = new UserController();
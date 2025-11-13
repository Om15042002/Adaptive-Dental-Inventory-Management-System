const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { formatResponse, handleError } = require('../utils/helpers');

class AuthController {
    // User login
    async login(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
            }

            const { username, password } = req.body;

            // Find user by username or email
            let user = await User.findByUsername(username);
            if (!user) {
                user = await User.findByEmail(username);
            }

            if (!user) {
                return res.status(401).json(formatResponse(null, 'Invalid credentials', 401));
            }

            // Validate password
            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                return res.status(401).json(formatResponse(null, 'Invalid credentials', 401));
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    userId: user.id, 
                    username: user.username, 
                    role: user.role 
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '24h' }
            );

            // Return user data and token (exclude password)
            const userData = user.toJSON();
            
            res.json(formatResponse({
                user: userData,
                token,
                expiresIn: process.env.JWT_EXPIRE || '24h'
            }, 'Login successful'));

        } catch (error) {
            console.error('Login error:', error);
            handleError(error, res);
        }
    }

    // User logout (client-side token removal, server-side can implement token blacklisting)
    async logout(req, res) {
        try {
            // In a real application, you might want to blacklist the token
            // For now, we'll just return a success message
            res.json(formatResponse(null, 'Logout successful'));
        } catch (error) {
            handleError(error, res);
        }
    }

    // User registration
    async register(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
            }

            const { username, email, password, role = 'staff' } = req.body;

            // Check if user already exists
            const existingUserByUsername = await User.findByUsername(username);
            if (existingUserByUsername) {
                return res.status(409).json(formatResponse(null, 'Username already exists', 409));
            }

            const existingUserByEmail = await User.findByEmail(email);
            if (existingUserByEmail) {
                return res.status(409).json(formatResponse(null, 'Email already exists', 409));
            }

            // Create new user
            const newUser = await User.create({
                username,
                email,
                password,
                role
            });

            // Generate JWT token
            const token = jwt.sign(
                { 
                    userId: newUser.id, 
                    username: newUser.username, 
                    role: newUser.role 
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '24h' }
            );

            // Return user data and token (exclude password)
            const userData = newUser.toJSON();
            
            res.status(201).json(formatResponse({
                user: userData,
                token,
                expiresIn: process.env.JWT_EXPIRE || '24h'
            }, 'User registered successfully', 201));

        } catch (error) {
            console.error('Registration error:', error);
            handleError(error, res);
        }
    }

    // Get current user profile
    async getProfile(req, res) {
        try {
            const userId = req.user.userId;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json(formatResponse(null, 'User not found', 404));
            }

            // Return user data (exclude password)
            const userData = user.toJSON();
            res.json(formatResponse(userData, 'Profile retrieved successfully'));

        } catch (error) {
            console.error('Get profile error:', error);
            handleError(error, res);
        }
    }

    // Update user profile
    async updateProfile(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
            }

            const userId = req.user.userId;
            const { username, email } = req.body;

            // Check if new username/email already exists (exclude current user)
            if (username) {
                const existingUser = await User.findByUsername(username);
                if (existingUser && existingUser.id !== userId) {
                    return res.status(409).json(formatResponse(null, 'Username already exists', 409));
                }
            }

            if (email) {
                const existingUser = await User.findByEmail(email);
                if (existingUser && existingUser.id !== userId) {
                    return res.status(409).json(formatResponse(null, 'Email already exists', 409));
                }
            }

            // Update user
            const updatedUser = await User.update(userId, { username, email });
            if (!updatedUser) {
                return res.status(404).json(formatResponse(null, 'User not found', 404));
            }

            // Return updated user data (exclude password)
            const userData = updatedUser.toJSON();
            res.json(formatResponse(userData, 'Profile updated successfully'));

        } catch (error) {
            console.error('Update profile error:', error);
            handleError(error, res);
        }
    }

    // Change password
    async changePassword(req, res) {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
            }

            const userId = req.user.userId;
            const { currentPassword, newPassword } = req.body;

            // Get user
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json(formatResponse(null, 'User not found', 404));
            }

            // Validate current password
            const isValidPassword = await user.validatePassword(currentPassword);
            if (!isValidPassword) {
                return res.status(401).json(formatResponse(null, 'Current password is incorrect', 401));
            }

            // Update password
            await user.updatePassword(newPassword);

            res.json(formatResponse(null, 'Password changed successfully'));

        } catch (error) {
            console.error('Change password error:', error);
            handleError(error, res);
        }
    }

    // Admin: Get all users
    async getAllUsers(req, res) {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin') {
                return res.status(403).json(formatResponse(null, 'Access denied. Admin role required', 403));
            }

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

    // Admin: Update user role
    async updateUserRole(req, res) {
        try {
            // Check if user is admin
            if (req.user.role !== 'admin') {
                return res.status(403).json(formatResponse(null, 'Access denied. Admin role required', 403));
            }

            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(formatResponse(null, 'Validation failed', 400, errors.array()));
            }

            const { userId } = req.params;
            const { role } = req.body;

            // Prevent admin from changing their own role
            if (parseInt(userId) === req.user.userId) {
                return res.status(400).json(formatResponse(null, 'Cannot change your own role', 400));
            }

            const updatedUser = await User.update(userId, { role });
            if (!updatedUser) {
                return res.status(404).json(formatResponse(null, 'User not found', 404));
            }

            // Return updated user data (exclude password)
            const userData = updatedUser.toJSON();
            res.json(formatResponse(userData, 'User role updated successfully'));

        } catch (error) {
            console.error('Update user role error:', error);
            handleError(error, res);
        }
    }
}

module.exports = new AuthController();
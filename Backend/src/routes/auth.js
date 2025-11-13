const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { formatResponse } = require("../utils/helpers");
const { connectDB } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
    body('username')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('role')
        .optional()
        .isIn(['admin', 'staff'])
        .withMessage('Role must be either admin or staff')
];

const loginValidation = [
    body('username')
        .notEmpty()
        .withMessage('Username is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Public registration endpoint (for initial setup or when no admin exists)
router.post("/public-register", registerValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(
                formatResponse(null, errors.array()[0].msg, false)
            );
        }

        const { username, email, password, role = 'staff' } = req.body;
        const connection = await connectDB();

        // Check if any users exist (for initial admin setup)
        const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
        const isFirstUser = userCount[0].count === 0;

        // If not first user, only allow staff registration or require admin token
        if (!isFirstUser && role === 'admin') {
            await connection.end();
            return res.status(403).json(
                formatResponse(null, 'Admin registration requires existing admin approval', false)
            );
        }

        // Check if username or email already exists
        const [existingUser] = await connection.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser.length > 0) {
            await connection.end();
            return res.status(400).json(
                formatResponse(null, 'Username or email already exists', false)
            );
        }

        // Hash password
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // For first user, make them admin automatically
        const finalRole = isFirstUser ? 'admin' : role;

        // Insert new user
        const [result] = await connection.execute(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, finalRole]
        );

        await connection.end();

        // Return user data without password
        const userData = {
            id: result.insertId,
            username,
            email,
            role: finalRole
        };

        res.status(201).json(
            formatResponse(userData, isFirstUser ? 'Admin account created successfully' : 'Account created successfully')
        );

    } catch (error) {
        console.error('Public registration error:', error);
        res.status(500).json(
            formatResponse(null, 'Internal server error', false)
        );
    }
});

// Register new user (only admins can register new users)
router.post("/register", authenticateToken, requireAdmin, registerValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(
                formatResponse(null, errors.array()[0].msg, false)
            );
        }

        const { username, email, password, role = 'staff' } = req.body;
        const connection = await connectDB();

        // Check if username or email already exists
        const [existingUser] = await connection.execute(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser.length > 0) {
            await connection.end();
            return res.status(400).json(
                formatResponse(null, 'Username or email already exists', false)
            );
        }

        // Hash password
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const [result] = await connection.execute(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role]
        );

        await connection.end();

        // Return user data without password
        const userData = {
            id: result.insertId,
            username,
            email,
            role
        };

        res.status(201).json(
            formatResponse(userData, 'User registered successfully')
        );

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json(
            formatResponse(null, 'Internal server error', false)
        );
    }
});

// Login user
router.post("/login", loginValidation, async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(
                formatResponse(null, errors.array()[0].msg, false)
            );
        }

        const { username, password } = req.body;
        const connection = await connectDB();

        // Find user by username
        const [users] = await connection.execute(
            'SELECT id, username, email, password, role FROM users WHERE username = ?',
            [username]
        );

        await connection.end();

        if (users.length === 0) {
            return res.status(400).json(
                formatResponse(null, 'Invalid credentials', false)
            );
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json(
                formatResponse(null, 'Invalid credentials', false)
            );
        }

        // Generate JWT token
        const tokenPayload = {
            id: user.id,
            username: user.username,
            role: user.role
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '24h' }
        );

        // Return user data and token (without password)
        const responseData = {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            token
        };

        res.json(
            formatResponse(responseData, 'Login successful')
        );

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json(
            formatResponse(null, 'Internal server error', false)
        );
    }
});

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const connection = await connectDB();

        const [users] = await connection.execute(
            'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        await connection.end();

        if (users.length === 0) {
            return res.status(404).json(
                formatResponse(null, 'User not found', false)
            );
        }

        res.json(
            formatResponse(users[0], 'Profile retrieved successfully')
        );

    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json(
            formatResponse(null, 'Internal server error', false)
        );
    }
});

// Logout (client-side token removal, but we can blacklist tokens if needed)
router.post("/logout", authenticateToken, (req, res) => {
    // In a more sophisticated system, you might want to blacklist the token
    // For now, we'll just send a success response as token removal happens client-side
    res.json(
        formatResponse(null, 'Logged out successfully')
    );
});

// Change password
router.put("/change-password", authenticateToken, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(
                formatResponse(null, errors.array()[0].msg, false)
            );
        }

        const { currentPassword, newPassword } = req.body;
        const connection = await connectDB();

        // Get current user's password
        const [users] = await connection.execute(
            'SELECT password FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            await connection.end();
            return res.status(404).json(
                formatResponse(null, 'User not found', false)
            );
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, users[0].password);
        if (!isCurrentPasswordValid) {
            await connection.end();
            return res.status(400).json(
                formatResponse(null, 'Current password is incorrect', false)
            );
        }

        // Hash new password
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await connection.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedNewPassword, req.user.id]
        );

        await connection.end();

        res.json(
            formatResponse(null, 'Password changed successfully')
        );

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json(
            formatResponse(null, 'Internal server error', false)
        );
    }
});

module.exports = router;

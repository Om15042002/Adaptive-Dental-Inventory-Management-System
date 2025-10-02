const express = require('express');
const { formatResponse } = require('../utils/helpers');
const router = express.Router();

// Basic auth routes placeholder
router.get('/', (req, res) => {
    res.json(formatResponse(null, 'Auth routes - Coming soon'));
});

router.post('/login', (req, res) => {
    res.json(formatResponse(null, 'Login endpoint - Coming soon'));
});

router.post('/register', (req, res) => {
    res.json(formatResponse(null, 'Register endpoint - Coming soon'));
});

module.exports = router;
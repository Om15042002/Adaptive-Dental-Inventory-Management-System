const express = require('express');
const { formatResponse } = require('../utils/helpers');
const router = express.Router();

// Basic suppliers routes placeholder
router.get('/', (req, res) => {
    res.json(formatResponse([], 'Suppliers - Coming soon'));
});

module.exports = router;
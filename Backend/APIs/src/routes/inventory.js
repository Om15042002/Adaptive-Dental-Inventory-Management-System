const express = require('express');
const { formatResponse } = require('../utils/helpers');
const router = express.Router();

// Basic inventory routes placeholder
router.get('/', (req, res) => {
    res.json(formatResponse([], 'Inventory list - Coming soon'));
});

module.exports = router;
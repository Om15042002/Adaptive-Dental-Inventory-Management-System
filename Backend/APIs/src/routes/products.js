const express = require('express');
const { formatResponse } = require('../utils/helpers');
const router = express.Router();

// Basic products routes placeholder
router.get('/', (req, res) => {
    res.json(formatResponse([], 'Products list - Coming soon'));
});

router.get('/:id', (req, res) => {
    res.json(formatResponse(null, 'Product details - Coming soon'));
});

router.post('/', (req, res) => {
    res.json(formatResponse(null, 'Create product - Coming soon'));
});

module.exports = router;
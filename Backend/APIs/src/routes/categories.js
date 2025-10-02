const express = require('express');
const { formatResponse } = require('../utils/helpers');
const router = express.Router();

// Basic categories routes placeholder
router.get('/', (req, res) => {
    res.json(formatResponse([], 'Categories - Coming soon'));
});

module.exports = router;
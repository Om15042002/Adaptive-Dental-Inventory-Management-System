const express = require('express');
const { formatResponse } = require('../utils/helpers');
const router = express.Router();

// Basic reports routes placeholder
router.get('/', (req, res) => {
    res.json(formatResponse([], 'Reports - Coming soon'));
});

module.exports = router;
const express = require('express');
const { formatResponse } = require('../utils/helpers');
const router = express.Router();

// Basic stock movements routes placeholder
router.get('/', (req, res) => {
    res.json(formatResponse([], 'Stock movements - Coming soon'));
});

module.exports = router;
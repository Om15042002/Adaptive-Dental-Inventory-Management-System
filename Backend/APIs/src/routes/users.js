const express = require('express');
const { formatResponse } = require('../utils/helpers');
const router = express.Router();

// Basic users routes placeholder
router.get('/', (req, res) => {
    res.json(formatResponse([], 'Users - Coming soon'));
});

module.exports = router;
/**
 * Format API response with consistent structure
 * @param {any} data - The response data
 * @param {string} message - Response message
 * @param {number} statusCode - HTTP status code
 * @param {any} meta - Additional metadata
 * @returns {object} Formatted response object
 */
const formatResponse = (data = null, message = 'Success', statusCode = 200, meta = null) => {
    return {
        success: statusCode >= 200 && statusCode < 300,
        statusCode,
        message,
        data,
        timestamp: new Date().toISOString(),
        ...(meta && { meta })
    };
};

/**
 * Handle async route errors
 * @param {Function} fn - Async route handler
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    formatResponse,
    asyncHandler
};
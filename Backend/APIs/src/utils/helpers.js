module.exports = {
    formatResponse: (data, message = 'Success', status = 200, errors = null) => {
        const response = {
            success: status < 400,
            status,
            message,
            timestamp: new Date().toISOString()
        };

        if (data !== null) {
            response.data = data;
        }

        if (errors) {
            response.errors = errors;
        }

        return response;
    },

    handleError: (error, res) => {
        console.error('API Error:', error);
        
        // Handle specific error types
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                status: 409,
                message: 'Duplicate entry. Record already exists.',
                timestamp: new Date().toISOString()
            });
        }

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                success: false,
                status: 400,
                message: 'Invalid reference. Related record not found.',
                timestamp: new Date().toISOString()
            });
        }

        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                success: false,
                status: 409,
                message: 'Cannot delete record. It is referenced by other records.',
                timestamp: new Date().toISOString()
            });
        }

        // Default error response
        const status = error.status || error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        
        res.status(status).json({
            success: false,
            status,
            message,
            timestamp: new Date().toISOString(),
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    },

    validateId: (id) => {
        const isValid = !isNaN(id) && parseInt(id) > 0;
        return {
            success: isValid,
            valid: isValid,
            message: isValid ? 'Valid ID' : 'Invalid ID. Must be a positive number'
        };
    },

    validateDateRange: (dateFrom, dateTo) => {
        if (!dateFrom || !dateTo) {
            return { valid: false, message: 'Both date_from and date_to are required' };
        }

        const from = new Date(dateFrom);
        const to = new Date(dateTo);

        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
            return { valid: false, message: 'Invalid date format. Use YYYY-MM-DD' };
        }

        if (from > to) {
            return { valid: false, message: 'date_from cannot be later than date_to' };
        }

        return { valid: true };
    },

    sanitizeInput: (input) => {
        if (typeof input !== 'string') return input;
        return input.trim().replace(/[<>]/g, '');
    },

    generateRandomString: (length = 32) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    calculateStockStatus: (currentStock, minStock, maxStock) => {
        if (currentStock === 0) return 'out_of_stock';
        if (currentStock <= minStock) return 'low_stock';
        if (currentStock >= maxStock) return 'overstock';
        return 'normal';
    },

    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    calculateReorderSuggestion: (currentStock, minStock, maxStock, averageUsage = null) => {
        if (currentStock > minStock) return 0;
        
        let suggestedQuantity = maxStock - currentStock;
        
        // If we have usage data, suggest based on that
        if (averageUsage && averageUsage > 0) {
            // Suggest enough for 30 days of average usage
            const suggestedForUsage = Math.ceil(averageUsage * 30);
            suggestedQuantity = Math.max(suggestedQuantity, suggestedForUsage);
        }
        
        return Math.max(suggestedQuantity, 0);
    },

    validateReorderFrequency: (frequency) => {
        const validFrequencies = ['Weekly', 'Monthly', 'Quarterly', 'One-Time'];
        return validFrequencies.includes(frequency);
    },

    calculateDaysBetweenDates: (date1, date2) => {
        const diffTime = Math.abs(new Date(date2) - new Date(date1));
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    paginate: (page = 1, limit = 50) => {
        const parsedPage = Math.max(1, parseInt(page));
        const parsedLimit = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 items per page
        const offset = (parsedPage - 1) * parsedLimit;
        
        return {
            limit: parsedLimit,
            offset,
            page: parsedPage
        };
    },

    buildWhereClause: (filters, allowedFilters) => {
        const whereConditions = [];
        const params = [];

        for (const [key, value] of Object.entries(filters)) {
            if (allowedFilters.includes(key) && value !== undefined && value !== null && value !== '') {
                if (key.includes('_like')) {
                    whereConditions.push(`${key.replace('_like', '')} LIKE ?`);
                    params.push(`%${value}%`);
                } else if (key.includes('_gte')) {
                    whereConditions.push(`${key.replace('_gte', '')} >= ?`);
                    params.push(value);
                } else if (key.includes('_lte')) {
                    whereConditions.push(`${key.replace('_lte', '')} <= ?`);
                    params.push(value);
                } else {
                    whereConditions.push(`${key} = ?`);
                    params.push(value);
                }
            }
        }

        return {
            whereClause: whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '',
            params
        };
    }
};
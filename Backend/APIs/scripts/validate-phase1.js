#!/usr/bin/env node

/**
 * Phase 1 Compliance Validation Script
 * Validates that the API is fully compliant with Phase 1 requirements
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function validateDatabaseSchema() {
    log('\n🔍 Validating Database Schema...', 'blue');
    
    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'dental_inventory'
    };

    let connection;
    
    try {
        connection = await mysql.createConnection(dbConfig);
        
        // Check required tables exist
        const tables = ['categories', 'suppliers', 'products', 'inventory', 'stock_movements', 'users'];
        const [rows] = await connection.execute('SHOW TABLES');
        const existingTables = rows.map(row => Object.values(row)[0]);
        
        for (const table of tables) {
            if (existingTables.includes(table)) {
                log(`  ✅ Table ${table} exists`, 'green');
            } else {
                log(`  ❌ Table ${table} missing`, 'red');
                return false;
            }
        }

        // Validate Products table schema
        const [productCols] = await connection.execute('DESCRIBE products');
        const productFields = productCols.map(col => col.Field);
        const requiredProductFields = ['id', 'name', 'category_id', 'supplier_id', 'unit_cost', 'reorder_frequency', 'created_at'];
        
        for (const field of requiredProductFields) {
            if (productFields.includes(field)) {
                log(`  ✅ Products.${field} exists`, 'green');
            } else {
                log(`  ❌ Products.${field} missing`, 'red');
                return false;
            }
        }

        // Check reorder_frequency enum values
        const frequencyCol = productCols.find(col => col.Field === 'reorder_frequency');
        if (frequencyCol && frequencyCol.Type.includes("'Weekly','Monthly','Quarterly','One-Time'")) {
            log(`  ✅ reorder_frequency enum values correct`, 'green');
        } else {
            log(`  ❌ reorder_frequency enum values incorrect`, 'red');
            return false;
        }

        // Validate Inventory table schema
        const [inventoryCols] = await connection.execute('DESCRIBE inventory');
        const inventoryFields = inventoryCols.map(col => col.Field);
        const requiredInventoryFields = ['id', 'product_id', 'current_stock', 'min_stock', 'max_stock', 'last_updated'];
        
        for (const field of requiredInventoryFields) {
            if (inventoryFields.includes(field)) {
                log(`  ✅ Inventory.${field} exists`, 'green');
            } else {
                log(`  ❌ Inventory.${field} missing`, 'red');
                return false;
            }
        }

        // Validate StockMovements table schema
        const [movementCols] = await connection.execute('DESCRIBE stock_movements');
        const movementFields = movementCols.map(col => col.Field);
        const requiredMovementFields = ['id', 'product_id', 'quantity', 'movement_type', 'created_at'];
        
        for (const field of requiredMovementFields) {
            if (movementFields.includes(field)) {
                log(`  ✅ StockMovements.${field} exists`, 'green');
            } else {
                log(`  ❌ StockMovements.${field} missing`, 'red');
                return false;
            }
        }

        // Check movement_type enum values
        const movementTypeCol = movementCols.find(col => col.Field === 'movement_type');
        if (movementTypeCol && movementTypeCol.Type.includes("'IN','OUT'")) {
            log(`  ✅ movement_type enum values correct`, 'green');
        } else {
            log(`  ❌ movement_type enum values incorrect`, 'red');
            return false;
        }

        // Validate no created_by field exists (removed for compliance)
        if (!movementFields.includes('created_by')) {
            log(`  ✅ created_by field correctly removed from stock_movements`, 'green');
        } else {
            log(`  ❌ created_by field still exists in stock_movements`, 'red');
            return false;
        }

        log('✅ Database schema validation passed!', 'green');
        return true;

    } catch (error) {
        log(`❌ Database connection error: ${error.message}`, 'red');
        return false;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function validateFileStructure() {
    log('\n📁 Validating File Structure...', 'blue');
    
    const requiredFiles = [
        'src/app.js',
        'src/config/database.js',
        'src/models/Product.js',
        'src/models/Inventory.js',
        'src/models/StockMovement.js',
        'src/models/Category.js',
        'src/models/Supplier.js',
        'src/models/User.js',
        'src/controllers/productController.js',
        'src/controllers/inventoryController.js',
        'src/controllers/stockMovementController.js',
        'src/controllers/authController.js',
        'src/routes/products.js',
        'src/routes/inventory.js',
        'src/routes/stockMovements.js',
        'src/routes/auth.js',
        'src/middleware/auth.js',
        'src/middleware/validation.js',
        'package.json'
    ];

    let allFilesExist = true;

    for (const file of requiredFiles) {
        try {
            await fs.access(file);
            log(`  ✅ ${file} exists`, 'green');
        } catch {
            log(`  ❌ ${file} missing`, 'red');
            allFilesExist = false;
        }
    }

    return allFilesExist;
}

async function validateEndpoints() {
    log('\n🔗 Validating API Endpoints...', 'blue');
    
    // Check if required endpoints are defined in route files
    const routeChecks = [
        { file: 'src/routes/products.js', endpoint: '/frequency/:frequency' },
        { file: 'src/routes/inventory.js', endpoint: '/by-frequency/:frequency' },
        { file: 'src/routes/inventory.js', endpoint: '/low-stock' },
        { file: 'src/routes/stockMovements.js', endpoint: '/' }
    ];

    let allEndpointsExist = true;

    for (const check of routeChecks) {
        try {
            const content = await fs.readFile(check.file, 'utf8');
            if (content.includes(check.endpoint)) {
                log(`  ✅ ${check.endpoint} endpoint exists in ${check.file}`, 'green');
            } else {
                log(`  ❌ ${check.endpoint} endpoint missing in ${check.file}`, 'red');
                allEndpointsExist = false;
            }
        } catch (error) {
            log(`  ❌ Cannot read ${check.file}`, 'red');
            allEndpointsExist = false;
        }
    }

    return allEndpointsExist;
}

async function validateModels() {
    log('\n🏗️ Validating Model Compliance...', 'blue');
    
    // Check StockMovement model doesn't reference created_by
    try {
        const stockMovementContent = await fs.readFile('src/models/StockMovement.js', 'utf8');
        if (!stockMovementContent.includes('created_by')) {
            log('  ✅ StockMovement model correctly excludes created_by', 'green');
        } else {
            log('  ❌ StockMovement model still references created_by', 'red');
            return false;
        }
    } catch (error) {
        log('  ❌ Cannot read StockMovement model', 'red');
        return false;
    }

    // Check StockMovement controller doesn't use created_by
    try {
        const controllerContent = await fs.readFile('src/controllers/stockMovementController.js', 'utf8');
        if (!controllerContent.includes('created_by')) {
            log('  ✅ StockMovement controller correctly excludes created_by', 'green');
        } else {
            log('  ❌ StockMovement controller still references created_by', 'red');
            return false;
        }
    } catch (error) {
        log('  ❌ Cannot read StockMovement controller', 'red');
        return false;
    }

    return true;
}

async function main() {
    log('🚀 Phase 1 Compliance Validation', 'blue');
    log('=====================================', 'blue');

    const checks = [
        { name: 'File Structure', fn: validateFileStructure },
        { name: 'API Endpoints', fn: validateEndpoints },
        { name: 'Model Compliance', fn: validateModels },
        { name: 'Database Schema', fn: validateDatabaseSchema }
    ];

    let allPassed = true;

    for (const check of checks) {
        const result = await check.fn();
        if (!result) {
            allPassed = false;
        }
    }

    log('\n' + '='.repeat(50), 'blue');
    
    if (allPassed) {
        log('🎉 ALL PHASE 1 COMPLIANCE CHECKS PASSED!', 'green');
        log('✅ Your API is fully compliant with Phase 1 requirements', 'green');
        log('\nNext steps:', 'blue');
        log('1. Run: npm start (to start the server)', 'yellow');
        log('2. Run: npm test (to run the test suite)', 'yellow');
        log('3. Test endpoints using the provided SQL data', 'yellow');
    } else {
        log('❌ COMPLIANCE VALIDATION FAILED', 'red');
        log('Please fix the issues above and run validation again', 'yellow');
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(error => {
        log(`Fatal error: ${error.message}`, 'red');
        process.exit(1);
    });
}

module.exports = { validateDatabaseSchema, validateFileStructure, validateEndpoints, validateModels };
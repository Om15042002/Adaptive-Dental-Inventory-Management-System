const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool for better performance
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'om@123',
    database: process.env.DB_NAME || 'testDB',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
});

// Test the connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to MySQL database successfully');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

// Initialize connection test
testConnection();

module.exports = pool;
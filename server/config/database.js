const mysql = require('mysql2/promise');
require('dotenv').config();

// Build pool config
const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'online_quiz_portal',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

// Enable SSL for cloud databases (Aiven, etc.)
if (process.env.DB_SSL === 'true') {
    poolConfig.ssl = { rejectUnauthorized: false };
}

// Create connection pool for better performance
const pool = mysql.createPool(poolConfig);

// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MySQL Database connected successfully!');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

// Execute query helper (for prepared statements)
const query = async (sql, params) => {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
};

// Execute bulk query helper (for non-prepared statements, like bulk inserts)
const bulkQuery = async (sql, params) => {
    try {
        const [results] = await pool.query(sql, params);
        return results;
    } catch (error) {
        console.error('Bulk query error:', error);
        throw error;
    }
};

module.exports = { pool, testConnection, query, bulkQuery };

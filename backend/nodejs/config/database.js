import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// MySQL 連線池
export const mysqlPool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    database: process.env.MYSQL_DATABASE || 'leaderboard_db',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// MySQL 連線測試
export async function testMySQLConnection() {
    try {
        const connection = await mysqlPool.getConnection();
        console.log('✅ MySQL connected');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ MySQL connection error:', error.message);
        return false;
    }
}

// 關閉所有連線
export async function closeConnections() {
    await mysqlPool.end();
    console.log('🔌 Database connection closed');
}

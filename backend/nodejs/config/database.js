import mysql from 'mysql2/promise';
import Redis from 'ioredis';
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

// Redis 客戶端
export const redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: parseInt(process.env.REDIS_DB) || 0,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3
});

// Redis 連線事件
redisClient.on('connect', () => {
    console.log('✅ Redis connected');
});

redisClient.on('error', (err) => {
    console.error('❌ Redis connection error:', err.message);
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
    redisClient.disconnect();
    console.log('🔌 All database connections closed');
}

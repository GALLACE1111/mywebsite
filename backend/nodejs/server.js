import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { testMySQLConnection, closeConnections } from './config/database.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import leaderboardService from './services/leaderboard.service.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===================================
// 中介軟體
// ===================================

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 請求日誌
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// ===================================
// 路由
// ===================================

app.get('/', (req, res) => {
    res.json({
        message: 'Leaderboard API Server',
        version: '1.0.0',
        endpoints: {
            leaderboard: 'GET /api/leaderboard',
            myRank: 'GET /api/leaderboard/my-rank/:userId',
            around: 'GET /api/leaderboard/around/:userId',
            rebuild: 'POST /api/leaderboard/rebuild'
        }
    });
});

app.get('/health', async (req, res) => {
    const mysqlOk = await testMySQLConnection();
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            mysql: mysqlOk ? 'connected' : 'disconnected',
            redis: 'connected'
        }
    });
});

app.use('/api/leaderboard', leaderboardRoutes);

// 404 處理
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not found'
    });
});

// 錯誤處理
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// ===================================
// 定時任務
// ===================================

// 每天凌晨 1 點重建排行榜
cron.schedule('0 1 * * *', async () => {
    console.log('🔄 Running scheduled leaderboard rebuild...');
    try {
        await leaderboardService.rebuildLeaderboard('all', 'default');
        await leaderboardService.rebuildLeaderboard('daily', 'default');
        await leaderboardService.rebuildLeaderboard('weekly', 'default');
        await leaderboardService.rebuildLeaderboard('monthly', 'default');
        console.log('✅ Scheduled rebuild completed');
    } catch (error) {
        console.error('❌ Scheduled rebuild failed:', error);
    }
});

// ===================================
// 啟動伺服器
// ===================================

const server = app.listen(PORT, async () => {
    console.log('\n🚀 Leaderboard API Server');
    console.log(`📡 Listening on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Base URL: http://localhost:${PORT}`);

    // 測試資料庫連線
    const mysqlOk = await testMySQLConnection();
    if (!mysqlOk) {
        console.warn('⚠️ MySQL connection failed, some features may not work');
    }

    console.log('\n📋 Available endpoints:');
    console.log(`   GET  http://localhost:${PORT}/api/leaderboard`);
    console.log(`   GET  http://localhost:${PORT}/api/leaderboard/my-rank/:userId`);
    console.log(`   GET  http://localhost:${PORT}/api/leaderboard/around/:userId`);
    console.log(`   POST http://localhost:${PORT}/api/leaderboard/rebuild`);
    console.log('\n');
});

// 優雅關閉
process.on('SIGTERM', async () => {
    console.log('\n🛑 SIGTERM received, shutting down gracefully...');
    server.close(async () => {
        await closeConnections();
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('\n🛑 SIGINT received, shutting down gracefully...');
    server.close(async () => {
        await closeConnections();
        process.exit(0);
    });
});

export default app;

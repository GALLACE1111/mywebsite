import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import { initializeFirebase, testFirebaseConnection, closeConnections } from './config/firebase.js';
import { initializeCache } from './utils/cache.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import monitoringRoutes from './routes/monitoring.routes.js';
import adminRoutes from './routes/admin.routes.js';
import wishesRoutes from './routes/wishes.routes.js';
import feedbackRoutes from './routes/feedback.routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ===== 安全中間件 =====
// Helmet: 設置安全 HTTP 標頭
app.use(helmet({
    contentSecurityPolicy: false, // 暫時禁用 CSP，避免影響前端
    crossOriginEmbedderPolicy: false
}));

// Compression: 響應壓縮（減少 70% 流量）
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6 // 壓縮級別 0-9
}));

// CORS 配置
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body 解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 通用速率限制：每分鐘 60 次
app.use('/api', apiLimiter);

// 提供前端靜態文件
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    });
    next();
});

// API 資訊路由
app.get('/api', (req, res) => {
    res.json({
        message: 'Heart Game API Server - Full Featured',
        version: '3.0.0',
        features: ['Redis Cache', 'Monitoring Dashboard', 'Admin Panel', 'Wishing Well', 'Feedback System'],
        endpoints: {
            leaderboard: {
                list: 'GET /api/leaderboard',
                myRank: 'GET /api/leaderboard/my-rank/:userId',
                around: 'GET /api/leaderboard/around/:userId',
                submit: 'POST /api/leaderboard/submit'
            },
            wishes: {
                list: 'GET /api/wishes',
                create: 'POST /api/wishes',
                like: 'POST /api/wishes/:wishId/like',
                myWishes: 'GET /api/wishes/my/:playerId',
                delete: 'DELETE /api/wishes/:wishId'
            },
            feedback: {
                submit: 'POST /api/feedback',
                myFeedback: 'GET /api/feedback/my/:playerId',
                list: 'GET /api/feedback (admin)',
                updateStatus: 'PUT /api/feedback/:feedbackId/status (admin)',
                stats: 'GET /api/feedback/stats (admin)'
            },
            monitoring: {
                stats: 'GET /api/monitoring/stats',
                firestore: 'GET /api/monitoring/firestore',
                cache: 'GET /api/monitoring/cache',
                quota: 'GET /api/monitoring/quota',
                estimation: 'GET /api/monitoring/estimation'
            },
            admin: {
                players: 'GET /api/admin/players',
                deletePlayer: 'DELETE /api/admin/players/:userId',
                resetScore: 'POST /api/admin/players/:userId/reset',
                clearAll: 'DELETE /api/admin/leaderboard'
            }
        }
    });
});

// 優化：健康檢查不查詢 Firestore，減少配額消耗
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'leaderboard-api',
        uptime: process.uptime()
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'leaderboard-api',
        uptime: process.uptime()
    });
});

// ===== 路由註冊 =====
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishes', wishesRoutes);
app.use('/api/feedback', feedbackRoutes);

// ===== 錯誤處理 =====
// 404 處理（必須在所有路由之後）
app.use(notFoundHandler);

// 統一錯誤處理（必須在最後）
app.use(errorHandler);

const server = app.listen(PORT, async () => {
    console.log('\n🚀 Heart Game API Server v3.1 - Enterprise Edition');
    console.log(`📡 Listening on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Base URL: http://localhost:${PORT}`);
    console.log('');
    console.log('✅ Security Enhancements:');
    console.log('   ✓ Helmet - Security Headers');
    console.log('   ✓ Compression - Response Optimization');
    console.log('   ✓ Rate Limiting - API Protection');
    console.log('   ✓ Error Handling - Unified Responses');
    console.log('   ✓ Request Validation - Input Sanitization');
    console.log('');

    // 初始化 Cache（Redis 或 Memory）
    await initializeCache();

    // 初始化 Firebase
    const firebaseOk = initializeFirebase();
    if (!firebaseOk) {
        console.warn('⚠️ Firebase initialization failed');
        console.warn('   Please check your .env file and Firebase credentials');
    } else {
        await testFirebaseConnection();
    }

    console.log('\n📋 Available endpoints:');
    console.log('   Leaderboard:');
    console.log(`      GET  http://localhost:${PORT}/api/leaderboard`);
    console.log(`      GET  http://localhost:${PORT}/api/leaderboard/my-rank/:userId`);
    console.log(`      POST http://localhost:${PORT}/api/leaderboard/submit`);
    console.log('   Monitoring:');
    console.log(`      GET  http://localhost:${PORT}/api/monitoring/stats`);
    console.log(`      GET  http://localhost:${PORT}/api/monitoring/quota`);
    console.log('   Admin:');
    console.log(`      GET  http://localhost:${PORT}/api/admin/players`);
    console.log('\n');
});

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

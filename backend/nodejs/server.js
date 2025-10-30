import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeFirebase, testFirebaseConnection, closeConnections } from './config/firebase.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
        message: 'Simplified Leaderboard API Server',
        version: '1.0.0',
        endpoints: {
            leaderboard: 'GET /api/leaderboard',
            myRank: 'GET /api/leaderboard/my-rank/:userId',
            around: 'GET /api/leaderboard/around/:userId',
            submitScore: 'POST /api/leaderboard/submit'
        }
    });
});

// 優化：健康檢查不查詢 Firestore，減少配額消耗
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'leaderboard-api',
        uptime: process.uptime()
    });
});

app.use('/api/leaderboard', leaderboardRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not found'
    });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

const server = app.listen(PORT, async () => {
    console.log('\n🚀 Simplified Leaderboard API Server');
    console.log(`📡 Listening on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Base URL: http://localhost:${PORT}`);

    const firebaseOk = initializeFirebase();
    if (!firebaseOk) {
        console.warn('⚠️ Firebase initialization failed');
        console.warn('   Please check your .env file and Firebase credentials');
    } else {
        await testFirebaseConnection();
    }

    console.log('\n📋 Available endpoints:');
    console.log(`   GET  http://localhost:${PORT}/api/leaderboard`);
    console.log(`   GET  http://localhost:${PORT}/api/leaderboard/my-rank/:userId`);
    console.log(`   GET  http://localhost:${PORT}/api/leaderboard/around/:userId`);
    console.log(`   POST http://localhost:${PORT}/api/leaderboard/submit`);
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

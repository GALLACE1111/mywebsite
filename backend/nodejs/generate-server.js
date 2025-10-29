import fs from 'fs';

const content = `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testMySQLConnection, closeConnections } from './config/database.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(\`\${req.method} \${req.path} - \${res.statusCode} (\${duration}ms)\`);
    });
    next();
});

app.get('/', (req, res) => {
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

app.get('/health', async (req, res) => {
    const mysqlOk = await testMySQLConnection();
    res.json({
        status: mysqlOk ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        services: {
            mysql: mysqlOk ? 'connected' : 'disconnected'
        }
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
    console.log('\\n🚀 Simplified Leaderboard API Server');
    console.log(\`📡 Listening on port \${PORT}\`);
    console.log(\`🌍 Environment: \${process.env.NODE_ENV || 'development'}\`);
    console.log(\`🔗 Base URL: http://localhost:\${PORT}\`);

    const mysqlOk = await testMySQLConnection();
    if (!mysqlOk) {
        console.warn('⚠️ MySQL connection failed');
        console.warn('   Please check your .env file and MySQL server');
    }

    console.log('\\n📋 Available endpoints:');
    console.log(\`   GET  http://localhost:\${PORT}/api/leaderboard\`);
    console.log(\`   GET  http://localhost:\${PORT}/api/leaderboard/my-rank/:userId\`);
    console.log(\`   GET  http://localhost:\${PORT}/api/leaderboard/around/:userId\`);
    console.log(\`   POST http://localhost:\${PORT}/api/leaderboard/submit\`);
    console.log('\\n');
});

process.on('SIGTERM', async () => {
    console.log('\\n🛑 SIGTERM received, shutting down gracefully...');
    server.close(async () => {
        await closeConnections();
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('\\n🛑 SIGINT received, shutting down gracefully...');
    server.close(async () => {
        await closeConnections();
        process.exit(0);
    });
});

export default app;
`;

fs.writeFileSync('server.js', content, 'utf8');
console.log('✅ server.js created successfully!');

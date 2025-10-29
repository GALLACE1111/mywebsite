import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { createRequire } from 'module';

dotenv.config();

let db = null;

export function initializeFirebase() {
    try {
        // 检查是否已初始化
        if (admin.apps.length > 0) {
            console.log('✅ Firebase already initialized');
            db = admin.firestore();
            return true;
        }

        // 方式 1: 使用服务账号 JSON 文件
        if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
            // 使用 createRequire 来加载 JSON
            const require = createRequire(import.meta.url);
            const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        }
        // 方式 2: 使用环境变量中的凭证
        else if (process.env.FIREBASE_PROJECT_ID) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
                })
            });
        }
        // 方式 3: 在 Google Cloud 环境中使用默认凭证
        else {
            admin.initializeApp();
        }

        db = admin.firestore();

        // 设置 Firestore 配置
        db.settings({
            ignoreUndefinedProperties: true
        });

        console.log('✅ Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Firebase initialization error:', error.message);
        return false;
    }
}

export function getFirestore() {
    if (!db) {
        initializeFirebase();
    }
    return db;
}

export async function testFirebaseConnection() {
    try {
        const db = getFirestore();
        // 尝试读取一个测试集合
        await db.collection('_test').limit(1).get();
        console.log('✅ Firebase connected');
        return true;
    } catch (error) {
        console.error('❌ Firebase connection error:', error.message);
        return false;
    }
}

export async function closeConnections() {
    try {
        await admin.app().delete();
        console.log('🔌 Firebase connection closed');
    } catch (error) {
        // 忽略关闭错误
    }
}

export { admin };

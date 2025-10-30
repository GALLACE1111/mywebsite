import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

dotenv.config();

// ============ 數據庫配置說明 ============
// 數據庫類型: Firebase Firestore (NoSQL 文檔型數據庫)
// ⚠️ 重要: 這不是 MySQL 或其他關聯式數據庫！
//
// Firestore 特性:
// - NoSQL 文檔數據庫 (Document-based)
// - 即時同步
// - 無需設計表結構 (Schema-less)
// - 使用集合(Collection)和文檔(Document)
//
// 免費版限制:
// - 每日讀取: 50,000 次
// - 每日寫入: 20,000 次
// - 儲存空間: 1 GB
// - 玩家上限: 100人 (專案設定)

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
            // 使用 fs.readFileSync 读取 JSON 文件（支持绝对路径和相对路径）
            let serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

            // 如果是相对路径，转换为绝对路径
            if (!serviceAccountPath.startsWith('/') && !serviceAccountPath.match(/^[A-Z]:/i)) {
                const __filename = fileURLToPath(import.meta.url);
                const __dirname = dirname(__filename);
                serviceAccountPath = resolve(__dirname, serviceAccountPath);
            }

            const serviceAccountContent = readFileSync(serviceAccountPath, 'utf8');
            const serviceAccount = JSON.parse(serviceAccountContent);

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: `${serviceAccount.project_id}.appspot.com`
            });
        }
        // 方式 2: 使用环境变量中的凭证
        else if (process.env.FIREBASE_PROJECT_ID) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
                }),
                storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
            });
        }
        // 方式 3: 在 Google Cloud 环境中使用默认凭证
        else {
            admin.initializeApp({
                storageBucket: 'side-project-663de.appspot.com'
            });
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
        // 尝试列出集合（更可靠的测试方法）
        // 如果 Firebase 连接正常，这个操作应该成功
        const collections = await db.listCollections();
        console.log(`✅ Firebase connected - Found ${collections.length} collections`);
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

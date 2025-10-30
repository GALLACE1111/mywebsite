import { initializeFirebase, getFirestore, admin } from '../config/firebase.js';

// 測試資料：11筆用戶和分數
const testData = [
    { userId: 'user001', username: '小明', totalScore: 450 },
    { userId: 'user002', username: '小華', totalScore: 380 },
    { userId: 'user003', username: '阿賢', totalScore: 350 },
    { userId: 'user004', username: '美美', totalScore: 320 },
    { userId: 'user005', username: '小傑', totalScore: 290 },
    { userId: 'user006', username: '小花', totalScore: 260 },
    { userId: 'user007', username: '阿德', totalScore: 230 },
    { userId: 'user008', username: '小莉', totalScore: 200 },
    { userId: 'user009', username: '阿強', totalScore: 170 },
    { userId: 'user010', username: '小婷', totalScore: 140 },
    { userId: 'user011', username: '阿凱', totalScore: 100 }
];

async function insertTestData() {
    try {
        console.log('🚀 開始插入測試資料...\n');

        // 初始化 Firebase
        const initialized = initializeFirebase();
        if (!initialized) {
            throw new Error('Firebase 初始化失敗');
        }

        const db = getFirestore();
        const batch = db.batch();
        let count = 0;

        for (const data of testData) {
            // 1. 創建用戶
            const userRef = db.collection('users').doc(data.userId);
            batch.set(userRef, {
                username: data.username,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // 2. 創建用戶總分記錄
            const userTotalRef = db.collection('userTotals').doc(data.userId);
            batch.set(userTotalRef, {
                userId: data.userId,
                username: data.username,
                totalScore: data.totalScore,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            });

            // 3. 創建初始分數記錄
            const scoreRef = db.collection('scores').doc();
            batch.set(scoreRef, {
                userId: data.userId,
                score: data.totalScore,
                gameType: 'initial',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            count++;
            console.log(`✅ 準備插入: ${data.username} - ${data.totalScore} 分`);
        }

        // 執行批次寫入
        await batch.commit();
        console.log(`\n🎉 成功插入 ${count} 筆測試資料！\n`);

        // 顯示排行榜預覽
        console.log('📊 排行榜預覽：');
        console.log('─'.repeat(50));
        const snapshot = await db.collection('userTotals')
            .orderBy('totalScore', 'desc')
            .limit(11)
            .get();

        let rank = 1;
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`${rank}. ${data.username.padEnd(10)} ${data.totalScore} 分`);
            rank++;
        });
        console.log('─'.repeat(50));

        process.exit(0);
    } catch (error) {
        console.error('❌ 插入資料時發生錯誤:', error);
        process.exit(1);
    }
}

// 執行插入
insertTestData();

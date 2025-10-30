import { initializeFirebase, getFirestore, admin } from '../config/firebase.js';

/**
 * 初始化 Firestore 資料庫
 * 創建 leaderboard 集合並添加示例數據
 */
async function initFirestore() {
    console.log('🚀 開始初始化 Firestore 資料庫...\n');

    try {
        // 初始化 Firebase
        const success = initializeFirebase();
        if (!success) {
            console.error('❌ Firebase 初始化失敗');
            process.exit(1);
        }

        const db = getFirestore();
        console.log('✅ Firebase 連接成功\n');

        // 創建示例數據（使用API期望的格式）
        const sampleData = [
            {
                user_id: 'demo_user_001',
                username: '測試玩家1',
                totalScore: 1500,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                user_id: 'demo_user_002',
                username: '測試玩家2',
                totalScore: 1200,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                user_id: 'demo_user_003',
                username: '測試玩家3',
                totalScore: 1000,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                user_id: 'demo_user_004',
                username: '測試玩家4',
                totalScore: 800,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                user_id: 'demo_user_005',
                username: '測試玩家5',
                totalScore: 500,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            }
        ];

        console.log('📝 開始創建 userTotals 集合並添加示例數據...\n');

        // 使用批次寫入來提高效率
        const batch = db.batch();

        for (const data of sampleData) {
            const docRef = db.collection('userTotals').doc(data.user_id);
            const { user_id, ...dataWithoutUserId } = data;
            batch.set(docRef, dataWithoutUserId);
            console.log(`   ➕ 添加用戶: ${data.username} (分數: ${data.totalScore})`);
        }

        await batch.commit();
        console.log('\n✅ 批次寫入完成！');

        // 等待一下讓時間戳生成
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 驗證數據
        console.log('\n🔍 驗證數據...');
        const snapshot = await db.collection('userTotals')
            .where('totalScore', '>', 0)
            .orderBy('totalScore', 'desc')
            .limit(10)
            .get();

        console.log(`\n📊 排行榜前 ${snapshot.size} 名：`);
        console.log('═'.repeat(50));

        let rank = 1;
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`   ${rank}. ${data.username} - ${data.totalScore} 分`);
            rank++;
        });

        console.log('═'.repeat(50));
        console.log('\n✅ Firestore 初始化完成！');
        console.log('\n💡 提示：');
        console.log('   - 您可以在 Firebase Console 查看數據');
        console.log('   - 訪問: https://console.firebase.google.com/');
        console.log('   - 選擇專案: side-project-663de');
        console.log('   - 點擊左側選單 "Firestore Database"\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ 初始化失敗:', error.message);
        console.error('\n詳細錯誤:', error);

        if (error.code === 7) {
            console.error('\n⚠️ 錯誤原因：權限不足');
            console.error('   請確認：');
            console.error('   1. Firebase 專案已啟用 Firestore');
            console.error('   2. Service Account 有足夠的權限');
            console.error('   3. 訪問 https://console.firebase.google.com/ 檢查設置');
        }

        process.exit(1);
    }
}

// 執行初始化
initFirestore();

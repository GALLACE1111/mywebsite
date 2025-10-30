import { initializeFirebase, getFirestore } from '../config/firebase.js';

/**
 * 查看 Firestore 中的所有玩家資料
 */
async function viewPlayers() {
    console.log('🔍 正在查詢 Firestore 玩家資料...\n');

    try {
        // 初始化 Firebase
        const success = initializeFirebase();
        if (!success) {
            console.error('❌ Firebase 初始化失敗');
            process.exit(1);
        }

        const db = getFirestore();
        console.log('✅ Firebase 連接成功\n');

        // 查詢所有玩家，按分數降序排列
        const snapshot = await db.collection('userTotals')
            .orderBy('totalScore', 'desc')
            .get();

        if (snapshot.empty) {
            console.log('⚠️  目前沒有玩家資料');
            console.log('\n💡 提示：執行以下指令來初始化測試資料：');
            console.log('   cd D:\\網頁\\website\\backend\\nodejs');
            console.log('   node scripts/init-firestore.js\n');
            process.exit(0);
        }

        console.log(`📊 找到 ${snapshot.size} 位玩家\n`);
        console.log('═'.repeat(60));
        console.log('排名   玩家ID              玩家名稱         總分數    最後更新');
        console.log('═'.repeat(60));

        let rank = 1;
        snapshot.forEach(doc => {
            const data = doc.data();
            const userId = doc.id;
            const username = data.username || '未命名';
            const score = data.totalScore || 0;
            const lastUpdated = data.lastUpdated
                ? new Date(data.lastUpdated.toDate()).toLocaleString('zh-TW')
                : '無';

            console.log(
                `${rank.toString().padStart(2)}     ` +
                `${userId.padEnd(20)} ` +
                `${username.padEnd(12)} ` +
                `${score.toString().padStart(6)}    ` +
                `${lastUpdated}`
            );
            rank++;
        });

        console.log('═'.repeat(60));
        console.log(`\n✅ 共 ${snapshot.size} 位玩家`);
        console.log('\n💡 提示：');
        console.log('   - 在 Firebase Console 查看: https://console.firebase.google.com/project/side-project-663de/firestore');
        console.log('   - 集合名稱: userTotals\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ 查詢失敗:', error.message);
        console.error('\n詳細錯誤:', error);

        if (error.code === 9) {
            console.error('\n⚠️ 錯誤原因：找不到資料庫');
            console.error('   請先啟用 Firestore：');
            console.error('   1. 訪問 https://console.firebase.google.com/project/side-project-663de/firestore');
            console.error('   2. 點擊「建立資料庫」');
            console.error('   3. 選擇測試模式和 asia-east1 (台灣) 地區\n');
        }

        process.exit(1);
    }
}

// 執行查詢
viewPlayers();

import { initializeFirebase, getFirestore, admin } from '../config/firebase.js';

/**
 * 初始化 Metadata 文檔
 *
 * 用途：創建 metadata/stats 文檔來儲存統計數據
 * 優點：避免每次都查詢整個集合來計算總數
 *
 * Metadata 結構：
 * {
 *   totalUsers: number,           // 總用戶數（totalScore > 0）
 *   totalPlayers: number,         // 所有註冊用戶數
 *   lastUpdated: timestamp,       // 最後更新時間
 *   lastCalculated: timestamp     // 最後計算時間
 * }
 */
async function initMetadata() {
    console.log('🚀 開始初始化 Metadata 文檔...\n');

    try {
        // 初始化 Firebase
        const success = initializeFirebase();
        if (!success) {
            console.error('❌ Firebase 初始化失敗');
            process.exit(1);
        }

        const db = getFirestore();
        console.log('✅ Firebase 連接成功\n');

        // 計算當前的總用戶數
        console.log('📊 計算當前統計數據...');

        // 計算有分數的用戶數
        const userTotalsSnapshot = await db.collection('userTotals')
            .where('totalScore', '>', 0)
            .get();
        const totalUsers = userTotalsSnapshot.size;

        // 計算所有用戶數
        const allUsersSnapshot = await db.collection('users').get();
        const totalPlayers = allUsersSnapshot.size;

        console.log(`   📈 有分數的用戶數: ${totalUsers}`);
        console.log(`   👥 所有註冊用戶數: ${totalPlayers}\n`);

        // 創建或更新 metadata/stats 文檔
        const metadataRef = db.collection('metadata').doc('stats');

        const metadataData = {
            totalUsers: totalUsers,
            totalPlayers: totalPlayers,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            lastCalculated: admin.firestore.FieldValue.serverTimestamp(),
            version: '1.0.0',
            description: '排行榜統計數據 - 自動更新'
        };

        await metadataRef.set(metadataData, { merge: true });
        console.log('✅ Metadata 文檔創建成功！');

        // 驗證數據
        console.log('\n🔍 驗證 Metadata...');
        const metadataDoc = await metadataRef.get();

        if (metadataDoc.exists) {
            const data = metadataDoc.data();
            console.log('\n📋 Metadata 內容：');
            console.log('═'.repeat(50));
            console.log(`   有分數的用戶數: ${data.totalUsers}`);
            console.log(`   所有用戶數: ${data.totalPlayers}`);
            console.log(`   版本: ${data.version}`);
            console.log('═'.repeat(50));
        }

        console.log('\n✅ Metadata 初始化完成！');
        console.log('\n💡 提示：');
        console.log('   - Metadata 會在每次提交分數時自動更新');
        console.log('   - 快取時間為 30 秒，可減少 Firestore 讀取');
        console.log('   - 您可以在 Firebase Console 的 metadata/stats 查看數據\n');

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
initMetadata();

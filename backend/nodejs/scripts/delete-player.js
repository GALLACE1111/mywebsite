import { initializeFirebase, getFirestore, admin } from '../config/firebase.js';
import readline from 'readline';

/**
 * 刪除特定玩家的所有資料
 * 包含：users、userTotals、scores 集合
 */

// 創建命令列介面
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function deletePlayer(userId) {
    console.log(`\n🗑️  正在刪除玩家: ${userId}\n`);

    try {
        const db = getFirestore();

        // 1. 檢查玩家是否存在
        const userTotalDoc = await db.collection('userTotals').doc(userId).get();

        if (!userTotalDoc.exists) {
            console.log('❌ 找不到該玩家');
            return false;
        }

        const userData = userTotalDoc.data();
        console.log('📊 玩家資料:');
        console.log(`   名稱: ${userData.username}`);
        console.log(`   總分: ${userData.totalScore}`);
        console.log(`   最後更新: ${userData.lastUpdated ? new Date(userData.lastUpdated.toDate()).toLocaleString('zh-TW') : '無'}\n`);

        // 2. 二次確認
        const confirm = await askQuestion('❓ 確定要刪除此玩家嗎？此操作無法復原！(yes/no): ');
        if (confirm.toLowerCase() !== 'yes') {
            console.log('❌ 取消刪除');
            return false;
        }

        // 3. 使用批次操作刪除資料
        const batch = db.batch();

        // 3.1 刪除 userTotals
        const userTotalRef = db.collection('userTotals').doc(userId);
        batch.delete(userTotalRef);
        console.log('✓ 準備刪除 userTotals');

        // 3.2 刪除 users
        const userRef = db.collection('users').doc(userId);
        batch.delete(userRef);
        console.log('✓ 準備刪除 users');

        // 3.3 查找並刪除所有分數記錄
        const scoresSnapshot = await db.collection('scores')
            .where('userId', '==', userId)
            .get();

        scoresSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        console.log(`✓ 準備刪除 ${scoresSnapshot.size} 筆分數記錄`);

        // 4. 執行批次刪除
        await batch.commit();
        console.log('\n✅ 批次刪除完成');

        // 5. 更新 metadata
        const metadataRef = db.collection('metadata').doc('stats');
        await metadataRef.update({
            totalUsers: admin.firestore.FieldValue.increment(-1),
            totalPlayers: admin.firestore.FieldValue.increment(-1),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('✓ 已更新 metadata 統計');

        console.log(`\n🎉 玩家 ${userId} 已完全刪除！\n`);
        return true;

    } catch (error) {
        console.error('\n❌ 刪除失敗:', error.message);
        console.error('詳細錯誤:', error);
        return false;
    }
}

async function main() {
    console.log('🗑️  玩家刪除工具\n');
    console.log('═'.repeat(60));

    try {
        // 初始化 Firebase
        const success = initializeFirebase();
        if (!success) {
            console.error('❌ Firebase 初始化失敗');
            process.exit(1);
        }
        console.log('✅ Firebase 連接成功\n');

        // 獲取 userId
        const userId = await askQuestion('請輸入要刪除的玩家 ID: ');

        if (!userId || userId.trim() === '') {
            console.log('❌ 無效的玩家 ID');
            rl.close();
            process.exit(1);
        }

        // 執行刪除
        await deletePlayer(userId.trim());

        rl.close();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ 發生錯誤:', error.message);
        rl.close();
        process.exit(1);
    }
}

// 執行主程式
main();

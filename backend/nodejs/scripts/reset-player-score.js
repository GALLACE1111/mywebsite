import { initializeFirebase, getFirestore, admin } from '../config/firebase.js';
import readline from 'readline';

/**
 * 重置特定玩家的分數為 0
 * 保留玩家基本資料，但將 totalScore 設為 0
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

async function resetPlayerScore(userId) {
    console.log(`\n🔄 正在重置玩家分數: ${userId}\n`);

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
        console.log(`   當前總分: ${userData.totalScore}`);
        console.log(`   最後更新: ${userData.lastUpdated ? new Date(userData.lastUpdated.toDate()).toLocaleString('zh-TW') : '無'}\n`);

        // 2. 如果分數已經是 0，提示並跳過
        if (userData.totalScore === 0) {
            console.log('ℹ️  玩家分數已經是 0，無需重置');
            return true;
        }

        // 3. 二次確認
        const confirm = await askQuestion('❓ 確定要重置此玩家的分數為 0 嗎？(yes/no): ');
        if (confirm.toLowerCase() !== 'yes') {
            console.log('❌ 取消重置');
            return false;
        }

        // 4. 重置分數
        const userTotalRef = db.collection('userTotals').doc(userId);
        await userTotalRef.update({
            totalScore: 0,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('\n✅ 分數已重置為 0');
        console.log(`✓ 玩家 ${userData.username} 的分數已歸零\n`);

        // 5. 選項：是否刪除歷史分數記錄
        const deleteHistory = await askQuestion('❓ 是否同時刪除該玩家的所有歷史分數記錄？(yes/no): ');

        if (deleteHistory.toLowerCase() === 'yes') {
            const scoresSnapshot = await db.collection('scores')
                .where('userId', '==', userId)
                .get();

            if (scoresSnapshot.empty) {
                console.log('ℹ️  沒有找到歷史分數記錄');
            } else {
                const batch = db.batch();
                scoresSnapshot.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
                console.log(`✅ 已刪除 ${scoresSnapshot.size} 筆歷史分數記錄`);
            }
        }

        console.log(`\n🎉 玩家 ${userId} 的分數重置完成！\n`);
        return true;

    } catch (error) {
        console.error('\n❌ 重置失敗:', error.message);
        console.error('詳細錯誤:', error);
        return false;
    }
}

async function main() {
    console.log('🔄 玩家分數重置工具\n');
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
        const userId = await askQuestion('請輸入要重置分數的玩家 ID: ');

        if (!userId || userId.trim() === '') {
            console.log('❌ 無效的玩家 ID');
            rl.close();
            process.exit(1);
        }

        // 執行重置
        await resetPlayerScore(userId.trim());

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

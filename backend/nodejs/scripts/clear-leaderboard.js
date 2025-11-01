import { initializeFirebase, getFirestore, admin } from '../config/firebase.js';
import readline from 'readline';

/**
 * 清空整個排行榜
 * 刪除所有 users、userTotals、scores 資料，並重置 metadata
 * ⚠️ 危險操作！會刪除所有玩家資料！
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

async function clearLeaderboard() {
    console.log('\n⚠️  即將清空整個排行榜！\n');

    try {
        const db = getFirestore();

        // 1. 統計現有資料
        const [usersSnapshot, userTotalsSnapshot, scoresSnapshot] = await Promise.all([
            db.collection('users').get(),
            db.collection('userTotals').get(),
            db.collection('scores').get()
        ]);

        console.log('📊 當前資料統計:');
        console.log(`   users 集合: ${usersSnapshot.size} 筆`);
        console.log(`   userTotals 集合: ${userTotalsSnapshot.size} 筆`);
        console.log(`   scores 集合: ${scoresSnapshot.size} 筆`);
        console.log(`   總計: ${usersSnapshot.size + userTotalsSnapshot.size + scoresSnapshot.size} 筆資料\n`);

        if (usersSnapshot.empty && userTotalsSnapshot.empty && scoresSnapshot.empty) {
            console.log('ℹ️  排行榜已經是空的，無需清空');
            return true;
        }

        // 2. 多重確認機制
        console.log('⚠️⚠️⚠️  警告：此操作將刪除所有玩家資料且無法復原！⚠️⚠️⚠️\n');

        const confirm1 = await askQuestion('確認要清空排行榜嗎？(yes/no): ');
        if (confirm1.toLowerCase() !== 'yes') {
            console.log('❌ 取消清空');
            return false;
        }

        const confirm2 = await askQuestion('再次確認：真的要刪除所有資料嗎？請輸入 "DELETE ALL" 來確認: ');
        if (confirm2 !== 'DELETE ALL') {
            console.log('❌ 確認失敗，取消清空');
            return false;
        }

        // 3. 開始清空資料
        console.log('\n🗑️  開始清空排行榜...\n');

        // 3.1 刪除 userTotals
        if (!userTotalsSnapshot.empty) {
            console.log('⏳ 刪除 userTotals...');
            const batch1 = db.batch();
            userTotalsSnapshot.forEach(doc => {
                batch1.delete(doc.ref);
            });
            await batch1.commit();
            console.log(`✓ 已刪除 ${userTotalsSnapshot.size} 筆 userTotals`);
        }

        // 3.2 刪除 users
        if (!usersSnapshot.empty) {
            console.log('⏳ 刪除 users...');
            const batch2 = db.batch();
            usersSnapshot.forEach(doc => {
                batch2.delete(doc.ref);
            });
            await batch2.commit();
            console.log(`✓ 已刪除 ${usersSnapshot.size} 筆 users`);
        }

        // 3.3 刪除 scores (可能需要分批處理)
        if (!scoresSnapshot.empty) {
            console.log('⏳ 刪除 scores...');
            const batchSize = 500; // Firestore 批次限制
            let deletedCount = 0;

            for (let i = 0; i < scoresSnapshot.docs.length; i += batchSize) {
                const batch = db.batch();
                const batchDocs = scoresSnapshot.docs.slice(i, i + batchSize);

                batchDocs.forEach(doc => {
                    batch.delete(doc.ref);
                });

                await batch.commit();
                deletedCount += batchDocs.length;
                console.log(`  進度: ${deletedCount}/${scoresSnapshot.size}`);
            }
            console.log(`✓ 已刪除 ${scoresSnapshot.size} 筆 scores`);
        }

        // 4. 重置 metadata
        console.log('⏳ 重置 metadata...');
        const metadataRef = db.collection('metadata').doc('stats');
        await metadataRef.set({
            totalUsers: 0,
            totalPlayers: 0,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            lastCalculated: admin.firestore.FieldValue.serverTimestamp(),
            version: '1.0.0'
        });
        console.log('✓ 已重置 metadata');

        console.log('\n🎉 排行榜已完全清空！\n');
        console.log('═'.repeat(60));
        console.log('統計:');
        console.log(`  刪除的 users: ${usersSnapshot.size}`);
        console.log(`  刪除的 userTotals: ${userTotalsSnapshot.size}`);
        console.log(`  刪除的 scores: ${scoresSnapshot.size}`);
        console.log(`  總計刪除: ${usersSnapshot.size + userTotalsSnapshot.size + scoresSnapshot.size} 筆資料`);
        console.log('═'.repeat(60));
        console.log('\n💡 提示：現在可以重新初始化測試資料');
        console.log('   執行：node scripts/init-firestore.js\n');

        return true;

    } catch (error) {
        console.error('\n❌ 清空失敗:', error.message);
        console.error('詳細錯誤:', error);
        return false;
    }
}

async function main() {
    console.log('🗑️  排行榜清空工具\n');
    console.log('═'.repeat(60));

    try {
        // 初始化 Firebase
        const success = initializeFirebase();
        if (!success) {
            console.error('❌ Firebase 初始化失敗');
            process.exit(1);
        }
        console.log('✅ Firebase 連接成功\n');

        // 執行清空
        await clearLeaderboard();

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

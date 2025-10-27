#!/usr/bin/env node

/**
 * 重建排行榜腳本
 * 用於手動從 MySQL 重建 Redis 排行榜
 *
 * 使用方式：
 * node scripts/rebuild-leaderboard.js [period] [game_type]
 *
 * 範例：
 * node scripts/rebuild-leaderboard.js all default
 * node scripts/rebuild-leaderboard.js daily default
 */

import leaderboardService from '../services/leaderboard.service.js';
import { closeConnections } from '../config/database.js';

const validPeriods = ['daily', 'weekly', 'monthly', 'all'];

async function main() {
    const args = process.argv.slice(2);
    const period = args[0] || 'all';
    const gameType = args[1] || 'default';

    console.log('\n🔄 Leaderboard Rebuild Tool\n');
    console.log(`Period: ${period}`);
    console.log(`Game Type: ${gameType}\n`);

    if (!validPeriods.includes(period)) {
        console.error(`❌ Invalid period: ${period}`);
        console.log(`Valid periods: ${validPeriods.join(', ')}\n`);
        process.exit(1);
    }

    try {
        console.log('🔍 Fetching data from MySQL...');
        await leaderboardService.rebuildLeaderboard(period, gameType);
        console.log('✅ Leaderboard rebuilt successfully!\n');

        // 顯示重建結果
        const stats = await leaderboardService.getLeaderboard(period, gameType, 1, 5);
        console.log(`📊 Top 5 players:`);
        stats.data.forEach(player => {
            console.log(`   ${player.rank}. ${player.username} - ${player.score}`);
        });
        console.log(`\n📈 Total players: ${stats.total}\n`);

    } catch (error) {
        console.error('❌ Rebuild failed:', error.message);
        process.exit(1);
    } finally {
        await closeConnections();
    }
}

main();

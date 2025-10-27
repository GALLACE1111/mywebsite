import { redisClient, mysqlPool } from '../config/database.js';

/**
 * 排行榜服務類別
 */
class LeaderboardService {
    /**
     * 獲取排行榜
     * @param {string} period - 時間範圍（daily/weekly/monthly/all）
     * @param {string} gameType - 遊戲類型
     * @param {number} page - 頁碼
     * @param {number} limit - 每頁數量
     */
    async getLeaderboard(period = 'all', gameType = 'default', page = 1, limit = 50) {
        try {
            // 計算 Redis key
            const redisKey = this.getRedisKey(period, gameType);

            // 計算分頁
            const offset = (page - 1) * limit;

            // 從 Redis 獲取排行榜（按分數降序）
            const rankings = await redisClient.zrevrange(
                redisKey,
                offset,
                offset + limit - 1,
                'WITHSCORES'
            );

            // 獲取總數
            const total = await redisClient.zcard(redisKey);

            // 解析結果
            const leaderboard = [];
            for (let i = 0; i < rankings.length; i += 2) {
                const userId = parseInt(rankings[i]);
                const score = parseInt(rankings[i + 1]);

                // 從 Redis 獲取用戶資訊
                const username = await redisClient.hget(`user:${userId}`, 'username');

                leaderboard.push({
                    rank: offset + (i / 2) + 1,
                    user_id: userId,
                    username: username || `User ${userId}`,
                    score: score
                });
            }

            // 如果 Redis 沒有資料，從 MySQL 重建
            if (leaderboard.length === 0 && page === 1) {
                console.log('📊 Redis empty, rebuilding from MySQL...');
                await this.rebuildLeaderboard(period, gameType);
                return this.getLeaderboard(period, gameType, page, limit);
            }

            return {
                success: true,
                period,
                game_type: gameType,
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
                data: leaderboard
            };

        } catch (error) {
            console.error('Error getting leaderboard:', error);
            throw error;
        }
    }

    /**
     * 獲取用戶個人排名
     * @param {number} userId - 用戶ID
     * @param {string} period - 時間範圍
     * @param {string} gameType - 遊戲類型
     */
    async getUserRank(userId, period = 'all', gameType = 'default') {
        try {
            const redisKey = this.getRedisKey(period, gameType);

            // 獲取排名（從0開始）
            const rank = await redisClient.zrevrank(redisKey, userId);

            if (rank === null) {
                return {
                    success: true,
                    user_id: userId,
                    rank: null,
                    score: null,
                    message: 'User not found in leaderboard'
                };
            }

            // 獲取分數
            const score = await redisClient.zscore(redisKey, userId);

            // 獲取用戶名
            const username = await redisClient.hget(`user:${userId}`, 'username');

            // 獲取總人數
            const total = await redisClient.zcard(redisKey);

            return {
                success: true,
                user_id: userId,
                username: username || `User ${userId}`,
                rank: rank + 1,  // 轉換為從1開始
                score: parseInt(score),
                total_users: total,
                percentile: ((total - rank) / total * 100).toFixed(2) + '%'
            };

        } catch (error) {
            console.error('Error getting user rank:', error);
            throw error;
        }
    }

    /**
     * 獲取用戶周圍的排名
     * @param {number} userId - 用戶ID
     * @param {string} period - 時間範圍
     * @param {string} gameType - 遊戲類型
     * @param {number} range - 前後範圍
     */
    async getUserRankWithContext(userId, period = 'all', gameType = 'default', range = 5) {
        try {
            const redisKey = this.getRedisKey(period, gameType);

            // 獲取用戶排名
            const userRank = await redisClient.zrevrank(redisKey, userId);

            if (userRank === null) {
                return {
                    success: false,
                    message: 'User not found in leaderboard'
                };
            }

            // 計算範圍
            const start = Math.max(0, userRank - range);
            const end = userRank + range;

            // 獲取周圍排名
            const rankings = await redisClient.zrevrange(
                redisKey,
                start,
                end,
                'WITHSCORES'
            );

            // 解析結果
            const leaderboard = [];
            for (let i = 0; i < rankings.length; i += 2) {
                const uid = parseInt(rankings[i]);
                const score = parseInt(rankings[i + 1]);
                const username = await redisClient.hget(`user:${uid}`, 'username');

                leaderboard.push({
                    rank: start + (i / 2) + 1,
                    user_id: uid,
                    username: username || `User ${uid}`,
                    score: score,
                    is_current_user: uid === userId
                });
            }

            return {
                success: true,
                user_id: userId,
                user_rank: userRank + 1,
                data: leaderboard
            };

        } catch (error) {
            console.error('Error getting user rank with context:', error);
            throw error;
        }
    }

    /**
     * 從 MySQL 重建 Redis 排行榜
     */
    async rebuildLeaderboard(period = 'all', gameType = 'default') {
        try {
            const redisKey = this.getRedisKey(period, gameType);

            // 獲取時間範圍條件
            const dateCondition = this.getDateCondition(period);

            // 從 MySQL 查詢
            const query = `
                SELECT
                    s.user_id,
                    u.username,
                    MAX(s.score) as best_score
                FROM scores s
                INNER JOIN users u ON s.user_id = u.id
                WHERE s.game_type = ?
                ${dateCondition}
                GROUP BY s.user_id, u.username
                ORDER BY best_score DESC
                LIMIT 10000
            `;

            const [rows] = await mysqlPool.execute(query, [gameType]);

            if (rows.length === 0) {
                console.log('⚠️ No data found in MySQL');
                return;
            }

            // 清空舊資料
            await redisClient.del(redisKey);

            // 批量寫入 Redis
            const pipeline = redisClient.pipeline();

            rows.forEach(row => {
                // 添加到 Sorted Set
                pipeline.zadd(redisKey, row.best_score, row.user_id);

                // 儲存用戶資訊
                pipeline.hset(`user:${row.user_id}`, 'username', row.username);
                pipeline.hset(`user:${row.user_id}`, 'score', row.best_score);
            });

            // 設定過期時間
            if (period === 'daily') {
                pipeline.expire(redisKey, 86400 * 7); // 7天
            } else if (period === 'weekly') {
                pipeline.expire(redisKey, 86400 * 30); // 30天
            } else if (period === 'monthly') {
                pipeline.expire(redisKey, 86400 * 90); // 90天
            }

            await pipeline.exec();

            console.log(`✅ Rebuilt leaderboard: ${redisKey} (${rows.length} entries)`);

        } catch (error) {
            console.error('Error rebuilding leaderboard:', error);
            throw error;
        }
    }

    /**
     * 生成 Redis Key
     */
    getRedisKey(period, gameType) {
        const now = new Date();

        switch (period) {
            case 'daily':
                const today = now.toISOString().split('T')[0];
                return `leaderboard:${gameType}:daily:${today}`;

            case 'weekly':
                const year = now.getFullYear();
                const week = this.getWeekNumber(now);
                return `leaderboard:${gameType}:weekly:${year}-W${week}`;

            case 'monthly':
                const month = now.toISOString().slice(0, 7);
                return `leaderboard:${gameType}:monthly:${month}`;

            case 'all':
            default:
                return `leaderboard:${gameType}:all`;
        }
    }

    /**
     * 生成 MySQL 日期條件
     */
    getDateCondition(period) {
        switch (period) {
            case 'daily':
                return `AND DATE(s.created_at) = CURDATE()`;

            case 'weekly':
                return `AND YEARWEEK(s.created_at, 1) = YEARWEEK(CURDATE(), 1)`;

            case 'monthly':
                return `AND DATE_FORMAT(s.created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')`;

            case 'all':
            default:
                return '';
        }
    }

    /**
     * 獲取 ISO 週數
     */
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return String(weekNo).padStart(2, '0');
    }
}

export default new LeaderboardService();

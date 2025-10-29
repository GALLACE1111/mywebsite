import fs from 'fs';

const content = `import { mysqlPool } from '../config/database.js';

/**
 * 簡化版排行榜服務 - 只使用 MySQL
 */
class LeaderboardService {
    /**
     * 獲取排行榜
     * @param {number} page - 頁碼
     * @param {number} limit - 每頁數量
     */
    async getLeaderboard(page = 1, limit = 50) {
        try {
            // 確保是整數
            page = parseInt(page);
            limit = parseInt(limit);
            const offset = (page - 1) * limit;

            // 從 MySQL 查詢總排行榜（使用模板字串）
            const query = \\\`
                SELECT
                    u.id as user_id,
                    u.username,
                    t.total_loves as score
                FROM user_total_loves t
                INNER JOIN users u ON t.user_id = u.id
                ORDER BY t.total_loves DESC
                LIMIT \\\${limit} OFFSET \\\${offset}
            \\\`;

            const [rows] = await mysqlPool.query(query);

            // 計算總數
            const [countResult] = await mysqlPool.query(
                'SELECT COUNT(*) as total FROM user_total_loves WHERE total_loves > 0'
            );
            const total = countResult[0].total;

            // 組裝結果
            const leaderboard = rows.map((row, index) => ({
                rank: offset + index + 1,
                user_id: row.user_id,
                username: row.username || \\\`User \\\${row.user_id}\\\`,
                score: row.score
            }));

            return {
                success: true,
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
     */
    async getUserRank(userId) {
        try {
            userId = parseInt(userId);

            // 獲取用戶分數
            const [userRows] = await mysqlPool.execute(
                \\\`SELECT u.username, t.total_loves as score
                 FROM user_total_loves t
                 INNER JOIN users u ON t.user_id = u.id
                 WHERE t.user_id = ?\\\`,
                [userId]
            );

            if (userRows.length === 0) {
                return {
                    success: true,
                    user_id: userId,
                    rank: null,
                    score: null,
                    message: 'User not found in leaderboard'
                };
            }

            const userScore = userRows[0].score;
            const username = userRows[0].username;

            // 計算排名（有多少人分數比我高 + 1）
            const [rankRows] = await mysqlPool.execute(
                'SELECT COUNT(*) + 1 as rank FROM user_total_loves WHERE total_loves > ?',
                [userScore]
            );

            // 獲取總人數
            const [totalRows] = await mysqlPool.query(
                'SELECT COUNT(*) as total FROM user_total_loves WHERE total_loves > 0'
            );

            const rank = rankRows[0].rank;
            const total = totalRows[0].total;

            return {
                success: true,
                user_id: userId,
                username: username || \\\`User \\\${userId}\\\`,
                rank: rank,
                score: userScore,
                total_users: total,
                percentile: ((total - rank + 1) / total * 100).toFixed(2) + '%'
            };

        } catch (error) {
            console.error('Error getting user rank:', error);
            throw error;
        }
    }

    /**
     * 獲取用戶周圍的排名
     * @param {number} userId - 用戶ID
     * @param {number} range - 前後範圍
     */
    async getUserRankWithContext(userId, range = 5) {
        try {
            userId = parseInt(userId);
            range = parseInt(range);

            // 先獲取用戶排名
            const userRankResult = await this.getUserRank(userId);

            if (!userRankResult.success || userRankResult.rank === null) {
                return {
                    success: false,
                    message: 'User not found in leaderboard'
                };
            }

            const userRank = userRankResult.rank;

            // 計算範圍
            const start = Math.max(1, userRank - range);
            const limit = range * 2 + 1;
            const offset = start - 1;

            // 獲取周圍排名
            const query = \\\`
                SELECT
                    u.id as user_id,
                    u.username,
                    t.total_loves as score
                FROM user_total_loves t
                INNER JOIN users u ON t.user_id = u.id
                ORDER BY t.total_loves DESC
                LIMIT \\\${limit} OFFSET \\\${offset}
            \\\`;

            const [rows] = await mysqlPool.query(query);

            // 組裝結果
            const leaderboard = rows.map((row, index) => ({
                rank: start + index,
                user_id: row.user_id,
                username: row.username || \\\`User \\\${row.user_id}\\\`,
                score: row.score,
                is_current_user: row.user_id === userId
            }));

            return {
                success: true,
                user_id: userId,
                user_rank: userRank,
                data: leaderboard
            };

        } catch (error) {
            console.error('Error getting user rank with context:', error);
            throw error;
        }
    }

    /**
     * 提交分數
     * @param {number} userId - 用戶ID
     * @param {number} score - 分數
     * @param {string} gameType - 遊戲類型
     */
    async submitScore(userId, score, gameType = 'default') {
        try {
            userId = parseInt(userId);
            score = parseInt(score);

            // 檢查用戶是否存在
            const [userRows] = await mysqlPool.execute(
                'SELECT id FROM users WHERE id = ?',
                [userId]
            );

            if (userRows.length === 0) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }

            // 插入分數記錄
            const [insertResult] = await mysqlPool.execute(
                \\\`INSERT INTO love_scores (user_id, love_count, action_type, created_at)
                 VALUES (?, ?, ?, NOW())\\\`,
                [userId, score, gameType]
            );

            // 更新總分數（使用 INSERT ... ON DUPLICATE KEY UPDATE）
            await mysqlPool.execute(
                \\\`INSERT INTO user_total_loves (user_id, total_loves, last_updated)
                 VALUES (?, ?, NOW())
                 ON DUPLICATE KEY UPDATE
                 total_loves = total_loves + VALUES(total_loves),
                 last_updated = NOW()\\\`,
                [userId, score]
            );

            return {
                success: true,
                score_id: insertResult.insertId,
                user_id: userId,
                score: score,
                message: 'Score submitted successfully'
            };

        } catch (error) {
            console.error('Error submitting score:', error);
            throw error;
        }
    }
}

export default new LeaderboardService();
`;

fs.writeFileSync('services/leaderboard.service.js', content, 'utf8');
console.log('✅ leaderboard.service.js created successfully!');

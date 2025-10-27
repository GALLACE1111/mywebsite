import express from 'express';
import leaderboardService from '../services/leaderboard.service.js';

const router = express.Router();

/**
 * GET /api/leaderboard
 * 獲取排行榜
 *
 * 查詢參數：
 * - period: daily/weekly/monthly/all (預設: all)
 * - game_type: 遊戲類型 (預設: default)
 * - page: 頁碼 (預設: 1)
 * - limit: 每頁數量 (預設: 50, 最大: 100)
 */
router.get('/', async (req, res) => {
    try {
        const {
            period = 'all',
            game_type = 'default',
            page = 1,
            limit = 50
        } = req.query;

        // 驗證參數
        const validPeriods = ['daily', 'weekly', 'monthly', 'all'];
        if (!validPeriods.includes(period)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid period. Must be: daily, weekly, monthly, or all'
            });
        }

        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 100);

        if (pageNum < 1 || limitNum < 1) {
            return res.status(400).json({
                success: false,
                error: 'Invalid page or limit'
            });
        }

        // 獲取排行榜
        const result = await leaderboardService.getLeaderboard(
            period,
            game_type,
            pageNum,
            limitNum
        );

        res.json(result);

    } catch (error) {
        console.error('Error in GET /leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/leaderboard/my-rank/:userId
 * 獲取用戶個人排名
 *
 * 路徑參數：
 * - userId: 用戶ID
 *
 * 查詢參數：
 * - period: daily/weekly/monthly/all (預設: all)
 * - game_type: 遊戲類型 (預設: default)
 */
router.get('/my-rank/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            period = 'all',
            game_type = 'default'
        } = req.query;

        const userIdNum = parseInt(userId);

        if (isNaN(userIdNum) || userIdNum < 1) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }

        // 獲取用戶排名
        const result = await leaderboardService.getUserRank(
            userIdNum,
            period,
            game_type
        );

        res.json(result);

    } catch (error) {
        console.error('Error in GET /leaderboard/my-rank:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/leaderboard/around/:userId
 * 獲取用戶周圍的排名
 *
 * 路徑參數：
 * - userId: 用戶ID
 *
 * 查詢參數：
 * - period: daily/weekly/monthly/all (預設: all)
 * - game_type: 遊戲類型 (預設: default)
 * - range: 前後範圍 (預設: 5)
 */
router.get('/around/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            period = 'all',
            game_type = 'default',
            range = 5
        } = req.query;

        const userIdNum = parseInt(userId);
        const rangeNum = Math.min(parseInt(range), 20);

        if (isNaN(userIdNum) || userIdNum < 1) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }

        // 獲取周圍排名
        const result = await leaderboardService.getUserRankWithContext(
            userIdNum,
            period,
            game_type,
            rangeNum
        );

        res.json(result);

    } catch (error) {
        console.error('Error in GET /leaderboard/around:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/leaderboard/rebuild
 * 重建排行榜（管理員功能）
 *
 * 請求體：
 * - period: daily/weekly/monthly/all
 * - game_type: 遊戲類型 (預設: default)
 */
router.post('/rebuild', async (req, res) => {
    try {
        const {
            period = 'all',
            game_type = 'default'
        } = req.body;

        await leaderboardService.rebuildLeaderboard(period, game_type);

        res.json({
            success: true,
            message: `Leaderboard rebuilt successfully for ${period} period`
        });

    } catch (error) {
        console.error('Error in POST /leaderboard/rebuild:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

export default router;

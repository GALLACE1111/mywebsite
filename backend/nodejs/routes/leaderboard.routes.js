import express from 'express';
import leaderboardService from '../services/leaderboard.service.js';

const router = express.Router();

/**
 * GET /api/leaderboard
 * 獲取排行榜
 *
 * 查詢參數：
 * - page: 頁碼 (預設: 1)
 * - limit: 每頁數量 (預設: 50, 最大: 100)
 */
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 100);

        if (pageNum < 1 || limitNum < 1) {
            return res.status(400).json({
                success: false,
                error: 'Invalid page or limit'
            });
        }

        // 獲取排行榜
        const result = await leaderboardService.getLeaderboard(pageNum, limitNum);
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
 */
router.get('/my-rank/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userIdNum = parseInt(userId);

        if (isNaN(userIdNum) || userIdNum < 1) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }

        // 獲取用戶排名
        const result = await leaderboardService.getUserRank(userIdNum);
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
 * - range: 前後範圍 (預設: 5)
 */
router.get('/around/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { range = 5 } = req.query;

        const userIdNum = parseInt(userId);
        const rangeNum = Math.min(parseInt(range), 20);

        if (isNaN(userIdNum) || userIdNum < 1) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }

        // 獲取周圍排名
        const result = await leaderboardService.getUserRankWithContext(userIdNum, rangeNum);
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
 * POST /api/leaderboard/submit
 * 提交分數
 *
 * 請求體：
 * - user_id: 用戶ID (必填)
 * - score: 分數 (必填)
 * - game_type: 遊戲類型 (選填, 預設: default)
 */
router.post('/submit', async (req, res) => {
    try {
        const { user_id, score, game_type = 'default' } = req.body;

        // 驗證參數
        if (!user_id || !score) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: user_id and score'
            });
        }

        const userIdNum = parseInt(user_id);
        const scoreNum = parseInt(score);

        if (isNaN(userIdNum) || userIdNum < 1) {
            return res.status(400).json({
                success: false,
                error: 'Invalid user_id'
            });
        }

        if (isNaN(scoreNum) || scoreNum < 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid score'
            });
        }

        // 提交分數
        const result = await leaderboardService.submitScore(userIdNum, scoreNum, game_type);
        res.json(result);

    } catch (error) {
        console.error('Error in POST /leaderboard/submit:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

export default router;

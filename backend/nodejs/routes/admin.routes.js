import express from 'express';
import leaderboardService from '../services/leaderboard.service.js';

const router = express.Router();

/**
 * DELETE /api/admin/players/:userId
 * 刪除特定玩家的所有資料
 * ⚠️ 危險操作！生產環境應該添加身份驗證
 */
router.delete('/players/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId || userId.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }

        const result = await leaderboardService.deletePlayer(userId);
        res.json(result);

    } catch (error) {
        console.error('Error in DELETE /admin/players:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/admin/players/:userId/reset
 * 重置玩家分數為 0
 */
router.post('/players/:userId/reset', async (req, res) => {
    try {
        const { userId } = req.params;
        const { deleteHistory = false } = req.body;

        if (!userId || userId.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }

        const result = await leaderboardService.resetPlayerScore(userId, deleteHistory);
        res.json(result);

    } catch (error) {
        console.error('Error in POST /admin/players/reset:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * DELETE /api/admin/leaderboard
 * 清空整個排行榜
 * ⚠️ 極度危險！會刪除所有玩家資料
 */
router.delete('/leaderboard', async (req, res) => {
    try {
        // 需要確認參數
        const { confirm } = req.body;

        if (confirm !== 'DELETE_ALL_DATA') {
            return res.status(400).json({
                success: false,
                error: 'Please confirm by sending { "confirm": "DELETE_ALL_DATA" }'
            });
        }

        const result = await leaderboardService.clearLeaderboard();
        res.json(result);

    } catch (error) {
        console.error('Error in DELETE /admin/leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/admin/players
 * 獲取所有玩家列表（管理用）
 */
router.get('/players', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 200);

        if (pageNum < 1 || limitNum < 1) {
            return res.status(400).json({
                success: false,
                error: 'Invalid page or limit'
            });
        }

        const result = await leaderboardService.getAllPlayers(pageNum, limitNum);
        res.json(result);

    } catch (error) {
        console.error('Error in GET /admin/players:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

export default router;

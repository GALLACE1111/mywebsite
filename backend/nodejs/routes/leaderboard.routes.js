import express from 'express';
import leaderboardService from '../services/leaderboard.service.js';
import upload from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { submitLimiter, queryLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';

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
        const limitNum = Math.min(parseInt(limit), 200); // 支持查看更多功能

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
        console.log(`📊 Fetching rank for user: ${userId}`);

        if (!userId || userId.trim() === '') {
            console.error('❌ Invalid user ID:', userId);
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }

        // 獲取用戶排名
        const result = await leaderboardService.getUserRank(userId);
        console.log(`✅ User rank result:`, result);
        res.json(result);

    } catch (error) {
        console.error('❌ Error in GET /leaderboard/my-rank:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
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

        const rangeNum = Math.min(parseInt(range), 20);

        if (!userId || userId.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }

        // 獲取周圍排名
        const result = await leaderboardService.getUserRankWithContext(userId, rangeNum);
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
 * - player_id: 用戶ID (必填)
 * - username: 用戶名稱 (必填)
 * - score: 分數 (必填)
 */
router.post('/submit', submitLimiter, validate('submitScore'), asyncHandler(async (req, res) => {
    // 驗證中間件已處理輸入驗證
    const { player_id, username, score } = req.body;

    // 提交分數
    const result = await leaderboardService.submitScore(player_id, score);

    // 處理玩家上限情況
    if (!result.success && result.error === 'PLAYER_LIMIT_REACHED') {
        return res.status(403).json(result);
    }

    res.json(result);
}));

/**
 * PUT /api/leaderboard/username
 * 更新用戶名稱
 *
 * 請求體：
 * - userId: 用戶ID (必填)
 * - newUsername: 新用戶名稱 (必填, 2-20字元)
 */
router.put('/username', async (req, res) => {
    try {
        const { userId, newUsername } = req.body;

        // 驗證參數
        if (!userId || !newUsername) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId and newUsername'
            });
        }

        if (typeof userId !== 'string' || userId.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Invalid userId'
            });
        }

        if (typeof newUsername !== 'string' || newUsername.trim().length < 2 || newUsername.trim().length > 20) {
            return res.status(400).json({
                success: false,
                error: 'Username must be between 2 and 20 characters'
            });
        }

        // 更新用戶名稱
        const result = await leaderboardService.updateUsername(userId, newUsername);
        res.json(result);

    } catch (error) {
        console.error('Error in PUT /leaderboard/username:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

/**
 * POST /api/leaderboard/grant-title
 * 授予玩家稱號
 *
 * 請求體：
 * - userId: 用戶ID (必填)
 * - titleId: 稱號ID (必填)
 * - titleName: 稱號名稱 (必填)
 */
router.post('/grant-title', async (req, res) => {
    try {
        const { userId, titleId, titleName } = req.body;

        // 驗證參數
        if (!userId || !titleId || !titleName) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, titleId, and titleName'
            });
        }

        // 授予稱號
        const result = await leaderboardService.grantTitle(userId, titleId, titleName);
        res.json(result);

    } catch (error) {
        console.error('Error in POST /leaderboard/grant-title:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/leaderboard/titles/:userId
 * 獲取玩家稱號列表
 *
 * 路徑參數：
 * - userId: 用戶ID
 */
router.get('/titles/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId || userId.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }

        // 獲取稱號
        const result = await leaderboardService.getUserTitles(userId);
        res.json(result);

    } catch (error) {
        console.error('Error in GET /leaderboard/titles:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/leaderboard/check-first/:userId
 * 檢查玩家是否為第一名
 *
 * 路徑參數：
 * - userId: 用戶ID
 */
router.get('/check-first/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId || userId.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }

        // 檢查第一名
        const result = await leaderboardService.checkFirstPlace(userId);
        res.json(result);

    } catch (error) {
        console.error('Error in GET /leaderboard/check-first:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/leaderboard/avatar
 * 上傳用戶大頭貼
 *
 * Body (multipart/form-data):
 * - userId: 用戶ID (必填)
 * - avatar: 圖片文件 (必填)
 */
router.post('/avatar', upload.single('avatar'), async (req, res) => {
    try {
        const { userId } = req.body;

        // 驗證參數
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: userId'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file uploaded'
            });
        }

        // 上傳大頭貼
        const result = await leaderboardService.uploadAvatar(
            userId,
            req.file.buffer,
            req.file.mimetype
        );

        res.json(result);

    } catch (error) {
        console.error('Error in POST /leaderboard/avatar:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

// ============ 管理 API ============
// ⚠️ 注意：這些端點應該受到身份驗證保護
// 建議在生產環境中添加 API 密鑰或管理員身份驗證

/**
 * GET /api/leaderboard/admin/players
 * 獲取所有玩家列表（管理用）
 *
 * 查詢參數：
 * - page: 頁碼 (預設: 1)
 * - limit: 每頁數量 (預設: 50, 最大: 200)
 */
router.get('/admin/players', async (req, res) => {
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
        console.error('Error in GET /leaderboard/admin/players:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * DELETE /api/leaderboard/admin/player/:userId
 * 刪除特定玩家的所有資料
 *
 * 路徑參數：
 * - userId: 用戶ID
 */
router.delete('/admin/player/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId || userId.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Invalid user ID'
            });
        }

        const result = await leaderboardService.deletePlayer(userId);

        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json(result);

    } catch (error) {
        console.error('Error in DELETE /leaderboard/admin/player:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/leaderboard/admin/reset-score
 * 重置玩家分數為 0
 *
 * 請求體：
 * - userId: 用戶ID (必填)
 * - deleteHistory: 是否刪除歷史記錄 (選填, 預設: false)
 */
router.post('/admin/reset-score', async (req, res) => {
    try {
        const { userId, deleteHistory = false } = req.body;

        if (!userId || userId.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: userId'
            });
        }

        const result = await leaderboardService.resetPlayerScore(userId, deleteHistory);

        if (!result.success) {
            return res.status(404).json(result);
        }

        res.json(result);

    } catch (error) {
        console.error('Error in POST /leaderboard/admin/reset-score:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/leaderboard/admin/clear-all
 * 清空整個排行榜
 * ⚠️ 危險操作！會刪除所有玩家資料
 *
 * 請求體：
 * - confirm: 必須為 "DELETE ALL" 才能執行
 */
router.post('/admin/clear-all', async (req, res) => {
    try {
        const { confirm } = req.body;

        // 二次確認機制
        if (confirm !== 'DELETE ALL') {
            return res.status(400).json({
                success: false,
                error: 'Confirmation required: must send { "confirm": "DELETE ALL" }'
            });
        }

        const result = await leaderboardService.clearLeaderboard();
        res.json(result);

    } catch (error) {
        console.error('Error in POST /leaderboard/admin/clear-all:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

export default router;

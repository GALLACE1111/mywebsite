const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

// 初始化 Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// 創建 Express 應用
const app = express();

// 中間件
app.use(cors({ origin: true }));
app.use(express.json());

// ============ 排行榜服務邏輯 ============

/**
 * 獲取排行榜
 */
async function getLeaderboard(page = 1, limit = 50) {
    try {
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        // 獲取排行榜數據,按 totalScore 降序排序
        const snapshot = await db.collection('userTotals')
            .where('totalScore', '>', 0)
            .orderBy('totalScore', 'desc')
            .orderBy('lastUpdated', 'asc')
            .offset(offset)
            .limit(limit)
            .get();

        // 獲取總數
        const totalSnapshot = await db.collection('userTotals')
            .where('totalScore', '>', 0)
            .get();
        const total = totalSnapshot.size;

        const leaderboard = [];
        snapshot.forEach((doc, index) => {
            const data = doc.data();
            leaderboard.push({
                rank: offset + index + 1,
                user_id: doc.id,
                username: data.username || `User ${doc.id}`,
                score: data.totalScore || 0
            });
        });

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
 * 獲取用戶排名
 */
async function getUserRank(userId) {
    try {
        userId = String(userId);

        // 獲取用戶數據
        const userDoc = await db.collection('userTotals').doc(userId).get();

        if (!userDoc.exists) {
            return {
                success: true,
                user_id: userId,
                rank: null,
                score: null,
                message: 'User not found in leaderboard'
            };
        }

        const userData = userDoc.data();
        const userScore = userData.totalScore || 0;
        const username = userData.username;

        // 計算排名
        const higherScoresSnapshot = await db.collection('userTotals')
            .where('totalScore', '>', userScore)
            .get();

        const sameScoreSnapshot = await db.collection('userTotals')
            .where('totalScore', '==', userScore)
            .where('lastUpdated', '<', userData.lastUpdated)
            .get();

        const rank = higherScoresSnapshot.size + sameScoreSnapshot.size + 1;

        // 獲取總用戶數
        const totalSnapshot = await db.collection('userTotals')
            .where('totalScore', '>', 0)
            .get();
        const total = totalSnapshot.size;

        return {
            success: true,
            user_id: userId,
            username: username || `User ${userId}`,
            rank: rank,
            score: userScore,
            total_users: total,
            percentile: total > 0 ? ((total - rank + 1) / total * 100).toFixed(2) + '%' : '0%'
        };
    } catch (error) {
        console.error('Error getting user rank:', error);
        throw error;
    }
}

/**
 * 獲取用戶周圍排名
 */
async function getUserRankWithContext(userId, range = 5) {
    try {
        userId = String(userId);
        range = parseInt(range);

        // 先獲取用戶排名
        const userRankResult = await getUserRank(userId);
        if (!userRankResult.success || userRankResult.rank === null) {
            return { success: false, message: 'User not found in leaderboard' };
        }

        const userRank = userRankResult.rank;
        const start = Math.max(1, userRank - range);
        const limit = range * 2 + 1;
        const offset = start - 1;

        // 獲取周圍的排名
        const snapshot = await db.collection('userTotals')
            .where('totalScore', '>', 0)
            .orderBy('totalScore', 'desc')
            .orderBy('lastUpdated', 'asc')
            .offset(offset)
            .limit(limit)
            .get();

        const leaderboard = [];
        snapshot.forEach((doc, index) => {
            const data = doc.data();
            leaderboard.push({
                rank: start + index,
                user_id: doc.id,
                username: data.username || `User ${doc.id}`,
                score: data.totalScore || 0,
                is_current_user: doc.id === userId
            });
        });

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
 */
async function submitScore(userId, score, gameType = 'default') {
    try {
        userId = String(userId);
        score = parseInt(score);

        // 使用事務確保數據一致性
        const result = await db.runTransaction(async (transaction) => {
            // 檢查用戶是否存在
            const userRef = db.collection('users').doc(userId);
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists) {
                // 如果用戶不存在,創建用戶
                transaction.set(userRef, {
                    username: `User ${userId}`,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }

            const username = userDoc.exists ? userDoc.data().username : `User ${userId}`;

            // 添加分數記錄
            const scoreRef = db.collection('scores').doc();
            transaction.set(scoreRef, {
                userId: userId,
                score: score,
                gameType: gameType,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // 更新用戶總分
            const userTotalRef = db.collection('userTotals').doc(userId);
            const userTotalDoc = await transaction.get(userTotalRef);

            if (userTotalDoc.exists) {
                const currentTotal = userTotalDoc.data().totalScore || 0;
                transaction.update(userTotalRef, {
                    totalScore: currentTotal + score,
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                });
            } else {
                transaction.set(userTotalRef, {
                    userId: userId,
                    username: username,
                    totalScore: score,
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                });
            }

            return {
                scoreId: scoreRef.id,
                userId: userId,
                score: score
            };
        });

        return {
            success: true,
            score_id: result.scoreId,
            user_id: result.userId,
            score: result.score,
            message: 'Score submitted successfully'
        };
    } catch (error) {
        console.error('Error submitting score:', error);
        throw error;
    }
}

// ============ API 路由 ============

/**
 * GET /api/leaderboard
 * 獲取排行榜
 */
app.get('/leaderboard', async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(limit), 100);

        if (pageNum < 1 || limitNum < 1) {
            return res.status(400).json({
                success: false,
                error: 'Invalid page or limit'
            });
        }

        const result = await getLeaderboard(pageNum, limitNum);
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
 */
app.get('/leaderboard/my-rank/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await getUserRank(userId);
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
 */
app.get('/leaderboard/around/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { range = 5 } = req.query;
        const rangeNum = Math.min(parseInt(range), 20);

        const result = await getUserRankWithContext(userId, rangeNum);
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
 */
app.post('/leaderboard/submit', async (req, res) => {
    try {
        const { user_id, score, game_type = 'default' } = req.body;

        if (!user_id || score === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: user_id and score'
            });
        }

        const scoreNum = parseInt(score);
        if (isNaN(scoreNum) || scoreNum < 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid score'
            });
        }

        const result = await submitScore(user_id, scoreNum, game_type);
        res.json(result);
    } catch (error) {
        console.error('Error in POST /leaderboard/submit:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// 健康檢查
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'firebase-cloud-functions'
    });
});

// 導出 Cloud Function
exports.api = functions.https.onRequest(app);

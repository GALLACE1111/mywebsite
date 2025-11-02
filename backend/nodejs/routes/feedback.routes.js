import express from 'express';
import { db } from '../config/firebase.js';
import { validate } from '../middleware/validate.js';
import { feedbackLimiter, queryLimiter, adminLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * POST /api/feedback
 * 提交意見回饋
 * Body: { player_id, username, category, message }
 */
router.post('/', feedbackLimiter, validate('submitFeedback'), asyncHandler(async (req, res) => {
  // 驗證中間件已處理輸入驗證
  const { player_id, username, category, message } = req.body;

  // 創建回饋
  const feedback = {
    player_id,
    username,
    category,
    message: message.trim(),
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const docRef = await db.collection('feedback').add(feedback);

  res.json({
    success: true,
    feedback: {
      id: docRef.id,
      ...feedback
    }
  });
}));

/**
 * GET /api/feedback/my/:playerId
 * 獲取我的回饋歷史
 */
router.get('/my/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const feedbackSnapshot = await db.collection('feedback')
      .where('player_id', '==', playerId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .get();

    const feedbackList = [];
    feedbackSnapshot.forEach(doc => {
      feedbackList.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      feedback: feedbackList
    });

  } catch (error) {
    console.error('獲取回饋歷史失敗:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/feedback
 * 獲取所有回饋（管理員用）
 * Query: page, limit, status, category
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const category = req.query.category;

    let query = db.collection('feedback');

    // 篩選條件
    if (status) {
      query = query.where('status', '==', status);
    }
    if (category) {
      query = query.where('category', '==', category);
    }

    // 獲取總數
    const countSnapshot = await query.count().get();
    const total = countSnapshot.data().count;

    // 獲取回饋列表
    const feedbackSnapshot = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    const feedbackList = [];
    feedbackSnapshot.forEach(doc => {
      feedbackList.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      feedback: feedbackList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('獲取回饋列表失敗:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/feedback/:feedbackId/status
 * 更新回饋狀態（管理員用）
 * Body: { status: 'pending' | 'reviewed' | 'resolved' }
 */
router.put('/:feedbackId/status', async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'reviewed', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: '無效的狀態'
      });
    }

    const feedbackRef = db.collection('feedback').doc(feedbackId);
    const feedbackDoc = await feedbackRef.get();

    if (!feedbackDoc.exists) {
      return res.status(404).json({
        success: false,
        error: '回饋不存在'
      });
    }

    await feedbackRef.update({
      status,
      updated_at: new Date().toISOString()
    });

    res.json({
      success: true,
      message: '狀態已更新'
    });

  } catch (error) {
    console.error('更新狀態失敗:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/feedback/stats
 * 獲取回饋統計（管理員用）
 */
router.get('/stats', async (req, res) => {
  try {
    // 獲取各分類統計
    const categories = ['bug', 'feature', 'combat', 'other'];
    const statuses = ['pending', 'reviewed', 'resolved'];

    const categoryStats = {};
    const statusStats = {};

    for (const category of categories) {
      const snapshot = await db.collection('feedback')
        .where('category', '==', category)
        .count()
        .get();
      categoryStats[category] = snapshot.data().count;
    }

    for (const status of statuses) {
      const snapshot = await db.collection('feedback')
        .where('status', '==', status)
        .count()
        .get();
      statusStats[status] = snapshot.data().count;
    }

    // 總數
    const totalSnapshot = await db.collection('feedback').count().get();
    const total = totalSnapshot.data().count;

    res.json({
      success: true,
      stats: {
        total,
        by_category: categoryStats,
        by_status: statusStats
      }
    });

  } catch (error) {
    console.error('獲取統計失敗:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

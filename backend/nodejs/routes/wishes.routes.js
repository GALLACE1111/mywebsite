import express from 'express';
import { db } from '../config/firebase.js';
import { validate } from '../middleware/validate.js';
import { wishLimiter, queryLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * GET /api/wishes
 * 獲取許願列表
 * Query: page, limit
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // 獲取總數
    const countSnapshot = await db.collection('wishes').count().get();
    const total = countSnapshot.data().count;

    // 獲取許願列表（按時間倒序）
    const wishesSnapshot = await db.collection('wishes')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    const wishes = [];
    wishesSnapshot.forEach(doc => {
      wishes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      wishes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('獲取許願列表失敗:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/wishes
 * 提交許願
 * Body: { player_id, username, content }
 */
router.post('/', wishLimiter, validate('createWish'), asyncHandler(async (req, res) => {
  // 驗證中間件已處理輸入驗證
  const { player_id, username, content } = req.body;

  // 創建許願
  const wish = {
    player_id,
    username,
    content: content.trim(),
    likes: 0,
    created_at: new Date().toISOString()
  };

  const docRef = await db.collection('wishes').add(wish);

  res.json({
    success: true,
    wish: {
      id: docRef.id,
      ...wish
    }
  });
}));

/**
 * POST /api/wishes/:wishId/like
 * 點讚/取消點讚
 * Body: { player_id, action: 'like' | 'unlike' }
 */
router.post('/:wishId/like', wishLimiter, validate('likeWish'), asyncHandler(async (req, res) => {
  const { wishId } = req.params;
  const { player_id, action } = req.body;

  const wishRef = db.collection('wishes').doc(wishId);
  const wishDoc = await wishRef.get();

  if (!wishDoc.exists) {
    throw createError.notFound('許願不存在');
  }

  const wishData = wishDoc.data();
  let newLikes = wishData.likes || 0;

  if (action === 'like') {
    newLikes += 1;
  } else if (action === 'unlike') {
    newLikes = Math.max(0, newLikes - 1);
  }

  await wishRef.update({ likes: newLikes });

  res.json({
    success: true,
    likes: newLikes
  });
}));

/**
 * GET /api/wishes/my/:playerId
 * 獲取我的許願歷史
 */
router.get('/my/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;

    const wishesSnapshot = await db.collection('wishes')
      .where('player_id', '==', playerId)
      .orderBy('created_at', 'desc')
      .limit(20)
      .get();

    const wishes = [];
    wishesSnapshot.forEach(doc => {
      wishes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      success: true,
      wishes
    });

  } catch (error) {
    console.error('獲取我的許願失敗:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/wishes/:wishId
 * 刪除許願（僅允許作者刪除）
 * Query: player_id
 */
router.delete('/:wishId', async (req, res) => {
  try {
    const { wishId } = req.params;
    const { player_id } = req.query;

    const wishRef = db.collection('wishes').doc(wishId);
    const wishDoc = await wishRef.get();

    if (!wishDoc.exists) {
      return res.status(404).json({
        success: false,
        error: '許願不存在'
      });
    }

    const wishData = wishDoc.data();

    // 驗證權限
    if (wishData.player_id !== player_id) {
      return res.status(403).json({
        success: false,
        error: '無權刪除此許願'
      });
    }

    await wishRef.delete();

    res.json({
      success: true,
      message: '許願已刪除'
    });

  } catch (error) {
    console.error('刪除許願失敗:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

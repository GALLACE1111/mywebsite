/**
 * 速率限制中間件
 * 防止 API 濫用和 DDoS 攻擊
 */

import rateLimit from 'express-rate-limit';

/**
 * 通用 API 限制器
 * 每分鐘最多 60 次請求
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分鐘
  max: 60, // 最多 60 次請求
  standardHeaders: true, // 返回 RateLimit-* 標頭
  legacyHeaders: false, // 禁用 X-RateLimit-* 標頭
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: '請求過於頻繁，請稍後再試'
    }
  },
  // 跳過成功的請求（可選）
  skipSuccessfulRequests: false,
  // 根據 IP 地址限制（移除自定義 keyGenerator，使用默認值）
  // 自定義處理函數
  handler: (req, res) => {
    console.warn('⚠️  速率限制觸發:', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: '請求過於頻繁，請稍後再試',
        retryAfter: Math.ceil(60 - (Date.now() % 60000) / 1000) // 剩餘秒數
      }
    });
  }
});

/**
 * 提交分數限制器
 * 每分鐘最多 5 次提交
 */
const submitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分鐘
  max: 5, // 最多 5 次提交
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'SUBMIT_LIMIT_EXCEEDED',
      message: '提交過於頻繁，請等待一分鐘後再試'
    }
  },
  // 移除自定義 keyGenerator，使用默認 IP
  handler: (req, res) => {
    console.warn('⚠️  提交速率限制觸發:', {
      ip: req.ip,
      playerId: req.body?.player_id,
      url: req.originalUrl,
      timestamp: new Date().toISOString()
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'SUBMIT_LIMIT_EXCEEDED',
        message: '提交過於頻繁，請等待一分鐘後再試',
        retryAfter: Math.ceil(60 - (Date.now() % 60000) / 1000)
      }
    });
  }
});

/**
 * 許願限制器
 * 每分鐘最多 3 次許願
 */
const wishLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分鐘
  max: 3, // 最多 3 次
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'WISH_LIMIT_EXCEEDED',
      message: '許願過於頻繁，請等待一分鐘'
    }
  },
  // 使用默認 IP keyGenerator
  handler: (req, res) => {
    console.warn('⚠️  許願速率限制觸發:', {
      ip: req.ip,
      playerId: req.body?.player_id,
      timestamp: new Date().toISOString()
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'WISH_LIMIT_EXCEEDED',
        message: '許願過於頻繁，請等待一分鐘',
        retryAfter: Math.ceil(60 - (Date.now() % 60000) / 1000)
      }
    });
  }
});

/**
 * 回饋限制器
 * 每分鐘最多 2 次回饋提交
 */
const feedbackLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分鐘
  max: 2, // 最多 2 次
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'FEEDBACK_LIMIT_EXCEEDED',
      message: '回饋提交過於頻繁，請等待一分鐘'
    }
  },
  // 使用默認 IP keyGenerator
  handler: (req, res) => {
    console.warn('⚠️  回饋速率限制觸發:', {
      ip: req.ip,
      playerId: req.body?.player_id,
      timestamp: new Date().toISOString()
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'FEEDBACK_LIMIT_EXCEEDED',
        message: '回饋提交過於頻繁，請等待一分鐘',
        retryAfter: Math.ceil(60 - (Date.now() % 60000) / 1000)
      }
    });
  }
});

/**
 * 查詢限制器（更寬鬆）
 * 每分鐘最多 30 次查詢
 */
const queryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分鐘
  max: 30, // 最多 30 次
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // 跳過成功的請求
  message: {
    success: false,
    error: {
      code: 'QUERY_LIMIT_EXCEEDED',
      message: '查詢過於頻繁，請稍後再試'
    }
  }
});

/**
 * 管理員操作限制器
 * 每分鐘最多 10 次操作
 */
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分鐘
  max: 10, // 最多 10 次
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'ADMIN_LIMIT_EXCEEDED',
      message: '管理員操作過於頻繁'
    }
  },
  handler: (req, res) => {
    console.warn('⚠️  管理員速率限制觸發:', {
      ip: req.ip,
      url: req.originalUrl,
      timestamp: new Date().toISOString()
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'ADMIN_LIMIT_EXCEEDED',
        message: '管理員操作過於頻繁',
        retryAfter: Math.ceil(60 - (Date.now() % 60000) / 1000)
      }
    });
  }
});

/**
 * 嚴格限制器（登入等敏感操作）
 * 每 15 分鐘最多 5 次嘗試
 */
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 5, // 最多 5 次
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_ATTEMPTS',
      message: '嘗試次數過多，請 15 分鐘後再試'
    }
  },
  handler: (req, res) => {
    console.error('🚨 嚴格限制觸發:', {
      ip: req.ip,
      url: req.originalUrl,
      timestamp: new Date().toISOString()
    });

    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_ATTEMPTS',
        message: '嘗試次數過多，請 15 分鐘後再試',
        retryAfter: Math.ceil(900 - (Date.now() % 900000) / 1000)
      }
    });
  }
});

export {
  apiLimiter,
  submitLimiter,
  wishLimiter,
  feedbackLimiter,
  queryLimiter,
  adminLimiter,
  strictLimiter
};

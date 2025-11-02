/**
 * 請求驗證中間件
 * 使用 Joi 進行輸入驗證，防止惡意請求和數據注入
 */

import Joi from 'joi';
import { createError } from './errorHandler.js';

// 驗證 Schema 定義
const schemas = {
  // 提交分數驗證
  submitScore: Joi.object({
    player_id: Joi.string().required().max(100).trim()
      .messages({
        'string.empty': 'player_id 不能為空',
        'string.max': 'player_id 長度不能超過 100 字元',
        'any.required': '缺少 player_id 欄位'
      }),
    username: Joi.string().required().min(2).max(20).trim()
      .messages({
        'string.empty': '用戶名不能為空',
        'string.min': '用戶名至少需要 2 個字元',
        'string.max': '用戶名不能超過 20 字元',
        'any.required': '缺少 username 欄位'
      }),
    score: Joi.number().integer().min(0).max(10000000).required()
      .messages({
        'number.base': 'score 必須是數字',
        'number.integer': 'score 必須是整數',
        'number.min': 'score 不能小於 0',
        'number.max': 'score 超過最大限制',
        'any.required': '缺少 score 欄位'
      })
  }),

  // 更新用戶名驗證
  updateUsername: Joi.object({
    player_id: Joi.string().required().max(100).trim(),
    old_username: Joi.string().required().min(2).max(20).trim(),
    new_username: Joi.string().required().min(2).max(20).trim()
      .messages({
        'string.empty': '新用戶名不能為空',
        'string.min': '新用戶名至少需要 2 個字元',
        'string.max': '新用戶名不能超過 20 字元',
        'any.required': '缺少 new_username 欄位'
      })
  }),

  // 創建許願驗證
  createWish: Joi.object({
    player_id: Joi.string().required().max(100).trim(),
    username: Joi.string().required().min(2).max(20).trim(),
    content: Joi.string().required().min(5).max(200).trim()
      .messages({
        'string.empty': '許願內容不能為空',
        'string.min': '許願內容至少需要 5 個字元',
        'string.max': '許願內容不能超過 200 字元',
        'any.required': '缺少 content 欄位'
      })
  }),

  // 點讚許願驗證
  likeWish: Joi.object({
    player_id: Joi.string().required().max(100).trim(),
    action: Joi.string().valid('like', 'unlike').required()
      .messages({
        'any.only': 'action 只能是 like 或 unlike',
        'any.required': '缺少 action 欄位'
      })
  }),

  // 提交回饋驗證
  submitFeedback: Joi.object({
    player_id: Joi.string().required().max(100).trim(),
    username: Joi.string().required().min(2).max(20).trim(),
    category: Joi.string().valid('bug', 'feature', 'combat', 'other').required()
      .messages({
        'any.only': 'category 必須是 bug, feature, combat 或 other',
        'any.required': '缺少 category 欄位'
      }),
    message: Joi.string().required().min(10).max(500).trim()
      .messages({
        'string.empty': '回饋內容不能為空',
        'string.min': '回饋內容至少需要 10 個字元',
        'string.max': '回饋內容不能超過 500 字元',
        'any.required': '缺少 message 欄位'
      })
  }),

  // 更新回饋狀態驗證
  updateFeedbackStatus: Joi.object({
    status: Joi.string().valid('pending', 'reviewing', 'resolved', 'rejected').required()
      .messages({
        'any.only': 'status 必須是 pending, reviewing, resolved 或 rejected',
        'any.required': '缺少 status 欄位'
      }),
    admin_note: Joi.string().max(500).trim().allow('').optional()
      .messages({
        'string.max': '管理員備註不能超過 500 字元'
      })
  }),

  // Query 參數驗證
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  }),

  // ID 參數驗證
  id: Joi.object({
    id: Joi.string().required().trim()
      .messages({
        'string.empty': 'ID 不能為空',
        'any.required': '缺少 ID 參數'
      })
  })
};

/**
 * 驗證中間件工廠函數
 * @param {string} schemaName - Schema 名稱
 * @param {string} source - 驗證來源 ('body', 'query', 'params')
 */
const validate = (schemaName, source = 'body') => {
  return (req, res, next) => {
    const schema = schemas[schemaName];

    if (!schema) {
      console.error(`❌ 驗證 Schema 不存在: ${schemaName}`);
      return next(createError.internal('驗證配置錯誤'));
    }

    // 選擇驗證來源
    const dataToValidate = req[source];

    // 執行驗證
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // 返回所有錯誤
      stripUnknown: true // 移除未知欄位
    });

    if (error) {
      // 格式化錯誤信息
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      console.warn('⚠️  請求驗證失敗:', {
        schema: schemaName,
        errors: errorDetails,
        data: dataToValidate
      });

      return next(createError.badRequest(
        error.details[0].message,
        errorDetails
      ));
    }

    // 將驗證後的數據替換原始數據（已清理和轉換）
    req[source] = value;

    next();
  };
};

/**
 * 自定義驗證函數
 */
const customValidators = {
  // 驗證玩家 ID 格式
  isValidPlayerId: (playerId) => {
    return /^[a-zA-Z0-9_-]+$/.test(playerId);
  },

  // 驗證用戶名格式（支持中文、英文、數字）
  isValidUsername: (username) => {
    return /^[\u4e00-\u9fa5a-zA-Z0-9_-]+$/.test(username);
  },

  // 驗證分數是否合理（防作弊）
  isReasonableScore: (score, maxScore = 1000000) => {
    return score >= 0 && score <= maxScore;
  }
};

export {
  validate,
  schemas,
  customValidators
};

/**
 * 統一錯誤處理中間件
 * 提供一致的錯誤響應格式和詳細的錯誤日誌
 */

// 自定義錯誤類
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true; // 標記為可預期的操作錯誤
    Error.captureStackTrace(this, this.constructor);
  }
}

// 錯誤處理中間件
const errorHandler = (err, req, res, next) => {
  // 設置默認值
  err.statusCode = err.statusCode || 500;
  err.code = err.code || 'INTERNAL_ERROR';

  // 記錄錯誤
  if (!err.isOperational) {
    console.error('💥 非預期錯誤:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  } else {
    console.warn('⚠️  操作錯誤:', {
      code: err.code,
      message: err.message,
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  // 開發環境：返回詳細錯誤
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        stack: err.stack,
        details: err.details
      }
    });
  }

  // 生產環境：簡化錯誤信息
  res.status(err.statusCode).json({
    success: false,
    error: {
      code: err.code,
      message: err.isOperational ? err.message : '伺服器錯誤，請稍後再試'
    }
  });
};

// 404 處理中間件
const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `找不到路徑: ${req.originalUrl}`,
    404,
    'NOT_FOUND'
  );
  next(error);
};

// 異步路由錯誤包裝器
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 常見錯誤快捷方法
const createError = {
  badRequest: (message, details = null) => new AppError(message, 400, 'BAD_REQUEST', details),
  unauthorized: (message = '未授權訪問') => new AppError(message, 401, 'UNAUTHORIZED'),
  forbidden: (message = '禁止訪問') => new AppError(message, 403, 'FORBIDDEN'),
  notFound: (message = '資源不存在') => new AppError(message, 404, 'NOT_FOUND'),
  conflict: (message, details = null) => new AppError(message, 409, 'CONFLICT', details),
  tooManyRequests: (message = '請求過於頻繁') => new AppError(message, 429, 'TOO_MANY_REQUESTS'),
  internal: (message = '伺服器內部錯誤') => new AppError(message, 500, 'INTERNAL_ERROR')
};

export {
  AppError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  createError
};

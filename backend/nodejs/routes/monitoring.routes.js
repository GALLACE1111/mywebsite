import express from 'express';
import monitoringService from '../services/monitoring.service.js';
import cache from '../utils/cache.js';

const router = express.Router();

/**
 * GET /api/monitoring/stats
 * 獲取完整統計報表
 */
router.get('/stats', async (req, res) => {
    try {
        const report = monitoringService.getFullReport();
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            ...report
        });
    } catch (error) {
        console.error('Error getting monitoring stats:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/monitoring/firestore
 * 獲取 Firestore 統計
 */
router.get('/firestore', (req, res) => {
    try {
        const stats = monitoringService.getFirestoreStats();
        res.json({
            success: true,
            ...stats
        });
    } catch (error) {
        console.error('Error getting Firestore stats:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/monitoring/cache
 * 獲取快取統計
 */
router.get('/cache', (req, res) => {
    try {
        const stats = monitoringService.getCacheStats();
        res.json({
            success: true,
            ...stats
        });
    } catch (error) {
        console.error('Error getting cache stats:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/monitoring/api
 * 獲取 API 調用統計
 */
router.get('/api', (req, res) => {
    try {
        const stats = monitoringService.getApiStats();
        res.json({
            success: true,
            ...stats
        });
    } catch (error) {
        console.error('Error getting API stats:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/monitoring/quota
 * 獲取配額使用情況
 */
router.get('/quota', (req, res) => {
    try {
        const quota = monitoringService.getQuotaUsage();
        res.json({
            success: true,
            ...quota
        });
    } catch (error) {
        console.error('Error getting quota usage:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/monitoring/estimation
 * 獲取每日配額預估
 */
router.get('/estimation', (req, res) => {
    try {
        const estimation = monitoringService.estimateDailyUsage();
        res.json({
            success: true,
            ...estimation
        });
    } catch (error) {
        console.error('Error getting usage estimation:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * GET /api/monitoring/recommendations
 * 獲取優化建議
 */
router.get('/recommendations', (req, res) => {
    try {
        const recommendations = monitoringService.getRecommendations();
        res.json({
            success: true,
            recommendations: recommendations
        });
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * POST /api/monitoring/reset
 * 重置統計（僅用於測試）
 * ⚠️ 生產環境應該添加身份驗證
 */
router.post('/reset', (req, res) => {
    try {
        monitoringService.reset();
        res.json({
            success: true,
            message: 'Monitoring stats reset successfully'
        });
    } catch (error) {
        console.error('Error resetting stats:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

/**
 * DELETE /api/monitoring/cache
 * 清除所有快取
 * ⚠️ 生產環境應該添加身份驗證
 */
router.delete('/cache', async (req, res) => {
    try {
        await cache.clear();
        res.json({
            success: true,
            message: 'Cache cleared successfully'
        });
    } catch (error) {
        console.error('Error clearing cache:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

export default router;

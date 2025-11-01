/**
 * 配額監控服務
 *
 * 功能：
 * - 追蹤 Firestore 讀取/寫入次數
 * - 追蹤快取命中率
 * - 提供統計報表
 * - 預估配額使用情況
 */

import { getCache } from '../utils/cache.js';

class MonitoringService {
    constructor() {
        // Firestore 操作計數器
        this.firestoreStats = {
            reads: 0,
            writes: 0,
            deletes: 0,
            startTime: new Date()
        };

        // API 調用計數器
        this.apiStats = {
            getLeaderboard: 0,
            getUserRank: 0,
            getUserRankWithContext: 0,
            submitScore: 0,
            total: 0
        };

        // 每日限制（Spark 方案）
        this.dailyLimits = {
            reads: 50000,
            writes: 20000,
            deletes: 20000
        };
    }

    /**
     * 記錄 Firestore 讀取
     * @param {number} count - 讀取次數
     */
    recordRead(count = 1) {
        this.firestoreStats.reads += count;
    }

    /**
     * 記錄 Firestore 寫入
     * @param {number} count - 寫入次數
     */
    recordWrite(count = 1) {
        this.firestoreStats.writes += count;
    }

    /**
     * 記錄 Firestore 刪除
     * @param {number} count - 刪除次數
     */
    recordDelete(count = 1) {
        this.firestoreStats.deletes += count;
    }

    /**
     * 記錄 API 調用
     * @param {string} endpoint - API endpoint 名稱
     */
    recordApiCall(endpoint) {
        if (this.apiStats[endpoint] !== undefined) {
            this.apiStats[endpoint]++;
        }
        this.apiStats.total++;
    }

    /**
     * 獲取 Firestore 統計
     */
    getFirestoreStats() {
        const now = new Date();
        const uptimeMs = now - this.firestoreStats.startTime;
        const uptimeHours = (uptimeMs / (1000 * 60 * 60)).toFixed(2);

        return {
            reads: this.firestoreStats.reads,
            writes: this.firestoreStats.writes,
            deletes: this.firestoreStats.deletes,
            total: this.firestoreStats.reads + this.firestoreStats.writes + this.firestoreStats.deletes,
            uptime: {
                ms: uptimeMs,
                hours: parseFloat(uptimeHours),
                startTime: this.firestoreStats.startTime.toISOString()
            }
        };
    }

    /**
     * 獲取快取統計
     */
    getCacheStats() {
        return getCache().getStats();
    }

    /**
     * 獲取 API 統計
     */
    getApiStats() {
        return {
            ...this.apiStats,
            mostUsed: this.getMostUsedEndpoint()
        };
    }

    /**
     * 獲取最常使用的 endpoint
     */
    getMostUsedEndpoint() {
        const endpoints = { ...this.apiStats };
        delete endpoints.total;
        delete endpoints.mostUsed;

        let maxEndpoint = null;
        let maxCount = 0;

        for (const [endpoint, count] of Object.entries(endpoints)) {
            if (count > maxCount) {
                maxCount = count;
                maxEndpoint = endpoint;
            }
        }

        return maxEndpoint ? { endpoint: maxEndpoint, count: maxCount } : null;
    }

    /**
     * 獲取配額使用百分比
     */
    getQuotaUsage() {
        return {
            reads: {
                used: this.firestoreStats.reads,
                limit: this.dailyLimits.reads,
                percentage: ((this.firestoreStats.reads / this.dailyLimits.reads) * 100).toFixed(2) + '%',
                remaining: this.dailyLimits.reads - this.firestoreStats.reads
            },
            writes: {
                used: this.firestoreStats.writes,
                limit: this.dailyLimits.writes,
                percentage: ((this.firestoreStats.writes / this.dailyLimits.writes) * 100).toFixed(2) + '%',
                remaining: this.dailyLimits.writes - this.firestoreStats.writes
            },
            deletes: {
                used: this.firestoreStats.deletes,
                limit: this.dailyLimits.deletes,
                percentage: ((this.firestoreStats.deletes / this.dailyLimits.deletes) * 100).toFixed(2) + '%',
                remaining: this.dailyLimits.deletes - this.firestoreStats.deletes
            }
        };
    }

    /**
     * 預估每日配額使用
     */
    estimateDailyUsage() {
        const now = new Date();
        const uptimeMs = now - this.firestoreStats.startTime;
        const uptimeHours = uptimeMs / (1000 * 60 * 60);

        // 如果運行時間少於 1 小時，數據不夠準確
        if (uptimeHours < 1) {
            return {
                reliable: false,
                message: 'Not enough data (需要至少 1 小時的數據)'
            };
        }

        const msPerDay = 24 * 60 * 60 * 1000;
        const projectionFactor = msPerDay / uptimeMs;

        const estimatedReads = Math.round(this.firestoreStats.reads * projectionFactor);
        const estimatedWrites = Math.round(this.firestoreStats.writes * projectionFactor);
        const estimatedDeletes = Math.round(this.firestoreStats.deletes * projectionFactor);

        return {
            reliable: uptimeHours >= 1,
            basedOnHours: parseFloat(uptimeHours.toFixed(2)),
            estimated: {
                reads: {
                    value: estimatedReads,
                    withinLimit: estimatedReads <= this.dailyLimits.reads,
                    percentage: ((estimatedReads / this.dailyLimits.reads) * 100).toFixed(2) + '%'
                },
                writes: {
                    value: estimatedWrites,
                    withinLimit: estimatedWrites <= this.dailyLimits.writes,
                    percentage: ((estimatedWrites / this.dailyLimits.writes) * 100).toFixed(2) + '%'
                },
                deletes: {
                    value: estimatedDeletes,
                    withinLimit: estimatedDeletes <= this.dailyLimits.deletes,
                    percentage: ((estimatedDeletes / this.dailyLimits.deletes) * 100).toFixed(2) + '%'
                }
            },
            warning: estimatedReads > this.dailyLimits.reads || estimatedWrites > this.dailyLimits.writes
        };
    }

    /**
     * 獲取完整報表
     */
    getFullReport() {
        return {
            firestore: this.getFirestoreStats(),
            cache: this.getCacheStats(),
            api: this.getApiStats(),
            quota: this.getQuotaUsage(),
            estimation: this.estimateDailyUsage(),
            recommendations: this.getRecommendations()
        };
    }

    /**
     * 獲取優化建議
     */
    getRecommendations() {
        const recommendations = [];
        const cacheStats = this.getCacheStats();
        const quotaUsage = this.getQuotaUsage();

        // 檢查快取命中率
        if (cacheStats.hitRate) {
            const hitRate = parseFloat(cacheStats.hitRate);
            if (hitRate < 50) {
                recommendations.push({
                    type: 'cache',
                    priority: 'high',
                    message: `快取命中率較低 (${cacheStats.hitRate})，建議增加快取時間或檢查快取策略`
                });
            }
        }

        // 檢查配額使用
        const readsPercentage = parseFloat(quotaUsage.reads.percentage);
        if (readsPercentage > 80) {
            recommendations.push({
                type: 'quota',
                priority: 'critical',
                message: `讀取配額使用已超過 80% (${quotaUsage.reads.percentage})，建議立即優化或升級方案`
            });
        } else if (readsPercentage > 60) {
            recommendations.push({
                type: 'quota',
                priority: 'medium',
                message: `讀取配額使用超過 60% (${quotaUsage.reads.percentage})，建議監控並考慮優化`
            });
        }

        // 檢查每日預估
        const estimation = this.estimateDailyUsage();
        if (estimation.reliable && estimation.warning) {
            recommendations.push({
                type: 'projection',
                priority: 'high',
                message: '根據當前使用率，預計今日配額可能不足，請立即採取優化措施'
            });
        }

        if (recommendations.length === 0) {
            recommendations.push({
                type: 'status',
                priority: 'info',
                message: '系統運行正常，配額使用在合理範圍內'
            });
        }

        return recommendations;
    }

    /**
     * 重置統計（僅用於測試）
     */
    reset() {
        this.firestoreStats = {
            reads: 0,
            writes: 0,
            deletes: 0,
            startTime: new Date()
        };

        this.apiStats = {
            getLeaderboard: 0,
            getUserRank: 0,
            getUserRankWithContext: 0,
            submitScore: 0,
            total: 0
        };

        console.log('📊 Monitoring stats reset');
    }
}

export default new MonitoringService();

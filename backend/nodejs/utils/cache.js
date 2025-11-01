/**
 * 統一快取模組
 *
 * 用途：減少 Firestore 讀取次數，節省配額
 *
 * 快取策略：
 * - 排行榜數據: 60 秒 TTL（高頻讀取）
 * - 用戶排名: 30 秒 TTL（中頻讀取）
 * - Metadata 總數: 30 秒 TTL（輔助數據）
 *
 * 支持：
 * - 記憶體快取（預設）
 * - Redis 快取（透過環境變數 USE_REDIS=true 啟用）
 */

import RedisCache from './redis-cache.js';
import dotenv from 'dotenv';

dotenv.config();

class MemoryCache {
    constructor() {
        this.cache = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0
        };
    }

    /**
     * 設置快取
     * @param {string} key - 快取鍵
     * @param {*} value - 快取值
     * @param {number} ttl - 存活時間（毫秒）
     */
    set(key, value, ttl = 60000) {
        const expiresAt = Date.now() + ttl;
        this.cache.set(key, { value, expiresAt });
        this.stats.sets++;
    }

    /**
     * 獲取快取
     * @param {string} key - 快取鍵
     * @returns {*} 快取值，如果不存在或過期則返回 null
     */
    get(key) {
        const item = this.cache.get(key);

        if (!item) {
            this.stats.misses++;
            return null;
        }

        // 檢查是否過期
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            this.stats.misses++;
            return null;
        }

        this.stats.hits++;
        return item.value;
    }

    /**
     * 刪除快取
     * @param {string} key - 快取鍵
     */
    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.stats.deletes++;
        }
        return deleted;
    }

    /**
     * 清除所有快取
     */
    clear() {
        this.cache.clear();
        console.log('🗑️ All cache cleared');
    }

    /**
     * 清除匹配模式的快取
     * @param {string} pattern - 匹配模式（支持萬用字元 *）
     */
    clearPattern(pattern) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        let deletedCount = 0;

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
                deletedCount++;
            }
        }

        this.stats.deletes += deletedCount;
        console.log(`🗑️ Cleared ${deletedCount} cache entries matching: ${pattern}`);
        return deletedCount;
    }

    /**
     * 清理過期的快取項目
     */
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiresAt) {
                this.cache.delete(key);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            console.log(`🧹 Cleaned ${cleanedCount} expired cache entries`);
        }
    }

    /**
     * 獲取快取統計信息
     */
    getStats() {
        const hitRate = this.stats.hits + this.stats.misses > 0
            ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2)
            : 0;

        return {
            ...this.stats,
            hitRate: `${hitRate}%`,
            size: this.cache.size
        };
    }

    /**
     * 重置統計信息
     */
    resetStats() {
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0
        };
    }
}

// ============ 快取初始化 ============
// 根據環境變數決定使用 Memory 或 Redis

let cache;
let cacheInitialized = false;

/**
 * 初始化快取系統
 */
export async function initializeCache() {
    if (cacheInitialized) {
        return cache;
    }

    const useRedis = process.env.USE_REDIS === 'true';

    if (useRedis) {
        console.log('🔄 Initializing Redis cache...');
        const redisCache = new RedisCache();
        const connected = await redisCache.connect();

        if (connected) {
            cache = redisCache;
            console.log('✅ Redis cache initialized');
        } else {
            console.warn('⚠️ Redis connection failed, falling back to memory cache');
            cache = new MemoryCache();

            // 定期清理過期快取（僅記憶體快取需要）
            setInterval(() => {
                cache.cleanup();
            }, 5 * 60 * 1000);
        }
    } else {
        console.log('✅ Memory cache initialized');
        cache = new MemoryCache();

        // 定期清理過期快取
        setInterval(() => {
            cache.cleanup();
        }, 5 * 60 * 1000);
    }

    cacheInitialized = true;
    return cache;
}

// 立即初始化（非阻塞）
initializeCache().catch(err => {
    console.error('❌ Cache initialization error:', err);
    // 降級到記憶體快取
    cache = new MemoryCache();
    cacheInitialized = true;
});

// 快取鍵生成器
export const CacheKeys = {
    // 排行榜快取鍵: leaderboard:{page}:{limit}
    leaderboard: (page, limit) => `leaderboard:${page}:${limit}`,

    // 用戶排名快取鍵: rank:{userId}
    userRank: (userId) => `rank:${userId}`,

    // 用戶周圍排名快取鍵: around:{userId}:{range}
    userRankWithContext: (userId, range) => `around:${userId}:${range}`,

    // Metadata 總數快取鍵
    totalUsers: () => 'metadata:totalUsers',

    // 清除所有與用戶相關的快取
    clearUser: async (userId) => {
        await cache.clearPattern(`rank:${userId}`);
        await cache.clearPattern(`around:${userId}:*`);
    },

    // 清除所有排行榜相關的快取
    clearLeaderboard: async () => {
        await cache.clearPattern('leaderboard:*');
        await cache.clearPattern('rank:*');
        await cache.clearPattern('around:*');
        await cache.delete('metadata:totalUsers');
    }
};

// TTL 配置（毫秒）
export const CacheTTL = {
    LEADERBOARD: 60 * 1000,      // 60 秒 - 排行榜
    USER_RANK: 30 * 1000,        // 30 秒 - 用戶排名
    METADATA: 30 * 1000,         // 30 秒 - Metadata
    SHORT: 10 * 1000,            // 10 秒 - 短期快取
};

// 獲取 cache 實例的 getter 函數
export function getCache() {
    if (!cache) {
        console.warn('⚠️ Cache not initialized yet, using temporary memory cache');
        return new MemoryCache();
    }
    return cache;
}

export default cache;

/**
 * Redis 快取適配器
 *
 * 功能：
 * - 連接 Redis 服務器
 * - 提供與 MemoryCache 相同的接口
 * - 支持自動重連
 * - 支持序列化/反序列化
 */

import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

class RedisCache {
    constructor() {
        this.client = null;
        this.isConnected = false;
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            errors: 0
        };
    }

    /**
     * 連接 Redis
     */
    async connect() {
        if (this.isConnected) {
            console.log('✅ Redis already connected');
            return true;
        }

        try {
            const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

            this.client = createClient({
                url: redisUrl,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            console.error('❌ Redis reconnection failed after 10 attempts');
                            return new Error('Redis reconnection limit reached');
                        }
                        const delay = Math.min(retries * 100, 3000);
                        console.log(`🔄 Redis reconnecting in ${delay}ms...`);
                        return delay;
                    }
                }
            });

            // 錯誤處理
            this.client.on('error', (err) => {
                console.error('❌ Redis Client Error:', err);
                this.stats.errors++;
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                console.log('🔌 Redis connecting...');
            });

            this.client.on('ready', () => {
                console.log('✅ Redis connected and ready');
                this.isConnected = true;
            });

            this.client.on('reconnecting', () => {
                console.log('🔄 Redis reconnecting...');
                this.isConnected = false;
            });

            await this.client.connect();
            this.isConnected = true;

            return true;
        } catch (error) {
            console.error('❌ Redis connection failed:', error.message);
            this.isConnected = false;
            return false;
        }
    }

    /**
     * 斷開 Redis 連接
     */
    async disconnect() {
        if (this.client && this.isConnected) {
            await this.client.quit();
            this.isConnected = false;
            console.log('🔌 Redis disconnected');
        }
    }

    /**
     * 檢查是否已連接
     */
    checkConnection() {
        if (!this.isConnected || !this.client) {
            console.warn('⚠️ Redis not connected, operation skipped');
            return false;
        }
        return true;
    }

    /**
     * 設置快取
     * @param {string} key - 快取鍵
     * @param {*} value - 快取值
     * @param {number} ttl - 存活時間（毫秒）
     */
    async set(key, value, ttl = 60000) {
        if (!this.checkConnection()) return false;

        try {
            const serialized = JSON.stringify(value);
            const ttlSeconds = Math.ceil(ttl / 1000);

            await this.client.setEx(key, ttlSeconds, serialized);
            this.stats.sets++;
            return true;
        } catch (error) {
            console.error('❌ Redis set error:', error.message);
            this.stats.errors++;
            return false;
        }
    }

    /**
     * 獲取快取
     * @param {string} key - 快取鍵
     * @returns {*} 快取值，如果不存在則返回 null
     */
    async get(key) {
        if (!this.checkConnection()) return null;

        try {
            const value = await this.client.get(key);

            if (!value) {
                this.stats.misses++;
                return null;
            }

            this.stats.hits++;
            return JSON.parse(value);
        } catch (error) {
            console.error('❌ Redis get error:', error.message);
            this.stats.errors++;
            this.stats.misses++;
            return null;
        }
    }

    /**
     * 刪除快取
     * @param {string} key - 快取鍵
     */
    async delete(key) {
        if (!this.checkConnection()) return false;

        try {
            const deleted = await this.client.del(key);
            if (deleted > 0) {
                this.stats.deletes++;
            }
            return deleted > 0;
        } catch (error) {
            console.error('❌ Redis delete error:', error.message);
            this.stats.errors++;
            return false;
        }
    }

    /**
     * 清除所有快取
     */
    async clear() {
        if (!this.checkConnection()) return false;

        try {
            await this.client.flushDb();
            console.log('🗑️ All Redis cache cleared');
            return true;
        } catch (error) {
            console.error('❌ Redis clear error:', error.message);
            this.stats.errors++;
            return false;
        }
    }

    /**
     * 清除匹配模式的快取
     * @param {string} pattern - 匹配模式（支持 Redis 通配符）
     */
    async clearPattern(pattern) {
        if (!this.checkConnection()) return 0;

        try {
            const keys = await this.client.keys(pattern);

            if (keys.length === 0) {
                console.log(`🗑️ No cache entries found matching: ${pattern}`);
                return 0;
            }

            const deleted = await this.client.del(keys);
            this.stats.deletes += deleted;
            console.log(`🗑️ Cleared ${deleted} Redis cache entries matching: ${pattern}`);
            return deleted;
        } catch (error) {
            console.error('❌ Redis clearPattern error:', error.message);
            this.stats.errors++;
            return 0;
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
            connected: this.isConnected,
            type: 'redis'
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
            deletes: 0,
            errors: 0
        };
    }

    /**
     * 獲取 Redis 信息
     */
    async getInfo() {
        if (!this.checkConnection()) return null;

        try {
            const info = await this.client.info();
            const dbSize = await this.client.dbSize();

            return {
                connected: this.isConnected,
                dbSize: dbSize,
                info: info
            };
        } catch (error) {
            console.error('❌ Redis getInfo error:', error.message);
            return null;
        }
    }
}

export default RedisCache;

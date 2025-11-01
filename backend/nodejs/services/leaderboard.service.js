import { getFirestore, admin } from '../config/firebase.js';
import { getCache, CacheKeys, CacheTTL } from '../utils/cache.js';

// ============ 排行榜服務 ============
// 數據庫: Firebase Firestore (NoSQL，非 MySQL)
// 玩家上限: 100人 (Firebase 免費版限制)
// 注意: 免費版有每日讀寫配額限制，不可隨意擴展
//
// 優化策略:
// ✅ 記憶體快取 - 減少 60-80% 的 Firestore 讀取
// ✅ Metadata 計數器 - 避免全集合掃描
// ✅ 快取失效機制 - 確保數據一致性

class LeaderboardService {
    constructor() {
        this.db = null;
    }

    getDb() {
        if (!this.db) {
            this.db = getFirestore();
        }
        return this.db;
    }

    /**
     * 獲取 Metadata 統計數據（帶快取）
     * 用途：避免每次都查詢整個集合來計算總數
     * 快取時間：30 秒
     */
    async getMetadata() {
        // 檢查快取
        const cached = getCache().get(CacheKeys.totalUsers());
        if (cached) {
            console.log('💾 [Cache Hit] Metadata from cache');
            return cached;
        }

        // 從 Firestore 讀取
        const db = this.getDb();
        const metadataDoc = await db.collection('metadata').doc('stats').get();

        let metadata = {
            totalUsers: 0,
            totalPlayers: 0
        };

        if (metadataDoc.exists) {
            const data = metadataDoc.data();
            metadata = {
                totalUsers: data.totalUsers || 0,
                totalPlayers: data.totalPlayers || 0
            };
            console.log(`📊 [Firestore] Metadata loaded: ${metadata.totalUsers} users`);
        } else {
            console.warn('⚠️ Metadata not found, please run init-metadata.js');
        }

        // 快取 30 秒
        getCache().set(CacheKeys.totalUsers(), metadata, CacheTTL.METADATA);
        return metadata;
    }

    /**
     * 更新 Metadata 統計數據
     * 用途：在提交分數時同步更新，避免重新計算
     */
    async updateMetadata(isNewUser = false) {
        try {
            const db = this.getDb();
            const metadataRef = db.collection('metadata').doc('stats');

            if (isNewUser) {
                // 新用戶，增加計數
                await metadataRef.update({
                    totalUsers: admin.firestore.FieldValue.increment(1),
                    totalPlayers: admin.firestore.FieldValue.increment(1),
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // 只更新時間戳
                await metadataRef.update({
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                });
            }

            // 清除快取以獲取最新數據
            getCache().delete(CacheKeys.totalUsers());
            console.log('📊 Metadata updated');
        } catch (error) {
            console.error('❌ Error updating metadata:', error.message);
            // 不拋出錯誤，避免影響主流程
        }
    }

    async getLeaderboard(page = 1, limit = 50) {
        try {
            page = parseInt(page);
            limit = parseInt(limit);

            // 檢查快取
            const cacheKey = CacheKeys.leaderboard(page, limit);
            const cached = getCache().get(cacheKey);
            if (cached) {
                console.log(`💾 [Cache Hit] Leaderboard page ${page} from cache`);
                return cached;
            }

            const db = this.getDb();
            const offset = (page - 1) * limit;

            // ✅ 優化 1: 使用 Metadata 獲取總數（減少 1 次查詢）
            const metadata = await this.getMetadata();
            const total = metadata.totalUsers;

            // 获取排行榜数据,按 totalScore 降序排序
            const snapshot = await db.collection('userTotals')
                .where('totalScore', '>', 0)
                .orderBy('totalScore', 'desc')
                .orderBy('lastUpdated', 'asc') // 分数相同时,先达到的排前面
                .offset(offset)
                .limit(limit)
                .get();

            const leaderboard = [];
            snapshot.forEach((doc, index) => {
                const data = doc.data();
                leaderboard.push({
                    rank: offset + index + 1,
                    user_id: doc.id,
                    username: data.username || `User ${doc.id}`,
                    total_score: data.totalScore || 0  // ✅ 改為 snake_case
                });
            });

            const result = {
                success: true,
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
                data: leaderboard
            };

            // ✅ 優化 2: 快取結果 60 秒
            getCache().set(cacheKey, result, CacheTTL.LEADERBOARD);
            console.log(`📊 [Firestore] Leaderboard page ${page} loaded and cached`);

            return result;
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            throw error;
        }
    }

    async getUserRank(userId) {
        try {
            userId = String(userId);

            // 檢查快取
            const cacheKey = CacheKeys.userRank(userId);
            const cached = getCache().get(cacheKey);
            if (cached) {
                console.log(`💾 [Cache Hit] User rank for ${userId} from cache`);
                return cached;
            }

            const db = this.getDb();

            // 获取用户数据
            const userDoc = await db.collection('userTotals').doc(userId).get();

            if (!userDoc.exists) {
                return {
                    success: true,
                    user_id: userId,
                    rank: null,
                    total_score: null,  // ✅ 改為 snake_case
                    message: 'User not found in leaderboard'
                };
            }

            const userData = userDoc.data();
            const userScore = userData.totalScore || 0;
            const username = userData.username;

            // 计算排名:分数比自己高的用户数量 + 1
            const higherScoresSnapshot = await db.collection('userTotals')
                .where('totalScore', '>', userScore)
                .get();

            // 对于分数相同的情况,检查 lastUpdated 更早的
            const sameScoreSnapshot = await db.collection('userTotals')
                .where('totalScore', '==', userScore)
                .where('lastUpdated', '<', userData.lastUpdated)
                .get();

            const rank = higherScoresSnapshot.size + sameScoreSnapshot.size + 1;

            // ✅ 優化: 使用 Metadata 獲取總數（減少 1 次查詢）
            const metadata = await this.getMetadata();
            const total = metadata.totalUsers;

            const result = {
                success: true,
                user_id: userId,
                username: username || `User ${userId}`,
                rank: rank,
                total_score: userScore,  // ✅ 改為 snake_case
                total_users: total,
                percentile: total > 0 ? ((total - rank + 1) / total * 100).toFixed(2) + '%' : '0%'
            };

            // ✅ 快取結果 30 秒
            getCache().set(cacheKey, result, CacheTTL.USER_RANK);
            console.log(`📊 [Firestore] User rank for ${userId} loaded and cached`);

            return result;
        } catch (error) {
            console.error('Error getting user rank:', error);
            throw error;
        }
    }

    async getUserRankWithContext(userId, range = 5) {
        try {
            userId = String(userId);
            range = parseInt(range);

            // 檢查快取
            const cacheKey = CacheKeys.userRankWithContext(userId, range);
            const cached = getCache().get(cacheKey);
            if (cached) {
                console.log(`💾 [Cache Hit] User context for ${userId} from cache`);
                return cached;
            }

            // ✅ 優化: 復用 getUserRank 的快取
            const userRankResult = await this.getUserRank(userId);
            if (!userRankResult.success || userRankResult.rank === null) {
                return { success: false, message: 'User not found in leaderboard' };
            }

            const db = this.getDb();
            const userRank = userRankResult.rank;
            const start = Math.max(1, userRank - range);
            const limit = range * 2 + 1;
            const offset = start - 1;

            // 获取周围的排名
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
                    total_score: data.totalScore || 0,  // ✅ 改為 snake_case
                    is_current_user: doc.id === userId
                });
            });

            const result = {
                success: true,
                user_id: userId,
                user_rank: userRank,
                data: leaderboard
            };

            // ✅ 快取結果 30 秒
            getCache().set(cacheKey, result, CacheTTL.USER_RANK);
            console.log(`📊 [Firestore] User context for ${userId} loaded and cached`);

            return result;
        } catch (error) {
            console.error('Error getting user rank with context:', error);
            throw error;
        }
    }

    async submitScore(userId, score, gameType = 'default') {
        try {
            const db = this.getDb();
            userId = String(userId);
            score = parseInt(score);

            // 使用事务确保数据一致性
            const result = await db.runTransaction(async (transaction) => {
                // ✅ Firestore 要求：所有讀取必須在寫入之前完成

                // 1. 先執行所有讀取操作
                const userRef = db.collection('users').doc(userId);
                const userTotalRef = db.collection('userTotals').doc(userId);

                const userDoc = await transaction.get(userRef);
                const userTotalDoc = await transaction.get(userTotalRef);

                // 2. 處理讀取結果
                const isNewUser = !userDoc.exists;
                const isNewUserTotal = !userTotalDoc.exists;

                const username = userDoc.exists ?
                    userDoc.data().username : `User ${userId}`;

                // 3. 執行所有寫入操作
                if (isNewUser) {
                    // 如果用户不存在,创建用户
                    transaction.set(userRef, {
                        username: `User ${userId}`,
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }

                // 添加分数记录
                const scoreRef = db.collection('scores').doc();
                transaction.set(scoreRef, {
                    userId: userId,
                    score: score,
                    gameType: gameType,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // 更新用户总分（✅ 覆蓋式更新，不累加）

                if (userTotalDoc.exists) {
                    // ✅ 直接設定為新的總分，不累加
                    transaction.update(userTotalRef, {
                        totalScore: score,
                        username: username,
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
                    score: score,
                    isNewUserTotal: isNewUserTotal
                };
            });

            // ✅ 優化: 更新 Metadata（在 transaction 外執行，避免衝突）
            await this.updateMetadata(result.isNewUserTotal);

            // ✅ 優化: 清除所有相關快取 (異步)
            await CacheKeys.clearLeaderboard();
            console.log('🗑️ All leaderboard cache cleared after score submission');

            return {
                success: true,
                score_id: result.scoreId,
                user_id: result.userId,
                total_score: result.score,  // ✅ 改為 snake_case
                message: 'Score submitted successfully'
            };
        } catch (error) {
            console.error('Error submitting score:', error);
            throw error;
        }
    }

    // ============ 管理功能 ============
    // ⚠️ 注意：這些方法應該受到身份驗證保護

    /**
     * 刪除特定玩家的所有資料
     * @param {string} userId - 玩家 ID
     * @returns {Object} 刪除結果
     */
    async deletePlayer(userId) {
        try {
            const db = this.getDb();
            userId = String(userId);

            // 1. 檢查玩家是否存在
            const userTotalDoc = await db.collection('userTotals').doc(userId).get();

            if (!userTotalDoc.exists) {
                return {
                    success: false,
                    message: 'Player not found'
                };
            }

            const userData = userTotalDoc.data();

            // 2. 使用批次操作刪除資料
            const batch = db.batch();

            // 2.1 刪除 userTotals
            batch.delete(db.collection('userTotals').doc(userId));

            // 2.2 刪除 users
            batch.delete(db.collection('users').doc(userId));

            // 2.3 查找並刪除所有分數記錄
            const scoresSnapshot = await db.collection('scores')
                .where('userId', '==', userId)
                .get();

            scoresSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });

            // 3. 執行批次刪除
            await batch.commit();

            // 4. 更新 metadata（減少 1 個玩家）
            try {
                const metadataRef = db.collection('metadata').doc('stats');
                await metadataRef.update({
                    totalUsers: admin.firestore.FieldValue.increment(-1),
                    totalPlayers: admin.firestore.FieldValue.increment(-1),
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                });
            } catch (metadataError) {
                console.warn('⚠️ Failed to update metadata:', metadataError.message);
            }

            // 5. 清除所有快取
            CacheKeys.clearLeaderboard();
            console.log(`✅ Player ${userId} deleted successfully`);

            return {
                success: true,
                user_id: userId,
                username: userData.username,
                deleted_scores: scoresSnapshot.size,
                message: 'Player deleted successfully'
            };
        } catch (error) {
            console.error('Error deleting player:', error);
            throw error;
        }
    }

    /**
     * 重置玩家分數為 0
     * @param {string} userId - 玩家 ID
     * @param {boolean} deleteHistory - 是否刪除歷史記錄
     * @returns {Object} 重置結果
     */
    async resetPlayerScore(userId, deleteHistory = false) {
        try {
            const db = this.getDb();
            userId = String(userId);

            // 1. 檢查玩家是否存在
            const userTotalDoc = await db.collection('userTotals').doc(userId).get();

            if (!userTotalDoc.exists) {
                return {
                    success: false,
                    message: 'Player not found'
                };
            }

            const userData = userTotalDoc.data();
            const oldScore = userData.totalScore || 0;

            // 2. 重置分數
            await db.collection('userTotals').doc(userId).update({
                totalScore: 0,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            });

            let deletedScores = 0;

            // 3. 可選：刪除歷史分數記錄
            if (deleteHistory) {
                const scoresSnapshot = await db.collection('scores')
                    .where('userId', '==', userId)
                    .get();

                if (!scoresSnapshot.empty) {
                    const batch = db.batch();
                    scoresSnapshot.forEach(doc => {
                        batch.delete(doc.ref);
                    });
                    await batch.commit();
                    deletedScores = scoresSnapshot.size;
                }
            }

            // 4. 清除相關快取
            CacheKeys.clearLeaderboard();
            console.log(`✅ Player ${userId} score reset to 0`);

            return {
                success: true,
                user_id: userId,
                username: userData.username,
                old_score: oldScore,
                new_score: 0,
                deleted_history: deleteHistory,
                deleted_scores: deletedScores,
                message: 'Score reset successfully'
            };
        } catch (error) {
            console.error('Error resetting player score:', error);
            throw error;
        }
    }

    /**
     * 清空整個排行榜
     * ⚠️ 危險操作！會刪除所有玩家資料
     * @returns {Object} 清空結果
     */
    async clearLeaderboard() {
        try {
            const db = this.getDb();

            // 1. 統計現有資料
            const [usersSnapshot, userTotalsSnapshot, scoresSnapshot] = await Promise.all([
                db.collection('users').get(),
                db.collection('userTotals').get(),
                db.collection('scores').get()
            ]);

            const stats = {
                users: usersSnapshot.size,
                userTotals: userTotalsSnapshot.size,
                scores: scoresSnapshot.size,
                total: usersSnapshot.size + userTotalsSnapshot.size + scoresSnapshot.size
            };

            // 2. 如果已經是空的，直接返回
            if (stats.total === 0) {
                return {
                    success: true,
                    message: 'Leaderboard is already empty',
                    stats: stats
                };
            }

            // 3. 刪除 userTotals
            if (!userTotalsSnapshot.empty) {
                const batch1 = db.batch();
                userTotalsSnapshot.forEach(doc => {
                    batch1.delete(doc.ref);
                });
                await batch1.commit();
            }

            // 4. 刪除 users
            if (!usersSnapshot.empty) {
                const batch2 = db.batch();
                usersSnapshot.forEach(doc => {
                    batch2.delete(doc.ref);
                });
                await batch2.commit();
            }

            // 5. 刪除 scores (可能需要分批處理以符合 Firestore 限制)
            if (!scoresSnapshot.empty) {
                const batchSize = 500; // Firestore 批次限制

                for (let i = 0; i < scoresSnapshot.docs.length; i += batchSize) {
                    const batch = db.batch();
                    const batchDocs = scoresSnapshot.docs.slice(i, i + batchSize);

                    batchDocs.forEach(doc => {
                        batch.delete(doc.ref);
                    });

                    await batch.commit();
                }
            }

            // 6. 重置 metadata
            await db.collection('metadata').doc('stats').set({
                totalUsers: 0,
                totalPlayers: 0,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                lastCalculated: admin.firestore.FieldValue.serverTimestamp(),
                version: '1.0.0'
            });

            // 7. 清除所有快取
            CacheKeys.clearLeaderboard();
            console.log('✅ Leaderboard cleared successfully');

            return {
                success: true,
                message: 'Leaderboard cleared successfully',
                stats: stats
            };
        } catch (error) {
            console.error('Error clearing leaderboard:', error);
            throw error;
        }
    }

    /**
     * 獲取所有玩家列表（管理用）
     * @param {number} page - 頁碼
     * @param {number} limit - 每頁數量
     * @returns {Object} 玩家列表
     */
    async getAllPlayers(page = 1, limit = 50) {
        try {
            const db = this.getDb();
            page = parseInt(page);
            limit = Math.min(parseInt(limit), 200);
            const offset = (page - 1) * limit;

            // 獲取總數
            const metadata = await this.getMetadata();
            const total = metadata.totalUsers;

            // 獲取玩家列表
            const snapshot = await db.collection('userTotals')
                .orderBy('totalScore', 'desc')
                .orderBy('lastUpdated', 'asc')
                .offset(offset)
                .limit(limit)
                .get();

            const players = [];
            snapshot.forEach((doc, index) => {
                const data = doc.data();
                players.push({
                    rank: offset + index + 1,
                    user_id: doc.id,
                    username: data.username || `User ${doc.id}`,
                    total_score: data.totalScore || 0,
                    last_updated: data.lastUpdated ? data.lastUpdated.toDate().toISOString() : null
                });
            });

            return {
                success: true,
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
                data: players
            };
        } catch (error) {
            console.error('Error getting all players:', error);
            throw error;
        }
    }
}

export default new LeaderboardService();

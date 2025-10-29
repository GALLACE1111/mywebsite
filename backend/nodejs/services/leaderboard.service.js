import { getFirestore, admin } from '../config/firebase.js';

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

    async getLeaderboard(page = 1, limit = 50) {
        try {
            const db = this.getDb();
            page = parseInt(page);
            limit = parseInt(limit);
            const offset = (page - 1) * limit;

            // 获取排行榜数据,按 totalScore 降序排序
            const snapshot = await db.collection('userTotals')
                .where('totalScore', '>', 0)
                .orderBy('totalScore', 'desc')
                .orderBy('lastUpdated', 'asc') // 分数相同时,先达到的排前面
                .offset(offset)
                .limit(limit)
                .get();

            // 获取总数
            const totalSnapshot = await db.collection('userTotals')
                .where('totalScore', '>', 0)
                .get();
            const total = totalSnapshot.size;

            const leaderboard = [];
            snapshot.forEach((doc, index) => {
                const data = doc.data();
                leaderboard.push({
                    rank: offset + index + 1,
                    user_id: doc.id,
                    username: data.username || `User ${doc.id}`,
                    score: data.totalScore || 0
                });
            });

            return {
                success: true,
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
                data: leaderboard
            };
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            throw error;
        }
    }

    async getUserRank(userId) {
        try {
            const db = this.getDb();
            userId = String(userId);

            // 获取用户数据
            const userDoc = await db.collection('userTotals').doc(userId).get();

            if (!userDoc.exists) {
                return {
                    success: true,
                    user_id: userId,
                    rank: null,
                    score: null,
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

            // 获取总用户数
            const totalSnapshot = await db.collection('userTotals')
                .where('totalScore', '>', 0)
                .get();
            const total = totalSnapshot.size;

            return {
                success: true,
                user_id: userId,
                username: username || `User ${userId}`,
                rank: rank,
                score: userScore,
                total_users: total,
                percentile: total > 0 ? ((total - rank + 1) / total * 100).toFixed(2) + '%' : '0%'
            };
        } catch (error) {
            console.error('Error getting user rank:', error);
            throw error;
        }
    }

    async getUserRankWithContext(userId, range = 5) {
        try {
            const db = this.getDb();
            userId = String(userId);
            range = parseInt(range);

            // 先获取用户排名
            const userRankResult = await this.getUserRank(userId);
            if (!userRankResult.success || userRankResult.rank === null) {
                return { success: false, message: 'User not found in leaderboard' };
            }

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
                    score: data.totalScore || 0,
                    is_current_user: doc.id === userId
                });
            });

            return {
                success: true,
                user_id: userId,
                user_rank: userRank,
                data: leaderboard
            };
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
                // 检查用户是否存在
                const userRef = db.collection('users').doc(userId);
                const userDoc = await transaction.get(userRef);

                if (!userDoc.exists) {
                    // 如果用户不存在,创建用户
                    transaction.set(userRef, {
                        username: `User ${userId}`,
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }

                const username = userDoc.exists ?
                    userDoc.data().username : `User ${userId}`;

                // 添加分数记录
                const scoreRef = db.collection('scores').doc();
                transaction.set(scoreRef, {
                    userId: userId,
                    score: score,
                    gameType: gameType,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });

                // 更新用户总分
                const userTotalRef = db.collection('userTotals').doc(userId);
                const userTotalDoc = await transaction.get(userTotalRef);

                if (userTotalDoc.exists) {
                    const currentTotal = userTotalDoc.data().totalScore || 0;
                    transaction.update(userTotalRef, {
                        totalScore: currentTotal + score,
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
                    score: score
                };
            });

            return {
                success: true,
                score_id: result.scoreId,
                user_id: result.userId,
                score: result.score,
                message: 'Score submitted successfully'
            };
        } catch (error) {
            console.error('Error submitting score:', error);
            throw error;
        }
    }
}

export default new LeaderboardService();

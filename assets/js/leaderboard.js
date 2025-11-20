/**
 * 愛心排行榜系統 - 純前端 LocalStorage 實現
 * 適用於 GitHub Pages 等靜態網站部署
 */

class LeaderboardManager {
    constructor() {
        this.storageKey = 'love_leaderboard';
        this.currentUserKey = 'current_username';
        this.init();
    }

    /**
     * 初始化排行榜
     */
    init() {
        // 如果沒有排行榜數據，創建初始數據
        if (!localStorage.getItem(this.storageKey)) {
            this.createInitialData();
        }
    }

    /**
     * 創建初始測試數據
     */
    createInitialData() {
        const initialData = [
            { username: 'Alice', totalLoves: 350, avatar: 'https://i.pravatar.cc/150?img=1' },
            { username: 'Bob', totalLoves: 295, avatar: 'https://i.pravatar.cc/150?img=2' },
            { username: 'Charlie', totalLoves: 275, avatar: 'https://i.pravatar.cc/150?img=3' },
            { username: 'Diana', totalLoves: 130, avatar: 'https://i.pravatar.cc/150?img=4' },
            { username: 'Eve', totalLoves: 390, avatar: 'https://i.pravatar.cc/150?img=5' },
            { username: 'Frank', totalLoves: 90, avatar: 'https://i.pravatar.cc/150?img=6' },
            { username: 'Grace', totalLoves: 180, avatar: 'https://i.pravatar.cc/150?img=7' },
            { username: 'Henry', totalLoves: 110, avatar: 'https://i.pravatar.cc/150?img=8' },
            { username: 'Ivy', totalLoves: 220, avatar: 'https://i.pravatar.cc/150?img=9' },
            { username: 'Jack', totalLoves: 160, avatar: 'https://i.pravatar.cc/150?img=10' }
        ];

        localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }

    /**
     * 獲取排行榜數據
     */
    getLeaderboard(limit = 10) {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '[]');

        // 排序：愛心數降序
        data.sort((a, b) => b.totalLoves - a.totalLoves);

        // 添加排名
        const leaderboard = data.slice(0, limit).map((user, index) => ({
            rank: index + 1,
            username: user.username,
            totalLoves: user.totalLoves,
            avatar: user.avatar || `https://i.pravatar.cc/150?img=${index + 1}`
        }));

        return leaderboard;
    }

    /**
     * 提交愛心分數
     */
    submitLove(username, loveCount) {
        if (!username || loveCount <= 0) {
            console.error('Invalid username or love count');
            return false;
        }

        const data = JSON.parse(localStorage.getItem(this.storageKey) || '[]');

        // 查找用戶
        const userIndex = data.findIndex(u => u.username === username);

        if (userIndex >= 0) {
            // 更新現有用戶
            data[userIndex].totalLoves += loveCount;
        } else {
            // 創建新用戶
            data.push({
                username: username,
                totalLoves: loveCount,
                avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`
            });
        }

        // 保存數據
        localStorage.setItem(this.storageKey, JSON.stringify(data));

        console.log(`✅ 已為 ${username} 增加 ${loveCount} 愛心`);
        return true;
    }

    /**
     * 獲取用戶排名
     */
    getUserRank(username) {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || '[]');

        // 排序
        data.sort((a, b) => b.totalLoves - a.totalLoves);

        // 查找用戶
        const userIndex = data.findIndex(u => u.username === username);

        if (userIndex >= 0) {
            return {
                username: data[userIndex].username,
                totalLoves: data[userIndex].totalLoves,
                rank: userIndex + 1
            };
        }

        return null;
    }

    /**
     * 設置當前用戶名
     */
    setCurrentUser(username) {
        localStorage.setItem(this.currentUserKey, username);
    }

    /**
     * 獲取當前用戶名
     */
    getCurrentUser() {
        return localStorage.getItem(this.currentUserKey) || null;
    }
}

// 全局實例
const leaderboardManager = new LeaderboardManager();

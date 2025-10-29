/**
 * 左側縱向排行榜系統
 * - 顯示前10名玩家（可滾動查看所有）
 * - 玩家名稱編輯功能
 * - 每5秒自動更新
 * - 與後端API整合
 */

class SideLeaderboard {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3000/api'; // Node.js後端API
        this.updateInterval = 5000; // 5秒更新一次
        this.userId = this.getUserId();
        this.intervalId = null;
        this.init();
    }

    /**
     * 獲取或創建用戶ID
     */
    getUserId() {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', userId);
        }
        return userId;
    }

    /**
     * 初始化
     */
    init() {
        console.log('🏆 初始化左側排行榜系統...');
        this.bindEvents();
        this.loadLeaderboard();
        this.startAutoUpdate();
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        const editBtn = document.getElementById('userNameEditBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.showNameEditDialog());
        }
    }

    /**
     * 顯示名稱編輯對話框
     */
    showNameEditDialog() {
        const currentName = localStorage.getItem('playerName') || '匿名玩家';

        const dialog = document.createElement('div');
        dialog.className = 'battle-dialog name-edit-dialog';
        dialog.innerHTML = `
            <div class="battle-dialog-content">
                <h2 class="battle-title">✏️ 編輯玩家名稱</h2>
                <div class="name-edit-form">
                    <input
                        type="text"
                        id="nameEditInput"
                        class="name-edit-input"
                        placeholder="請輸入您的名稱"
                        maxlength="20"
                        value="${currentName === '匿名玩家' ? '' : currentName}"
                    />
                    <div class="name-edit-hint">名稱限制：2-20個字元</div>
                </div>
                <div class="battle-buttons">
                    <button class="battle-btn battle-cancel">
                        <span>取消</span>
                    </button>
                    <button class="battle-btn battle-confirm">
                        <span>確認</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        setTimeout(() => {
            dialog.classList.add('show');
            const input = document.getElementById('nameEditInput');
            if (input) input.focus();
        }, 10);

        const cancelBtn = dialog.querySelector('.battle-cancel');
        const confirmBtn = dialog.querySelector('.battle-confirm');
        const input = document.getElementById('nameEditInput');

        cancelBtn.addEventListener('click', () => {
            this.closeDialog(dialog);
        });

        confirmBtn.addEventListener('click', () => {
            const newName = input.value.trim();
            if (newName.length >= 2 && newName.length <= 20) {
                this.updatePlayerName(newName);
                this.closeDialog(dialog);
            } else {
                alert('名稱必須是2-20個字元！');
            }
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmBtn.click();
            }
        });

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                this.closeDialog(dialog);
            }
        });
    }

    /**
     * 關閉對話框
     */
    closeDialog(dialog) {
        dialog.classList.remove('show');
        setTimeout(() => {
            dialog.remove();
        }, 300);
    }

    /**
     * 更新玩家名稱
     */
    async updatePlayerName(newName) {
        const oldName = localStorage.getItem('playerName') || '匿名玩家';
        localStorage.setItem('playerName', newName);

        // 同步到 leaderboardManager
        if (window.leaderboardManager) {
            window.leaderboardManager.setCurrentUser(newName);
        }

        // 更新UI
        const userNameText = document.getElementById('userNameText');
        if (userNameText) {
            userNameText.textContent = newName;
        }

        console.log(`✅ 名稱已更新：${oldName} → ${newName}`);

        // 同步到後端
        try {
            const response = await fetch(`${this.apiBaseUrl}/leaderboard/username`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: this.userId,
                    newUsername: newName
                })
            });

            if (response.ok) {
                console.log('✅ 名稱已同步到後端');
                this.loadLeaderboard(); // 重新載入排行榜
            } else {
                console.warn('⚠️ 名稱同步到後端失敗');
            }
        } catch (error) {
            console.warn('⚠️ 無法連接到後端API，名稱只保存在本地:', error);
        }
    }

    /**
     * 載入排行榜
     */
    async loadLeaderboard() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/leaderboard?limit=100`);

            if (!response.ok) {
                throw new Error('API請求失敗');
            }

            const data = await response.json();
            this.renderLeaderboard(data);

            // 獲取當前玩家排名
            await this.loadMyRank();
        } catch (error) {
            console.warn('⚠️ 無法從後端載入排行榜，使用LocalStorage備用方案:', error);
            this.loadLeaderboardFromLocalStorage();
        }
    }

    /**
     * 從LocalStorage載入排行榜（備用方案）
     */
    loadLeaderboardFromLocalStorage() {
        const leaderboardManager = window.leaderboardManager;
        if (!leaderboardManager) {
            console.warn('⚠️ LeaderboardManager未初始化，正在重試...');
            // 延遲重試，等待 leaderboardManager 初始化
            setTimeout(() => {
                if (window.leaderboardManager) {
                    this.loadLeaderboardFromLocalStorage();
                } else {
                    console.error('❌ LeaderboardManager初始化失敗');
                    const listContainer = document.getElementById('sideLeaderboardList');
                    if (listContainer) {
                        listContainer.innerHTML = '<div class="side-leaderboard-loading">排行榜載入失敗</div>';
                    }
                }
            }, 500);
            return;
        }

        const data = leaderboardManager.getLeaderboard(100);

        if (!data || data.length === 0) {
            console.log('📊 排行榜為空，顯示初始數據');
        }

        this.renderLeaderboard(data);

        // 獲取當前玩家排名
        const playerName = localStorage.getItem('playerName') || '匿名玩家';
        const currentUser = data.find(item => item.username === playerName);
        const rank = currentUser ? data.indexOf(currentUser) + 1 : '-';

        const userRankValue = document.getElementById('userRankValue');
        if (userRankValue) {
            userRankValue.textContent = rank === '-' ? '-' : `#${rank}`;
        }
    }

    /**
     * 即時更新當前玩家分數（供外部調用）
     */
    updateCurrentPlayerScore(loveCount) {
        const playerName = localStorage.getItem('playerName') || '匿名玩家';

        // 更新到LeaderboardManager
        if (window.leaderboardManager) {
            window.leaderboardManager.submitLove(playerName, loveCount);

            // 立即重新載入排行榜
            this.loadLeaderboardFromLocalStorage();
        }
    }

    /**
     * 渲染排行榜
     */
    renderLeaderboard(data) {
        const listContainer = document.getElementById('sideLeaderboardList');
        if (!listContainer) return;

        const playerName = localStorage.getItem('playerName') || '匿名玩家';

        // 只顯示前10名
        const top10 = data.slice(0, 10);

        if (top10.length === 0) {
            listContainer.innerHTML = '<div class="side-leaderboard-loading">暫無排行榜數據</div>';
            return;
        }

        const trophies = ['🥇', '🥈', '🥉'];

        listContainer.innerHTML = top10.map((player, index) => {
            const rank = index + 1;
            const isCurrentUser = player.username === playerName;
            const rankDisplay = rank <= 3
                ? `<div class="rank-trophy">${trophies[index]}</div>`
                : `<div class="rank-badge">#${rank}</div>`;

            return `
                <div class="side-leaderboard-item ${isCurrentUser ? 'current-user' : ''}">
                    ${rankDisplay}
                    <div class="player-info">
                        <div class="player-name">${this.escapeHtml(player.username)}</div>
                        <div class="player-loves">💖 ${player.totalLoves}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * 獲取當前玩家排名
     */
    async loadMyRank() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/leaderboard/my-rank/${this.userId}`);

            if (!response.ok) {
                throw new Error('獲取排名失敗');
            }

            const data = await response.json();
            const userRankValue = document.getElementById('userRankValue');

            if (userRankValue) {
                userRankValue.textContent = data.rank ? `#${data.rank}` : '-';
            }
        } catch (error) {
            console.warn('⚠️ 無法從後端獲取排名:', error);
        }
    }

    /**
     * 開始自動更新
     */
    startAutoUpdate() {
        console.log(`⏱️ 開始自動更新排行榜（每${this.updateInterval / 1000}秒）`);

        this.intervalId = setInterval(() => {
            this.loadLeaderboard();
        }, this.updateInterval);
    }

    /**
     * 停止自動更新
     */
    stopAutoUpdate() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('⏹️ 停止自動更新排行榜');
        }
    }

    /**
     * HTML轉義
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 在DOM載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏆 準備初始化左側排行榜...');

    // 等待其他系統初始化完成
    setTimeout(() => {
        window.sideLeaderboard = new SideLeaderboard();

        // 同步玩家名稱（優先使用 leaderboardManager 的名稱）
        let playerName = localStorage.getItem('playerName');

        // 如果沒有 playerName，嘗試從 leaderboardManager 獲取
        if (!playerName && window.leaderboardManager) {
            playerName = window.leaderboardManager.getCurrentUser();
            if (playerName) {
                localStorage.setItem('playerName', playerName);
            }
        }

        // 如果還是沒有，使用默認值並同步到 leaderboardManager
        if (!playerName) {
            playerName = '匿名玩家';
            if (window.leaderboardManager) {
                window.leaderboardManager.setCurrentUser(playerName);
            }
        }

        // 更新UI
        const userNameText = document.getElementById('userNameText');
        if (userNameText) {
            userNameText.textContent = playerName;
        }

        console.log(`👤 當前玩家名稱：${playerName}`);
    }, 500);
});

/**
 * 左側縱向排行榜系統 - 純後端版本
 * - 顯示前10名玩家（可滾動查看所有）
 * - 玩家名稱編輯功能
 * - 每2秒自動更新
 * - 完全依賴後端 Firebase API
 */

class SideLeaderboard {
    constructor() {
        // 使用配置文件中的 API 地址
        this.apiBaseUrl = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || 'http://localhost:3000/api';
        this.updateInterval = 2000; // 2秒更新一次
        this.userId = this.getUserId();
        this.intervalId = null;
        this.isExpanded = false; // 展開狀態
        this.displayLimit = 10; // 默認顯示10人
        this.maxLimit = 100; // 最多100人
        this.currentData = []; // 緩存當前數據
        this.currentScore = 0; // 緩存當前玩家分數

        // 虛擬滾動相關
        this.clusterize = null;

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
        console.log('🏆 初始化左側排行榜系統（純後端版本）...');
        this.initVirtualScroll();
        this.bindEvents();
        this.loadLeaderboard();
        this.startAutoUpdate();
    }

    /**
     * 初始化虛擬滾動
     */
    initVirtualScroll() {
        setTimeout(() => {
            if (typeof Clusterize !== 'undefined') {
                this.clusterize = new Clusterize({
                    rows: [],
                    scrollId: 'scrollArea',
                    contentId: 'contentArea',
                    rows_in_block: 10,
                    blocks_in_cluster: 4
                });
                console.log('✅ 虛擬滾動已初始化');
            } else {
                console.warn('⚠️ Clusterize.js 未載入');
            }
        }, 100);
    }

    /**
     * 綁定事件
     */
    bindEvents() {
        // 點擊標題展開/收起
        const header = document.querySelector('.side-leaderboard-header');
        if (header) {
            header.addEventListener('click', (e) => {
                if (e.target.closest('#userNameEditBtn')) return;
                this.toggleExpand();
            });
            header.style.cursor = 'pointer';
        }

        // 名稱編輯按鈕
        const editBtn = document.getElementById('userNameEditBtn');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showNameEditDialog();
            });
        }
    }

    /**
     * 切換展開/收起狀態
     */
    toggleExpand() {
        this.isExpanded = !this.isExpanded;
        this.displayLimit = this.isExpanded ? this.maxLimit : 10;

        const container = document.getElementById('sideLeaderboard');
        if (container) {
            container.classList.toggle('expanded', this.isExpanded);
        }

        const header = document.querySelector('.side-leaderboard-header h3');
        if (header) {
            const indicator = this.isExpanded ? '▲' : '▼';
            header.textContent = `${indicator} 🏆 愛心排行榜`;
        }

        const hint = document.querySelector('.expand-hint');
        if (hint) {
            hint.textContent = this.isExpanded ? '點擊收起' : '點擊展開';
        }

        if (this.currentData.length > 0) {
            this.renderLeaderboard(this.currentData);
        }

        if (!this.isExpanded) {
            const scrollArea = document.getElementById('scrollArea');
            if (scrollArea) {
                scrollArea.scrollTo({ top: 0, behavior: 'smooth' });
            }
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
            console.error('❌ 無法連接到後端API:', error);
            alert('⚠️ 無法連接到伺服器，請檢查網路連線');
        }
    }

    /**
     * 載入排行榜（從後端）
     */
    async loadLeaderboard() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/leaderboard?limit=100`);

            if (!response.ok) {
                throw new Error(`API請求失敗: ${response.status}`);
            }

            const result = await response.json();
            const data = result.data || result;

            // 緩存數據
            this.currentData = data;

            this.renderLeaderboard(data);

            // 獲取當前玩家排名和分數
            await this.loadMyRank();
        } catch (error) {
            console.warn('⚠️ 排行榜暫時無法使用 (Firebase配額超限)');
            // 暫時不顯示錯誤狀態，避免干擾測試
            // this.showErrorState();
        }
    }

    /**
     * 顯示錯誤狀態
     */
    showErrorState() {
        const errorHtml = `
            <div class="side-leaderboard-error">
                <p>❌ 無法連接到伺服器</p>
                <p style="font-size: 14px; color: #666;">請檢查網路連線</p>
            </div>
        `;

        if (this.clusterize) {
            this.clusterize.update([errorHtml]);
        }
    }

    /**
     * 即時更新當前玩家分數（供外部調用）
     */
    async updateCurrentPlayerScore(loveCount) {
        const playerName = localStorage.getItem('playerName') || '匿名玩家';

        // 本地累加分數（樂觀更新）
        this.currentScore += loveCount;

        // 同步到後端API
        await this.syncScoreToBackend(playerName);
    }

    /**
     * 同步分數到後端
     */
    async syncScoreToBackend(playerName) {
        try {
            console.log(`📤 正在同步分數到後端: userId=${this.userId}, total_score=${this.currentScore}`);

            const response = await fetch(`${this.apiBaseUrl}/leaderboard/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: String(this.userId),  // ✅ 確保為字串
                    username: playerName,
                    score: this.currentScore  // ✅ 提交總分（後端已改為覆蓋式更新）
                })
            });

            const result = await response.json();

            if (response.ok) {
                console.log('✅ 分數已同步到後端:', result);
                // 立即重新載入排行榜
                await this.loadLeaderboard();
            } else {
                console.warn('⚠️ 後端分數同步失敗:', response.status, result);
            }
        } catch (error) {
            console.error('❌ 無法連接到後端API進行分數同步:', error);
        }
    }

    /**
     * 從後端獲取當前分數並初始化
     */
    async initializeCurrentScore() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/leaderboard/my-rank/${this.userId}`);
            if (response.ok) {
                const data = await response.json();
                this.currentScore = data.total_score || 0;
                console.log(`📊 當前分數初始化: ${this.currentScore}`);
            }
        } catch (error) {
            console.warn('⚠️ 無法從後端獲取當前分數:', error);
            this.currentScore = 0;
        }
    }

    /**
     * 渲染排行榜
     */
    renderLeaderboard(data) {
        const playerName = localStorage.getItem('playerName') || '匿名玩家';

        const displayData = data.slice(0, this.displayLimit);

        if (displayData.length === 0) {
            if (this.clusterize) {
                this.clusterize.update(['<div class="side-leaderboard-loading">暫無排行榜數據</div>']);
            }
            return;
        }

        const trophies = ['🏆', '🥈', '🥉'];
        const trophyClasses = ['gold-trophy', 'silver-trophy', 'bronze-trophy'];

        const rows = displayData.map((player, index) => {
            const rank = player.rank || (index + 1);
            const isCurrentUser = player.username === playerName || player.user_id === this.userId;

            const rankDisplay = rank <= 3
                ? `<div class="rank-trophy ${trophyClasses[index]}">${trophies[index]}</div>`
                : `<div class="rank-badge">#${rank}</div>`;

            // ✅ 統一使用 total_score (snake_case)
            const score = player.total_score || 0;

            // 更新當前玩家分數
            if (isCurrentUser) {
                this.currentScore = score;
            }

            // 檢查稱號
            const hasBelovedTitle = player.titles &&
                                    Array.isArray(player.titles) &&
                                    player.titles.some(t => t.titleId === 'xian_xian_beloved');

            const titleClass = hasBelovedTitle ? 'has-title' : '';

            // 大頭貼
            const avatarUrl = player.avatar_url;
            const avatarHtml = avatarUrl
                ? `<img src="${avatarUrl}" alt="${this.escapeHtml(player.username)}" class="player-avatar" onerror="this.style.display='none'">`
                : '';

            const uploadBtnHtml = isCurrentUser
                ? `<button class="avatar-upload-btn" onclick="sideLeaderboard.uploadAvatar('${player.user_id || this.userId}')" title="上傳大頭貼">📷</button>`
                : '';

            return `
                <div class="side-leaderboard-item ${isCurrentUser ? 'current-user' : ''} ${rank <= 3 ? 'top-three' : ''} ${titleClass}">
                    ${rankDisplay}
                    <div class="player-avatar-container">
                        ${avatarHtml}
                        ${uploadBtnHtml}
                    </div>
                    <div class="player-info">
                        <div class="player-name">${this.escapeHtml(player.username)}</div>
                        <div class="player-loves">💖 ${score}</div>
                    </div>
                </div>
            `;
        });

        if (this.clusterize) {
            this.clusterize.update(rows);
        }

        this.updateDisplayCount(displayData.length, data.length);
    }

    /**
     * 更新顯示計數
     */
    updateDisplayCount(displayed, total) {
        const hint = document.querySelector('.expand-hint');
        if (hint && total > 10) {
            const hintText = this.isExpanded
                ? `點擊收起 (${displayed}/${total})`
                : `點擊展開 (${total}人)`;
            hint.textContent = hintText;
        }
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

            // 更新當前分數
            if (data.total_score !== undefined) {
                this.currentScore = data.total_score;
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

        // 初始化當前分數
        this.initializeCurrentScore();

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
     * 上傳大頭貼
     */
    uploadAvatar(userId) {
        if (!window.avatarUploadManager) {
            console.error('❌ AvatarUploadManager 未初始化');
            return;
        }

        window.avatarUploadManager.selectAndUpload(
            userId,
            (message) => {
                console.log('📤', message);
            },
            (result) => {
                console.log('✅ 大頭貼上傳成功:', result);
                this.showMessage('✨ 大頭貼上傳成功！');
                this.loadLeaderboard();
            },
            (error) => {
                console.error('❌ 大頭貼上傳失敗:', error);
                this.showMessage('❌ ' + error.message, 'error');
            }
        );
    }

    /**
     * 顯示訊息提示
     */
    showMessage(message, type = 'success') {
        const messageEl = document.createElement('div');
        messageEl.className = `upload-message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'};
            color: white;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(messageEl);

        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
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
    console.log('🏆 準備初始化左側排行榜（純後端版本）...');

    setTimeout(() => {
        window.sideLeaderboard = new SideLeaderboard();

        // 從 localStorage 讀取玩家名稱
        let playerName = localStorage.getItem('playerName');

        if (!playerName) {
            playerName = '匿名玩家';
            localStorage.setItem('playerName', playerName);
        }

        // 更新UI
        const userNameText = document.getElementById('userNameText');
        if (userNameText) {
            userNameText.textContent = playerName;
        }

        console.log(`👤 當前玩家名稱：${playerName}`);
    }, 500);
});

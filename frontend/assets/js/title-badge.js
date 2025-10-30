/**
 * 稱號徽章系統 - 互動效果和顯示邏輯
 * 💖✨ 賢賢的摯愛 ✨💖
 */

class TitleBadgeSystem {
    constructor() {
        this.apiBaseUrl = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || 'http://localhost:3000/api';
        this.userTitles = [];
        this.soundEnabled = true;
    }

    /**
     * 創建稱號徽章HTML
     * @param {string} titleName - 稱號名稱
     * @param {string} grantedDate - 獲得日期
     * @returns {string} HTML字符串
     */
    createTitleBadgeHTML(titleName = '賢賢的摯愛', grantedDate = null) {
        const dateText = grantedDate ?
            `獲得於 ${new Date(grantedDate).toLocaleDateString('zh-TW')}` :
            '特殊稱號';

        return `
            <div class="title-badge-container" data-title-interactive="true">
                <!-- 粉紅色光暈背景 -->
                <div class="title-glow-bg"></div>

                <!-- 環繞星星 -->
                <div class="title-star" style="top: -15px; left: 50%; transform: translateX(-50%);">⭐</div>
                <div class="title-star" style="top: 50%; right: -25px; transform: translateY(-50%);">✨</div>
                <div class="title-star" style="bottom: -15px; left: 50%; transform: translateX(-50%);">💫</div>
                <div class="title-star" style="top: 50%; left: -25px; transform: translateY(-50%);">⭐</div>

                <!-- 飄浮愛心粒子 -->
                <div class="title-heart-particle">💕</div>
                <div class="title-heart-particle">💖</div>
                <div class="title-heart-particle">💗</div>
                <div class="title-heart-particle">💝</div>

                <!-- 絲帶稱號 -->
                <div class="title-ribbon">
                    <!-- 左側蝴蝶結 -->
                    <span class="title-bow-left">🎀</span>
                    <!-- 左側愛心 -->
                    <span class="title-heart-left">💖</span>

                    ${titleName}

                    <!-- 右側愛心 -->
                    <span class="title-heart-right">💖</span>
                    <!-- 右側蝴蝶結 -->
                    <span class="title-bow-right">🎀</span>
                </div>

                <!-- Tooltip -->
                <div class="title-tooltip">${dateText}</div>
            </div>
        `;
    }

    /**
     * 為頭貼添加發光金框
     * @param {HTMLElement} avatarElement - 頭貼元素
     */
    addGoldenFrame(avatarElement) {
        if (!avatarElement) return;

        avatarElement.classList.add('player-avatar-with-title');

        // 檢查是否已經有金框
        if (!avatarElement.querySelector('.avatar-golden-frame')) {
            const frame = document.createElement('div');
            frame.className = 'avatar-golden-frame';
            avatarElement.appendChild(frame);
        }
    }

    /**
     * 播放稱號音效 - "叮～"
     */
    playTitleSound() {
        if (!this.soundEnabled) return;

        try {
            // 創建一個簡單的"叮"音效
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // 設置音效參數
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.warn('⚠️ 無法播放稱號音效:', error);
        }
    }

    /**
     * 愛心噴發效果（使用物理引擎）
     * @param {number} x - 滑鼠X座標
     * @param {number} y - 滑鼠Y座標
     */
    triggerLoveBurst(x, y) {
        // 使用統一物理系統創建愛心噴發
        if (window.heartPhysics && window.heartPhysics.isInitialized) {
            // 12個愛心向四周飛散，帶有真實物理效果
            window.heartPhysics.addHeartBurst(x, y, 12);
        } else {
            console.warn('⚠️ 物理系統未初始化，愛心噴發失敗');
        }

        // 播放音效
        this.playTitleSound();
    }

    /**
     * 初始化稱號互動效果
     * @param {HTMLElement} badgeElement - 稱號元素
     */
    initInteractiveEffects(badgeElement) {
        if (!badgeElement || badgeElement.dataset.titleInteractive !== 'true') return;

        // 點擊愛心噴發
        badgeElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.triggerLoveBurst(e.clientX, e.clientY);
        });

        // 首次顯示時播放音效
        this.playTitleSound();
    }

    /**
     * 從後端獲取玩家稱號
     * @param {string} userId - 用戶ID
     * @returns {Promise<Array>} 稱號列表
     */
    async fetchUserTitles(userId) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/leaderboard/titles/${userId}`);

            if (!response.ok) {
                console.warn('⚠️ 無法獲取稱號');
                return [];
            }

            const result = await response.json();
            this.userTitles = result.titles || [];

            console.log('👑 獲取到的稱號:', this.userTitles);

            return this.userTitles;
        } catch (error) {
            console.error('❌ 獲取稱號時發生錯誤:', error);
            return [];
        }
    }

    /**
     * 檢查玩家是否擁有特定稱號
     * @param {string} titleId - 稱號ID
     * @returns {boolean}
     */
    hasTitle(titleId) {
        return this.userTitles.some(title => title.titleId === titleId);
    }

    /**
     * 獲取稱號資訊
     * @param {string} titleId - 稱號ID
     * @returns {Object|null}
     */
    getTitleInfo(titleId) {
        return this.userTitles.find(title => title.titleId === titleId) || null;
    }

    /**
     * 渲染玩家稱號到指定容器
     * @param {HTMLElement} container - 容器元素
     * @param {string} userId - 用戶ID
     */
    async renderTitleBadge(container, userId) {
        if (!container || !userId) return;

        // 獲取玩家稱號
        await this.fetchUserTitles(userId);

        // 檢查是否有"賢賢的摯愛"稱號
        const belovedTitle = this.getTitleInfo('xian_xian_beloved');

        if (belovedTitle) {
            // 創建稱號HTML
            const badgeHTML = this.createTitleBadgeHTML(
                belovedTitle.titleName,
                belovedTitle.grantedAt
            );

            // 插入HTML
            container.innerHTML = badgeHTML;

            // 初始化互動效果
            const badgeElement = container.querySelector('.title-badge-container');
            this.initInteractiveEffects(badgeElement);

            // 如果有頭貼，添加金框
            const avatar = container.closest('.player-info')?.querySelector('.player-avatar');
            if (avatar) {
                this.addGoldenFrame(avatar);
            }
        }
    }
}

// 全局實例
window.titleBadgeSystem = new TitleBadgeSystem();

// 輔助函數：為排行榜項目添加稱號
window.addTitleToLeaderboardItem = function(itemElement, userId) {
    if (!itemElement || !userId) return;

    // 創建稱號容器
    const titleContainer = document.createElement('div');
    titleContainer.className = 'title-badge-wrapper';
    titleContainer.style.position = 'relative';

    // 渲染稱號
    window.titleBadgeSystem.renderTitleBadge(titleContainer, userId);

    // 插入到玩家信息之前
    const playerInfo = itemElement.querySelector('.player-info');
    if (playerInfo) {
        itemElement.insertBefore(titleContainer, playerInfo);
        itemElement.classList.add('has-title');
    }
};

console.log('👑 稱號徽章系統已初始化');

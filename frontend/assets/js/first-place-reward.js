/**
 * 第一名獎勵系統 - "賢賢的芳心"
 *
 * 功能：
 * 1. 禮盒動畫（光芒四射）
 * 2. 愛心雨物理效果
 * 3. 愛心堆積系統
 * 4. 滿屏彈窗
 * 5. 全服公告（跑馬燈+彩帶）
 */

class FirstPlaceRewardSystem {
    constructor() {
        this.apiBaseUrl = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || 'http://localhost:3000/api';
        this.maxHearts = 200; // 滿屏閾值
        this.titleId = 'xian_xian_beloved'; // 稱號ID
        this.titleName = '賢賢的摯愛'; // 稱號名稱
        this.heartRainInterval = null; // 愛心雨間隔計時器
    }

    /**
     * 檢查並觸發第一名獎勵
     */
    async checkAndTrigger() {
        try {
            const userId = this.getUserId();
            if (!userId) {
                console.warn('⚠️ 無法獲取用戶ID');
                return;
            }

            console.log('🏆 檢查是否為第一名...');

            // 調用後端API檢查是否第一名
            const response = await fetch(`${this.apiBaseUrl}/leaderboard/check-first/${userId}`);

            if (!response.ok) {
                console.warn('⚠️ 無法檢查排名');
                return;
            }

            const result = await response.json();
            console.log('📊 排名檢查結果:', result);

            if (result.is_first_place) {
                const username = result.first_place_username || '第一名玩家';
                console.log(`🎉 恭喜！你是第一名：${username}`);

                // 觸發獎勵流程
                await this.triggerReward(username, userId);
            } else {
                console.log('💪 繼續加油！當前不是第一名');
            }
        } catch (error) {
            console.error('❌ 檢查第一名時發生錯誤:', error);
        }
    }

    /**
     * 獲取用戶ID
     */
    getUserId() {
        return localStorage.getItem('userId') || null;
    }

    /**
     * 觸發第一名獎勵流程
     */
    async triggerReward(username, userId) {
        console.log('🎁 開始第一名獎勵流程...');

        // 1. 全服公告（彩帶+跑馬燈）
        this.showGlobalAnnouncement(username);

        // 2. 禮盒動畫
        await this.showGiftBoxAnimation();

        // 3. 授予稱號
        await this.grantTitle(userId);

        // 4. 愛心雨開始
        this.startHeartRain();
    }

    /**
     * 全服公告（跑馬燈+彩帶）
     */
    showGlobalAnnouncement(username) {
        console.log('📢 顯示全服公告...');

        // 彩帶效果
        this.showConfetti();

        // 跑馬燈公告
        const announcement = document.getElementById('global-announcement');
        const text = announcement.querySelector('.announcement-text');

        if (announcement && text) {
            text.textContent = `🎉 恭喜 ${username} 獲得賢賢的芳心 💖`;
            announcement.style.display = 'block';
            announcement.classList.add('show');

            // 10秒後隱藏
            setTimeout(() => {
                announcement.classList.remove('show');
                setTimeout(() => {
                    announcement.style.display = 'none';
                }, 1000);
            }, 10000);
        }
    }

    /**
     * 彩帶效果
     */
    showConfetti() {
        console.log('🎊 釋放彩帶...');

        // 創建多個彩帶
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createConfettiPiece();
            }, i * 50);
        }
    }

    /**
     * 創建單個彩帶片段
     */
    createConfettiPiece() {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = this.getRandomColor();
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';

        document.body.appendChild(confetti);

        // 動畫結束後移除
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }

    /**
     * 獲取隨機顏色
     */
    getRandomColor() {
        const colors = ['#ff6b9d', '#c44569', '#f8b500', '#feca57', '#48dbfb', '#0abde3', '#ff9ff3', '#54a0ff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * 禮盒動畫（光芒四射）
     */
    showGiftBoxAnimation() {
        return new Promise((resolve) => {
            console.log('🎁 顯示禮盒動畫...');

            const giftBox = document.createElement('div');
            giftBox.className = 'gift-box-container';
            giftBox.innerHTML = `
                <div class="gift-box-shine"></div>
                <div class="gift-box">
                    <div class="gift-box-lid">🎁</div>
                    <div class="gift-box-body"></div>
                </div>
                <div class="gift-text">賢賢的芳心</div>
            `;

            document.body.appendChild(giftBox);

            // 光芒效果
            setTimeout(() => {
                giftBox.classList.add('shine-active');
            }, 500);

            // 打開禮盒
            setTimeout(() => {
                const lid = giftBox.querySelector('.gift-box-lid');
                lid.classList.add('open');
            }, 2000);

            // 3秒後移除禮盒，開始愛心雨
            setTimeout(() => {
                giftBox.classList.add('fade-out');
                setTimeout(() => {
                    giftBox.remove();
                    resolve();
                }, 500);
            }, 3500);
        });
    }

    /**
     * 授予稱號
     */
    async grantTitle(userId) {
        try {
            console.log('👑 授予特殊稱號...');

            const response = await fetch(`${this.apiBaseUrl}/leaderboard/grant-title`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    titleId: this.titleId,
                    titleName: this.titleName
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ 稱號已授予:', result);
            } else {
                console.warn('⚠️ 授予稱號失敗');
            }
        } catch (error) {
            console.error('❌ 授予稱號時發生錯誤:', error);
        }
    }

    /**
     * 開始愛心雨（使用物理引擎）
     */
    startHeartRain() {
        console.log('💖 開始愛心雨...');

        // 檢查物理系統是否已初始化
        if (!window.heartPhysics || !window.heartPhysics.isInitialized) {
            console.error('❌ 物理系統未初始化，無法開始愛心雨');
            return;
        }

        // 每100ms生成一個愛心
        this.heartRainInterval = setInterval(() => {
            const currentHeartCount = window.heartPhysics.getHeartCount();

            if (currentHeartCount < this.maxHearts) {
                // 使用物理系統創建從上方掉落的愛心
                this.createFallingHeart();
            } else {
                // 達到最大數量，停止生成
                clearInterval(this.heartRainInterval);
                console.log('💕 愛心雨已達到最大數量，顯示彈窗...');
                this.showFullScreenDialog();
            }
        }, 100);
    }

    /**
     * 創建下落的愛心（使用物理引擎）
     */
    createFallingHeart() {
        // 隨機X位置（螢幕寬度範圍內）
        const x = Math.random() * window.innerWidth;

        // 使用統一物理系統創建愛心
        window.heartPhysics.addHeartFromAbove(x);
    }

    /**
     * 停止愛心雨
     */
    stopHeartRain() {
        if (this.heartRainInterval) {
            clearInterval(this.heartRainInterval);
            this.heartRainInterval = null;
            console.log('🛑 已停止愛心雨');
        }
    }

    /**
     * 顯示滿屏彈窗
     */
    showFullScreenDialog() {
        console.log('💕 顯示滿屏彈窗...');

        const dialog = document.createElement('div');
        dialog.className = 'full-screen-love-dialog';
        dialog.innerHTML = `
            <div class="love-dialog-content">
                <div class="love-message">賢賢很愛你了</div>
                <button class="love-dialog-btn">好 😊 我知道了~</button>
            </div>
        `;

        document.body.appendChild(dialog);

        // 按鈕點擊事件
        const btn = dialog.querySelector('.love-dialog-btn');
        btn.addEventListener('click', () => {
            // 刷新網站重置
            location.reload();
        });
    }
}

// 全局實例
window.firstPlaceRewardSystem = new FirstPlaceRewardSystem();

console.log('🎁 第一名獎勵系統已初始化');

/**
 * 排行榜 UI 控制
 */

document.addEventListener('DOMContentLoaded', function() {
    const leaderboardPanel = document.getElementById('leaderboard-panel');
    const leaderboardClose = document.getElementById('leaderboard-close');
    const leaderboardList = document.getElementById('leaderboard-list');
    const userRankDisplay = document.getElementById('user-rank-display');

    // 關閉排行榜
    if (leaderboardClose) {
        leaderboardClose.addEventListener('click', () => {
            hideLeaderboard();
        });
    }

    // 點擊背景關閉
    if (leaderboardPanel) {
        leaderboardPanel.addEventListener('click', (e) => {
            if (e.target === leaderboardPanel) {
                hideLeaderboard();
            }
        });
    }

    /**
     * 顯示排行榜
     */
    function showLeaderboard() {
        if (!leaderboardPanel) return;

        leaderboardPanel.style.display = 'flex';
        setTimeout(() => {
            leaderboardPanel.classList.add('show');
        }, 10);

        // 載入排行榜數據
        loadLeaderboard();

        // 載入用戶排名（如果已設定名稱）
        const currentUser = leaderboardManager.getCurrentUser();
        if (currentUser) {
            loadUserRank(currentUser);
        }
    }

    /**
     * 隱藏排行榜
     */
    function hideLeaderboard() {
        if (!leaderboardPanel) return;

        leaderboardPanel.classList.remove('show');
        setTimeout(() => {
            leaderboardPanel.style.display = 'none';
        }, 300);
    }

    /**
     * 載入排行榜數據
     */
    function loadLeaderboard() {
        if (!leaderboardList) return;

        // 顯示載入中
        leaderboardList.innerHTML = '<div class="loading">載入中...</div>';

        // 獲取排行榜數據
        setTimeout(() => {
            const leaderboard = leaderboardManager.getLeaderboard(10);

            if (leaderboard.length === 0) {
                leaderboardList.innerHTML = '<div class="loading">暫無排行榜數據</div>';
                return;
            }

            // 渲染排行榜
            leaderboardList.innerHTML = leaderboard.map((user, index) => `
                <div class="leaderboard-item" style="--index: ${index};">
                    <div class="rank-badge">${getRankEmoji(user.rank)}${user.rank}</div>
                    <img src="${user.avatar}" alt="${user.username}" class="user-avatar" onerror="this.src='https://i.pravatar.cc/150?img=${index + 1}'">
                    <div class="user-info">
                        <div class="user-name">${escapeHtml(user.username)}</div>
                        <div class="user-loves">${user.totalLoves} 💖</div>
                    </div>
                </div>
            `).join('');
        }, 300);
    }

    /**
     * 載入用戶排名
     */
    function loadUserRank(username) {
        if (!userRankDisplay) return;

        const rankData = leaderboardManager.getUserRank(username);

        if (rankData) {
            userRankDisplay.style.display = 'block';
            userRankDisplay.querySelector('.rank-number').textContent = `#${rankData.rank}`;
            userRankDisplay.querySelector('.rank-username').textContent = rankData.username;
            userRankDisplay.querySelector('.rank-loves').textContent = `${rankData.totalLoves} 💖`;
        } else {
            userRankDisplay.style.display = 'none';
        }
    }

    /**
     * 獲取排名表情符號
     */
    function getRankEmoji(rank) {
        if (rank === 1) return '🥇 ';
        if (rank === 2) return '🥈 ';
        if (rank === 3) return '🥉 ';
        return '#';
    }

    /**
     * HTML 轉義（防止 XSS）
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 監聽愛心增加事件，自動更新排行榜
    window.addEventListener('love-score-updated', (e) => {
        console.log('💖 愛心分數已更新，重新載入排行榜');
        if (leaderboardPanel.classList.contains('show')) {
            loadLeaderboard();
            const currentUser = leaderboardManager.getCurrentUser();
            if (currentUser) {
                loadUserRank(currentUser);
            }
        }
    });
});

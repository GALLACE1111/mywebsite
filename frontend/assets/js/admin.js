// 排行榜管理後台 JavaScript

// 使用配置文件中的 API 地址
const API_BASE_URL = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || 'http://localhost:3000/api';

// ============ 安全設定 ============
// ⚠️ 重要：請修改以下密碼！
const ADMIN_PASSWORD = 'admin123'; // 請改為您的自訂密碼

// 使用 sessionStorage 儲存登入狀態（關閉瀏覽器後失效）
const AUTH_KEY = 'admin_authenticated';

// 狀態管理
let currentPage = 1;
let totalPages = 1;
let allPlayers = [];
let filteredPlayers = [];
let currentAction = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
});

// ============ 身份驗證 ============

function checkAuthentication() {
    const isAuthenticated = sessionStorage.getItem(AUTH_KEY) === 'true';

    if (isAuthenticated) {
        showAdminContent();
        loadPlayers();
    } else {
        showLoginPage();
    }
}

function showLoginPage() {
    document.getElementById('loginContainer').style.display = 'flex';
    document.getElementById('adminContent').classList.remove('authenticated');
}

function showAdminContent() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('adminContent').classList.add('authenticated');
}

function handleLogin(event) {
    event.preventDefault();

    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    if (password === ADMIN_PASSWORD) {
        // 登入成功
        sessionStorage.setItem(AUTH_KEY, 'true');
        errorDiv.classList.remove('show');
        showAdminContent();
        loadPlayers();
    } else {
        // 登入失敗
        errorDiv.classList.add('show');
        document.getElementById('password').value = '';
        document.getElementById('password').focus();

        // 3 秒後隱藏錯誤訊息
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 3000);
    }
}

function handleLogout() {
    if (confirm('確定要登出嗎？')) {
        sessionStorage.removeItem(AUTH_KEY);
        showLoginPage();
        showToast('已成功登出', 'success');
    }
}

// 載入玩家資料
async function loadPlayers() {
    showLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/admin/players?page=${currentPage}&limit=50`);
        const data = await response.json();

        if (data.success) {
            allPlayers = data.data;
            filteredPlayers = allPlayers;
            totalPages = data.total_pages;

            // 更新統計
            document.getElementById('totalPlayers').textContent = data.total;
            document.getElementById('currentPage').textContent = currentPage;
            document.getElementById('totalPages').textContent = totalPages;

            // 渲染表格
            renderPlayersTable();
            updatePagination();
        } else {
            showToast('載入失敗：' + data.error, 'error');
        }
    } catch (error) {
        console.error('Error loading players:', error);
        showToast('載入玩家資料失敗', 'error');
    } finally {
        showLoading(false);
    }
}

// 渲染玩家表格
function renderPlayersTable() {
    const tbody = document.getElementById('playersBody');
    tbody.innerHTML = '';

    if (filteredPlayers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">沒有找到玩家</td></tr>';
        return;
    }

    filteredPlayers.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${player.rank}</td>
            <td><code>${player.user_id}</code></td>
            <td>${player.username}</td>
            <td><strong>${player.total_score}</strong></td>
            <td>${formatDate(player.last_updated)}</td>
            <td>
                <button class="action-btn reset" onclick="showResetScoreModal('${player.user_id}', '${player.username}', ${player.total_score})">
                    重置分數
                </button>
                <button class="action-btn delete" onclick="showDeletePlayerModal('${player.user_id}', '${player.username}', ${player.total_score})">
                    刪除
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 格式化日期
function formatDate(dateString) {
    if (!dateString) return '無';
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 搜尋過濾
function filterPlayers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    if (searchTerm === '') {
        filteredPlayers = allPlayers;
    } else {
        filteredPlayers = allPlayers.filter(player =>
            player.user_id.toLowerCase().includes(searchTerm) ||
            player.username.toLowerCase().includes(searchTerm)
        );
    }

    renderPlayersTable();
}

// 分頁控制
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadPlayers();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        loadPlayers();
    }
}

function updatePagination() {
    document.getElementById('pageInfo').textContent = `第 ${currentPage} 頁`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;
}

// 重新載入
function refreshPlayers() {
    currentPage = 1;
    document.getElementById('searchInput').value = '';
    loadPlayers();
    showToast('資料已重新載入', 'success');
}

// ============ 重置分數 ============

function showResetScoreModal(userId, username, score) {
    currentAction = { userId, username, score };
    document.getElementById('resetPlayerName').textContent = username;
    document.getElementById('resetPlayerScore').textContent = score;
    document.getElementById('deleteHistoryCheck').checked = false;
    document.getElementById('resetScoreModal').classList.add('active');
}

function closeResetScoreModal() {
    document.getElementById('resetScoreModal').classList.remove('active');
    currentAction = null;
}

async function confirmResetScore() {
    if (!currentAction) return;

    const deleteHistory = document.getElementById('deleteHistoryCheck').checked;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/reset-score`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: currentAction.userId,
                deleteHistory: deleteHistory
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast(`已重置 ${currentAction.username} 的分數`, 'success');
            closeResetScoreModal();
            loadPlayers();
        } else {
            showToast('重置失敗：' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error resetting score:', error);
        showToast('重置分數失敗', 'error');
    }
}

// ============ 刪除玩家 ============

function showDeletePlayerModal(userId, username, score) {
    currentAction = { userId, username, score };
    document.getElementById('deletePlayerName').textContent = username;
    document.getElementById('deletePlayerScore').textContent = score;
    document.getElementById('deletePlayerModal').classList.add('active');
}

function closeDeletePlayerModal() {
    document.getElementById('deletePlayerModal').classList.remove('active');
    currentAction = null;
}

async function confirmDeletePlayer() {
    if (!currentAction) return;

    try {
        const response = await fetch(`${API_BASE_URL}/admin/player/${currentAction.userId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showToast(`已刪除玩家 ${currentAction.username}`, 'success');
            closeDeletePlayerModal();
            loadPlayers();
        } else {
            showToast('刪除失敗：' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting player:', error);
        showToast('刪除玩家失敗', 'error');
    }
}

// ============ 清空排行榜 ============

function showClearAllModal() {
    document.getElementById('clearConfirmInput').value = '';
    document.getElementById('clearAllModal').classList.add('active');
}

function closeClearAllModal() {
    document.getElementById('clearAllModal').classList.remove('active');
}

async function confirmClearAll() {
    const confirmText = document.getElementById('clearConfirmInput').value;

    if (confirmText !== 'DELETE ALL') {
        showToast('請正確輸入 DELETE ALL 來確認', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/clear-all`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                confirm: 'DELETE ALL'
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast('排行榜已清空', 'success');
            closeClearAllModal();
            currentPage = 1;
            loadPlayers();
        } else {
            showToast('清空失敗：' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error clearing leaderboard:', error);
        showToast('清空排行榜失敗', 'error');
    }
}

// ============ UI 輔助函數 ============

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
    document.getElementById('playersTable').style.display = show ? 'none' : 'table';
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 關閉 Modal 的快捷鍵 (ESC)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeResetScoreModal();
        closeDeletePlayerModal();
        closeClearAllModal();
    }
});

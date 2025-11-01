// API 基礎網址 - 使用配置文件
const API_BASE_URL = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || 'http://localhost:3000/api';
const API_BASE = API_BASE_URL + '/leaderboard';

// 頁面載入時檢查後端狀態
window.addEventListener('DOMContentLoaded', () => {
    checkBackendStatus();
});

// 檢查後端連線狀態
async function checkBackendStatus() {
    const statusElement = document.getElementById('backend-status');
    try {
        const baseUrl = API_BASE_URL.replace('/api', '');
        const response = await fetch(baseUrl + '/health');
        if (response.ok) {
            const data = await response.json();
            statusElement.textContent = '已連接';
            statusElement.className = 'status online';
        } else {
            statusElement.textContent = '連接失敗';
            statusElement.className = 'status offline';
        }
    } catch (error) {
        statusElement.textContent = '未連接';
        statusElement.className = 'status offline';
        console.error('Backend connection error:', error);
    }
}

// 獲取排行榜
async function getLeaderboard() {
    const limit = document.getElementById('limit').value;
    const page = document.getElementById('page').value;
    const resultBox = document.getElementById('leaderboard-result');

    resultBox.textContent = '載入中...';
    resultBox.className = 'result-box';

    try {
        const response = await fetch(`${API_BASE}?page=${page}&limit=${limit}`);
        const data = await response.json();

        if (data.success) {
            resultBox.className = 'result-box success';
            resultBox.textContent = JSON.stringify(data, null, 2);

            // 顯示提示
            console.log('排行榜資料:', data);
            console.log('總共', data.total, '筆記錄');
            console.log('當前顯示第', data.page, '頁');
        } else {
            resultBox.className = 'result-box error';
            resultBox.textContent = '錯誤: ' + (data.error || '未知錯誤');
        }
    } catch (error) {
        resultBox.className = 'result-box error';
        resultBox.textContent = '連接失敗: ' + error.message + '\n\n請確認:\n1. 後端伺服器是否已啟動\n2. API 網址是否正確';
        console.error('Error:', error);
    }
}

// 提交分數
async function submitScore() {
    const userId = document.getElementById('submit-user-id').value;
    const score = document.getElementById('submit-score').value;
    const resultBox = document.getElementById('submit-result');

    // 驗證輸入
    if (!userId || !score) {
        resultBox.className = 'result-box error';
        resultBox.textContent = '請填寫用戶 ID 和分數';
        return;
    }

    resultBox.textContent = '提交中...';
    resultBox.className = 'result-box';

    try {
        const response = await fetch(`${API_BASE}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: parseInt(userId),
                score: parseInt(score)
            })
        });

        const data = await response.json();

        if (data.success) {
            resultBox.className = 'result-box success';
            resultBox.textContent = JSON.stringify(data, null, 2);

            // 顯示提示
            console.log('分數提交成功!', data);
            alert(`分數提交成功！\n\n用戶 ID: ${data.user_id}\n提交分數: ${data.score}\n記錄 ID: ${data.score_id}\n\n建議下一步:\n1. 用 SQL 查詢確認資料已寫入\n2. 重新獲取排行榜查看更新`);

            // 自動更新後端狀態
            checkBackendStatus();
        } else {
            resultBox.className = 'result-box error';
            resultBox.textContent = '錯誤: ' + (data.error || '未知錯誤');

            if (data.error === 'User not found') {
                resultBox.textContent += '\n\n提示: 用戶不存在，請先新增用戶\nSQL 指令:\nINSERT INTO users (id, username) VALUES (' + userId + ', \'測試用戶\');';
            }
        }
    } catch (error) {
        resultBox.className = 'result-box error';
        resultBox.textContent = '連接失敗: ' + error.message + '\n\n請確認:\n1. 後端伺服器是否已啟動\n2. API 網址是否正確';
        console.error('Error:', error);
    }
}

// 查詢個人排名
async function getUserRank() {
    const userId = document.getElementById('rank-user-id').value;
    const resultBox = document.getElementById('rank-result');

    if (!userId) {
        resultBox.className = 'result-box error';
        resultBox.textContent = '請填寫用戶 ID';
        return;
    }

    resultBox.textContent = '查詢中...';
    resultBox.className = 'result-box';

    try {
        const response = await fetch(`${API_BASE}/my-rank/${userId}`);
        const data = await response.json();

        if (data.success) {
            resultBox.className = 'result-box success';
            resultBox.textContent = JSON.stringify(data, null, 2);

            // 顯示提示
            if (data.rank !== null) {
                console.log('用戶排名:', data);
                console.log(`${data.username} 排名第 ${data.rank} 名，分數 ${data.score}`);
            } else {
                console.log('用戶不在排行榜中');
            }
        } else {
            resultBox.className = 'result-box error';
            resultBox.textContent = '錯誤: ' + (data.error || '未知錯誤');
        }
    } catch (error) {
        resultBox.className = 'result-box error';
        resultBox.textContent = '連接失敗: ' + error.message + '\n\n請確認:\n1. 後端伺服器是否已啟動\n2. API 網址是否正確';
        console.error('Error:', error);
    }
}

// 快捷鍵支援
document.addEventListener('keydown', (e) => {
    // Ctrl + Enter 提交分數
    if (e.ctrlKey && e.key === 'Enter') {
        if (document.activeElement.id === 'submit-score' ||
            document.activeElement.id === 'submit-user-id') {
            submitScore();
        }
    }
});

// 工具函數：複製 JSON 到剪貼簿
function copyJSON(elementId) {
    const element = document.getElementById(elementId);
    if (element && element.textContent) {
        navigator.clipboard.writeText(element.textContent).then(() => {
            alert('已複製到剪貼簿！');
        });
    }
}

// 顯示 SQL 教學提示
console.log('%c=== 排行榜 API 測試工具 ===', 'color: #667eea; font-size: 18px; font-weight: bold;');
console.log('%c提示：所有 API 回應都會顯示在這裡', 'color: #666; font-size: 12px;');
console.log('%c建議測試流程：', 'color: #28a745; font-size: 14px; font-weight: bold;');
console.log('1. 獲取排行榜 → 查看現有資料');
console.log('2. 提交分數 → 新增測試資料');
console.log('3. 用 SQL 查詢 → 驗證資料已寫入');
console.log('4. 再次獲取排行榜 → 確認排名更新');
console.log('');
console.log('%cSQL 快速查詢:', 'color: #17a2b8; font-size: 14px; font-weight: bold;');
console.log('mysql -u root leaderboard_db');
console.log('SELECT * FROM user_total_loves ORDER BY total_loves DESC;');

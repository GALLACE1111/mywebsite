#!/usr/bin/env node

/**
 * API 測試腳本
 * 測試所有排行榜 API 端點
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

// 測試結果統計
const stats = {
    total: 0,
    passed: 0,
    failed: 0
};

/**
 * 測試工具函數
 */
async function test(name, fn) {
    stats.total++;
    try {
        await fn();
        console.log(`✅ ${name}`);
        stats.passed++;
    } catch (error) {
        console.error(`❌ ${name}`);
        console.error(`   Error: ${error.message}`);
        stats.failed++;
    }
}

async function fetchJSON(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

/**
 * 測試案例
 */
async function runTests() {
    console.log('\n🧪 Leaderboard API Tests\n');
    console.log(`Base URL: ${BASE_URL}\n`);

    // 測試 1: 健康檢查
    await test('Health check endpoint', async () => {
        const data = await fetchJSON(`${BASE_URL}/health`);
        assert(data.status === 'ok', 'Health status should be ok');
    });

    // 測試 2: 獲取全時段排行榜
    await test('Get all-time leaderboard', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/leaderboard?period=all&limit=10`);
        assert(data.success === true, 'Response should be successful');
        assert(data.period === 'all', 'Period should be all');
        assert(Array.isArray(data.data), 'Data should be an array');
        assert(data.data.length <= 10, 'Should return max 10 items');

        // 檢查排名是否正確排序
        if (data.data.length > 1) {
            for (let i = 0; i < data.data.length - 1; i++) {
                assert(
                    data.data[i].score >= data.data[i + 1].score,
                    'Scores should be in descending order'
                );
                assert(
                    data.data[i].rank === i + 1,
                    `Rank should be ${i + 1}`
                );
            }
        }
    });

    // 測試 3: 獲取今日排行榜
    await test('Get daily leaderboard', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/leaderboard?period=daily&limit=5`);
        assert(data.success === true, 'Response should be successful');
        assert(data.period === 'daily', 'Period should be daily');
    });

    // 測試 4: 測試分頁
    await test('Test pagination', async () => {
        const page1 = await fetchJSON(`${BASE_URL}/api/leaderboard?page=1&limit=5`);
        const page2 = await fetchJSON(`${BASE_URL}/api/leaderboard?page=2&limit=5`);

        assert(page1.page === 1, 'Page 1 should have page number 1');
        assert(page2.page === 2, 'Page 2 should have page number 2');

        if (page1.total > 5) {
            assert(
                page1.data[0].user_id !== page2.data[0].user_id,
                'Different pages should have different data'
            );
        }
    });

    // 測試 5: 獲取用戶個人排名
    await test('Get user rank', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/leaderboard/my-rank/1?period=all`);
        assert(data.success === true, 'Response should be successful');
        assert(data.user_id === 1, 'User ID should be 1');
        assert(typeof data.rank === 'number' || data.rank === null, 'Rank should be a number or null');
        assert(typeof data.score === 'number' || data.score === null, 'Score should be a number or null');
    });

    // 測試 6: 獲取用戶周圍排名
    await test('Get user rank with context', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/leaderboard/around/1?range=3`);
        assert(data.success === true || data.success === false, 'Response should have success field');

        if (data.success) {
            assert(data.user_id === 1, 'User ID should be 1');
            assert(Array.isArray(data.data), 'Data should be an array');
            assert(data.data.length <= 7, 'Should return max 7 items (range 3 on each side)');

            // 檢查是否包含當前用戶
            const hasCurrentUser = data.data.some(item => item.is_current_user === true);
            assert(hasCurrentUser, 'Should include current user');
        }
    });

    // 測試 7: 測試無效參數
    await test('Handle invalid period', async () => {
        try {
            await fetchJSON(`${BASE_URL}/api/leaderboard?period=invalid`);
            throw new Error('Should throw error for invalid period');
        } catch (error) {
            assert(error.message.includes('400') || error.message.includes('Invalid'), 'Should return 400 error');
        }
    });

    // 測試 8: 測試無效用戶ID
    await test('Handle invalid user ID', async () => {
        try {
            await fetchJSON(`${BASE_URL}/api/leaderboard/my-rank/abc`);
            throw new Error('Should throw error for invalid user ID');
        } catch (error) {
            assert(error.message.includes('400') || error.message.includes('Invalid'), 'Should return 400 error');
        }
    });

    // 測試 9: 測試不存在的用戶
    await test('Handle non-existent user', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/leaderboard/my-rank/999999?period=all`);
        assert(data.success === true, 'Response should be successful');
        assert(data.rank === null, 'Rank should be null for non-existent user');
    });

    // 測試 10: 測試遊戲類型篩選
    await test('Test game type filter', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/leaderboard?game_type=default&limit=5`);
        assert(data.success === true, 'Response should be successful');
        assert(data.game_type === 'default', 'Game type should be default');
    });

    // 測試結果
    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Results');
    console.log('='.repeat(50));
    console.log(`Total: ${stats.total}`);
    console.log(`✅ Passed: ${stats.passed}`);
    console.log(`❌ Failed: ${stats.failed}`);
    console.log(`Success Rate: ${((stats.passed / stats.total) * 100).toFixed(1)}%`);
    console.log('='.repeat(50) + '\n');

    if (stats.failed > 0) {
        process.exit(1);
    }
}

// 檢查 fetch API（Node.js 18+）
if (typeof fetch === 'undefined') {
    console.error('❌ This script requires Node.js 18+ with built-in fetch API');
    console.error('Or install node-fetch: npm install node-fetch');
    process.exit(1);
}

// 執行測試
runTests().catch(error => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
});

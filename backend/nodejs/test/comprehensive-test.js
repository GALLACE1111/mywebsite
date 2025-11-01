#!/usr/bin/env node

/**
 * 全面測試腳本
 * 測試所有新功能：Redis 快取、監控服務、管理 API
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

// 測試結果統計
const stats = {
    total: 0,
    passed: 0,
    failed: 0,
    sections: {}
};

/**
 * 測試工具函數
 */
async function test(name, fn, section = 'general') {
    stats.total++;
    if (!stats.sections[section]) {
        stats.sections[section] = { total: 0, passed: 0, failed: 0 };
    }
    stats.sections[section].total++;

    try {
        await fn();
        console.log(`✅ ${name}`);
        stats.passed++;
        stats.sections[section].passed++;
    } catch (error) {
        console.error(`❌ ${name}`);
        console.error(`   Error: ${error.message}`);
        stats.failed++;
        stats.sections[section].failed++;
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 測試案例
 */
async function runTests() {
    console.log('\n🧪 Comprehensive Test Suite v2.0\n');
    console.log(`Base URL: ${BASE_URL}\n`);

    // ============ 基礎測試 ============
    console.log('\n📦 Section 1: Basic Tests');
    console.log('─'.repeat(50));

    await test('Server health check', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/health`);
        assert(data.status === 'ok', 'Health status should be ok');
        assert(typeof data.uptime === 'number', 'Should have uptime');
    }, 'basic');

    await test('API info endpoint', async () => {
        const data = await fetchJSON(`${BASE_URL}/api`);
        assert(data.version === '2.0.0', 'Version should be 2.0.0');
        assert(data.features.includes('Redis Cache'), 'Should list Redis Cache feature');
        assert(data.features.includes('Monitoring Dashboard'), 'Should list Monitoring feature');
        assert(data.features.includes('Admin Panel'), 'Should list Admin Panel feature');
    }, 'basic');

    // ============ 監控 API 測試 ============
    console.log('\n📊 Section 2: Monitoring API Tests');
    console.log('─'.repeat(50));

    await test('Get full monitoring stats', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/monitoring/stats`);
        assert(data.success === true, 'Response should be successful');
        assert(data.firestore !== undefined, 'Should have firestore stats');
        assert(data.cache !== undefined, 'Should have cache stats');
        assert(data.api !== undefined, 'Should have api stats');
        assert(data.quota !== undefined, 'Should have quota stats');
        assert(data.estimation !== undefined, 'Should have estimation');
        assert(Array.isArray(data.recommendations), 'Should have recommendations array');
        assert(data.timestamp !== undefined, 'Should have timestamp');
    }, 'monitoring');

    await test('Get Firestore stats', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/monitoring/firestore`);
        assert(data.success === true, 'Response should be successful');
        assert(typeof data.reads === 'number', 'Should have reads count');
        assert(typeof data.writes === 'number', 'Should have writes count');
        assert(typeof data.deletes === 'number', 'Should have deletes count');
        assert(typeof data.total === 'number', 'Should have total count');
        assert(data.uptime !== undefined, 'Should have uptime info');
    }, 'monitoring');

    await test('Get cache stats', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/monitoring/cache`);
        assert(data.success === true, 'Response should be successful');
        assert(typeof data.hits === 'number', 'Should have hits count');
        assert(typeof data.misses === 'number', 'Should have misses count');
        assert(typeof data.sets === 'number', 'Should have sets count');
        assert(data.hitRate !== undefined, 'Should have hit rate');
    }, 'monitoring');

    await test('Get API call stats', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/monitoring/api`);
        assert(data.success === true, 'Response should be successful');
        assert(typeof data.total === 'number', 'Should have total count');
        assert(data.getLeaderboard !== undefined, 'Should track getLeaderboard');
        assert(data.getUserRank !== undefined, 'Should track getUserRank');
        assert(data.submitScore !== undefined, 'Should track submitScore');
    }, 'monitoring');

    await test('Get quota usage', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/monitoring/quota`);
        assert(data.success === true, 'Response should be successful');
        assert(data.reads !== undefined, 'Should have reads quota');
        assert(data.writes !== undefined, 'Should have writes quota');
        assert(data.deletes !== undefined, 'Should have deletes quota');

        // 檢查每個配額的結構
        ['reads', 'writes', 'deletes'].forEach(type => {
            assert(typeof data[type].used === 'number', `${type} should have used count`);
            assert(typeof data[type].limit === 'number', `${type} should have limit`);
            assert(data[type].percentage !== undefined, `${type} should have percentage`);
            assert(typeof data[type].remaining === 'number', `${type} should have remaining count`);
        });
    }, 'monitoring');

    await test('Get daily usage estimation', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/monitoring/estimation`);
        assert(data.success === true, 'Response should be successful');
        assert(typeof data.reliable === 'boolean', 'Should indicate if estimation is reliable');

        if (data.reliable) {
            assert(data.estimated !== undefined, 'Should have estimated values');
            assert(data.estimated.reads !== undefined, 'Should estimate reads');
            assert(data.estimated.writes !== undefined, 'Should estimate writes');
        }
    }, 'monitoring');

    await test('Get optimization recommendations', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/monitoring/recommendations`);
        assert(data.success === true, 'Response should be successful');
        assert(Array.isArray(data.recommendations), 'Recommendations should be an array');

        if (data.recommendations.length > 0) {
            const rec = data.recommendations[0];
            assert(rec.type !== undefined, 'Recommendation should have type');
            assert(rec.priority !== undefined, 'Recommendation should have priority');
            assert(rec.message !== undefined, 'Recommendation should have message');
        }
    }, 'monitoring');

    // ============ 快取功能測試 ============
    console.log('\n💾 Section 3: Cache Functionality Tests');
    console.log('─'.repeat(50));

    await test('Cache hit rate after multiple requests', async () => {
        // 第一次請求（cache miss）
        await fetchJSON(`${BASE_URL}/api/leaderboard?limit=10`);

        // 第二次請求（cache hit）
        await fetchJSON(`${BASE_URL}/api/leaderboard?limit=10`);

        // 檢查快取統計
        const stats = await fetchJSON(`${BASE_URL}/api/monitoring/cache`);
        assert(stats.hits > 0, 'Should have cache hits');
        assert(stats.sets > 0, 'Should have cache sets');
    }, 'cache');

    await test('Clear all cache', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/monitoring/cache`, {
            method: 'DELETE'
        });
        assert(data.success === true, 'Cache clear should succeed');
        assert(data.message.includes('cleared'), 'Should confirm cache cleared');
    }, 'cache');

    await test('Reset monitoring stats', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/monitoring/reset`, {
            method: 'POST'
        });
        assert(data.success === true, 'Reset should succeed');
        assert(data.message.includes('reset'), 'Should confirm stats reset');
    }, 'cache');

    // ============ 管理 API 測試 ============
    console.log('\n🔧 Section 4: Admin API Tests');
    console.log('─'.repeat(50));

    await test('Get all players list', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/admin/players?page=1&limit=10`);
        assert(data.success === true, 'Response should be successful');
        assert(typeof data.page === 'number', 'Should have page number');
        assert(typeof data.limit === 'number', 'Should have limit');
        assert(typeof data.total === 'number', 'Should have total count');
        assert(Array.isArray(data.data), 'Data should be an array');

        if (data.data.length > 0) {
            const player = data.data[0];
            assert(player.rank !== undefined, 'Player should have rank');
            assert(player.user_id !== undefined, 'Player should have user_id');
            assert(player.username !== undefined, 'Player should have username');
            assert(player.total_score !== undefined, 'Player should have total_score');
        }
    }, 'admin');

    await test('Admin players pagination', async () => {
        const page1 = await fetchJSON(`${BASE_URL}/api/admin/players?page=1&limit=5`);
        const page2 = await fetchJSON(`${BASE_URL}/api/admin/players?page=2&limit=5`);

        assert(page1.page === 1, 'Page 1 should have correct page number');
        assert(page2.page === 2, 'Page 2 should have correct page number');
    }, 'admin');

    // ============ 排行榜 API 測試（確保向後兼容）============
    console.log('\n🏆 Section 5: Leaderboard API Tests (Backward Compatibility)');
    console.log('─'.repeat(50));

    await test('Get leaderboard with cache', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/leaderboard?limit=10`);
        assert(data.success === true, 'Response should be successful');
        assert(Array.isArray(data.data), 'Data should be an array');
    }, 'leaderboard');

    await test('Get user rank with cache', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/leaderboard/my-rank/1`);
        assert(data.success === true, 'Response should be successful');
        assert(data.user_id === '1', 'User ID should match');
    }, 'leaderboard');

    // ============ 整合測試 ============
    console.log('\n🔄 Section 6: Integration Tests');
    console.log('─'.repeat(50));

    let testUserId = `test_${Date.now()}`;

    await test('Submit score and verify cache invalidation', async () => {
        // 提交分數
        const submitData = await fetchJSON(`${BASE_URL}/api/leaderboard/submit`, {
            method: 'POST',
            body: JSON.stringify({
                user_id: testUserId,
                score: 999
            })
        });
        assert(submitData.success === true, 'Score submission should succeed');

        // 等待一小段時間
        await sleep(100);

        // 驗證排行榜已更新
        const leaderboard = await fetchJSON(`${BASE_URL}/api/leaderboard?limit=50`);
        const userExists = leaderboard.data.some(u => u.user_id === testUserId);
        assert(userExists, 'New user should appear in leaderboard after cache invalidation');
    }, 'integration');

    await test('Verify monitoring tracked operations', async () => {
        const stats = await fetchJSON(`${BASE_URL}/api/monitoring/stats`);
        assert(stats.firestore.writes > 0, 'Should have tracked Firestore writes');
        assert(stats.api.submitScore > 0, 'Should have tracked API calls');
    }, 'integration');

    await test('Reset test player score', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/admin/players/${testUserId}/reset`, {
            method: 'POST',
            body: JSON.stringify({
                deleteHistory: false
            })
        });
        assert(data.success === true, 'Score reset should succeed');
        assert(data.new_score === 0, 'New score should be 0');
        assert(data.old_score === 999, 'Old score should be recorded');
    }, 'integration');

    await test('Delete test player', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/admin/players/${testUserId}`, {
            method: 'DELETE'
        });
        assert(data.success === true, 'Player deletion should succeed');
        assert(data.user_id === testUserId, 'Should confirm deleted user ID');
    }, 'integration');

    // ============ 錯誤處理測試 ============
    console.log('\n⚠️ Section 7: Error Handling Tests');
    console.log('─'.repeat(50));

    await test('Handle invalid admin endpoint', async () => {
        try {
            await fetchJSON(`${BASE_URL}/api/admin/invalid`);
            throw new Error('Should throw error for invalid endpoint');
        } catch (error) {
            assert(error.message.includes('404') || error.message.includes('Not found'),
                'Should return 404 error');
        }
    }, 'errors');

    await test('Handle invalid player deletion', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/admin/players/nonexistent_user_999`, {
            method: 'DELETE'
        });
        assert(data.success === false, 'Should fail for non-existent player');
        assert(data.message.includes('not found'), 'Should indicate player not found');
    }, 'errors');

    await test('Handle invalid score reset', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/admin/players/nonexistent_user_999/reset`, {
            method: 'POST',
            body: JSON.stringify({})
        });
        assert(data.success === false, 'Should fail for non-existent player');
    }, 'errors');

    // ============ 測試結果 ============
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Results Summary');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${stats.total}`);
    console.log(`✅ Passed: ${stats.passed}`);
    console.log(`❌ Failed: ${stats.failed}`);
    console.log(`Success Rate: ${((stats.passed / stats.total) * 100).toFixed(1)}%`);

    console.log('\nResults by Section:');
    console.log('─'.repeat(60));
    for (const [section, sectionStats] of Object.entries(stats.sections)) {
        const rate = ((sectionStats.passed / sectionStats.total) * 100).toFixed(1);
        const status = sectionStats.failed === 0 ? '✅' : '⚠️';
        console.log(`${status} ${section.padEnd(20)}: ${sectionStats.passed}/${sectionStats.total} (${rate}%)`);
    }

    console.log('='.repeat(60) + '\n');

    if (stats.failed > 0) {
        console.log('⚠️ Some tests failed. Please review the errors above.\n');
        process.exit(1);
    } else {
        console.log('🎉 All tests passed successfully!\n');
    }
}

// 檢查 fetch API（Node.js 18+）
if (typeof fetch === 'undefined') {
    console.error('❌ This script requires Node.js 18+ with built-in fetch API');
    process.exit(1);
}

// 執行測試
runTests().catch(error => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
});

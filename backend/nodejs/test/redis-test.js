#!/usr/bin/env node

/**
 * Redis 快取測試腳本
 * 測試 Redis 適配器的所有功能
 */

import RedisCache from '../utils/redis-cache.js';
import dotenv from 'dotenv';

dotenv.config();

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
    console.log('\n🔴 Redis Cache Adapter Tests\n');
    console.log(`Redis URL: ${process.env.REDIS_URL || 'redis://localhost:6379'}\n`);

    const cache = new RedisCache();

    // ============ 連接測試 ============
    console.log('\n📡 Section 1: Connection Tests');
    console.log('─'.repeat(50));

    await test('Connect to Redis', async () => {
        const connected = await cache.connect();
        assert(connected === true, 'Should connect successfully');
        assert(cache.isConnected === true, 'Connection status should be true');
    });

    await test('Verify connection status', async () => {
        const isConnected = cache.checkConnection();
        assert(isConnected === true, 'Should verify connection');
    });

    // ============ 基本操作測試 ============
    console.log('\n💾 Section 2: Basic Operations');
    console.log('─'.repeat(50));

    await test('Set and get string value', async () => {
        const key = 'test:string';
        const value = 'Hello Redis';
        await cache.set(key, value, 10000);
        const retrieved = await cache.get(key);
        assert(retrieved === value, 'Retrieved value should match');
    });

    await test('Set and get object value', async () => {
        const key = 'test:object';
        const value = { name: 'Test', score: 100, items: [1, 2, 3] };
        await cache.set(key, value, 10000);
        const retrieved = await cache.get(key);
        assert(JSON.stringify(retrieved) === JSON.stringify(value), 'Retrieved object should match');
    });

    await test('Set and get array value', async () => {
        const key = 'test:array';
        const value = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
        await cache.set(key, value, 10000);
        const retrieved = await cache.get(key);
        assert(JSON.stringify(retrieved) === JSON.stringify(value), 'Retrieved array should match');
    });

    await test('Set and get number value', async () => {
        const key = 'test:number';
        const value = 42;
        await cache.set(key, value, 10000);
        const retrieved = await cache.get(key);
        assert(retrieved === value, 'Retrieved number should match');
    });

    await test('Set and get boolean value', async () => {
        const key = 'test:boolean';
        const value = true;
        await cache.set(key, value, 10000);
        const retrieved = await cache.get(key);
        assert(retrieved === value, 'Retrieved boolean should match');
    });

    // ============ TTL 測試 ============
    console.log('\n⏱️ Section 3: TTL (Time To Live) Tests');
    console.log('─'.repeat(50));

    await test('Value expires after TTL', async () => {
        const key = 'test:expire';
        const value = 'This will expire';
        await cache.set(key, value, 1000); // 1 second TTL

        // 立即讀取應該成功
        const immediate = await cache.get(key);
        assert(immediate === value, 'Should get value immediately');

        // 等待過期
        await sleep(1100);

        // 過期後應該返回 null
        const expired = await cache.get(key);
        assert(expired === null, 'Should return null after expiration');
    });

    await test('Different TTL values', async () => {
        await cache.set('test:ttl1', 'value1', 5000);
        await cache.set('test:ttl2', 'value2', 10000);
        await cache.set('test:ttl3', 'value3', 60000);

        const v1 = await cache.get('test:ttl1');
        const v2 = await cache.get('test:ttl2');
        const v3 = await cache.get('test:ttl3');

        assert(v1 === 'value1', 'TTL1 should be set');
        assert(v2 === 'value2', 'TTL2 should be set');
        assert(v3 === 'value3', 'TTL3 should be set');
    });

    // ============ 刪除操作測試 ============
    console.log('\n🗑️ Section 4: Delete Operations');
    console.log('─'.repeat(50));

    await test('Delete single key', async () => {
        const key = 'test:delete';
        await cache.set(key, 'to be deleted', 10000);

        const beforeDelete = await cache.get(key);
        assert(beforeDelete === 'to be deleted', 'Value should exist before delete');

        const deleted = await cache.delete(key);
        assert(deleted === true, 'Delete should return true');

        const afterDelete = await cache.get(key);
        assert(afterDelete === null, 'Value should be null after delete');
    });

    await test('Delete non-existent key', async () => {
        const deleted = await cache.delete('test:nonexistent');
        assert(deleted === false, 'Deleting non-existent key should return false');
    });

    await test('Clear pattern - setup multiple keys', async () => {
        await cache.set('leaderboard:page:1', 'data1', 10000);
        await cache.set('leaderboard:page:2', 'data2', 10000);
        await cache.set('leaderboard:page:3', 'data3', 10000);
        await cache.set('rank:user:123', 'rank1', 10000);
        await cache.set('rank:user:456', 'rank2', 10000);

        const v1 = await cache.get('leaderboard:page:1');
        assert(v1 === 'data1', 'Setup key should exist');
    });

    await test('Clear pattern - leaderboard:*', async () => {
        const deleted = await cache.clearPattern('leaderboard:*');
        assert(deleted >= 3, 'Should delete at least 3 leaderboard keys');

        const afterClear = await cache.get('leaderboard:page:1');
        assert(afterClear === null, 'Leaderboard key should be deleted');

        const rankStillExists = await cache.get('rank:user:123');
        assert(rankStillExists === 'rank1', 'Rank key should still exist');
    });

    await test('Clear pattern - rank:*', async () => {
        const deleted = await cache.clearPattern('rank:*');
        assert(deleted >= 2, 'Should delete at least 2 rank keys');

        const afterClear = await cache.get('rank:user:123');
        assert(afterClear === null, 'Rank key should be deleted');
    });

    // ============ 統計測試 ============
    console.log('\n📊 Section 5: Statistics Tests');
    console.log('─'.repeat(50));

    await test('Reset stats', async () => {
        cache.resetStats();
        const stats = cache.getStats();
        assert(stats.hits === 0, 'Hits should be 0 after reset');
        assert(stats.misses === 0, 'Misses should be 0 after reset');
        assert(stats.sets === 0, 'Sets should be 0 after reset');
        assert(stats.deletes === 0, 'Deletes should be 0 after reset');
    });

    await test('Track cache hits', async () => {
        await cache.set('test:stats', 'value', 10000);
        await cache.get('test:stats'); // hit
        await cache.get('test:stats'); // hit

        const stats = cache.getStats();
        assert(stats.hits >= 2, 'Should have at least 2 hits');
        assert(stats.sets >= 1, 'Should have at least 1 set');
    });

    await test('Track cache misses', async () => {
        await cache.get('test:nonexistent1'); // miss
        await cache.get('test:nonexistent2'); // miss

        const stats = cache.getStats();
        assert(stats.misses >= 2, 'Should have at least 2 misses');
    });

    await test('Calculate hit rate', async () => {
        cache.resetStats();

        await cache.set('test:hitrate', 'value', 10000);
        await cache.get('test:hitrate'); // hit
        await cache.get('test:hitrate'); // hit
        await cache.get('test:nonexistent'); // miss

        const stats = cache.getStats();
        const expectedHitRate = (2 / 3 * 100).toFixed(2);
        assert(stats.hitRate === `${expectedHitRate}%`, `Hit rate should be ${expectedHitRate}%`);
    });

    await test('Get stats includes connection status', async () => {
        const stats = cache.getStats();
        assert(stats.connected === true, 'Stats should show connected');
        assert(stats.type === 'redis', 'Stats should indicate Redis type');
    });

    // ============ Redis 信息測試 ============
    console.log('\n📋 Section 6: Redis Info Tests');
    console.log('─'.repeat(50));

    await test('Get Redis info', async () => {
        const info = await cache.getInfo();
        assert(info !== null, 'Info should not be null');
        assert(info.connected === true, 'Should show connected');
        assert(typeof info.dbSize === 'number', 'Should have dbSize');
    });

    // ============ 清除測試 ============
    console.log('\n🧹 Section 7: Cleanup Tests');
    console.log('─'.repeat(50));

    await test('Clear all cache', async () => {
        // 設置一些測試數據
        await cache.set('test:clear1', 'value1', 10000);
        await cache.set('test:clear2', 'value2', 10000);

        const cleared = await cache.clear();
        assert(cleared === true, 'Clear should succeed');

        const after1 = await cache.get('test:clear1');
        const after2 = await cache.get('test:clear2');
        assert(after1 === null, 'All keys should be cleared');
        assert(after2 === null, 'All keys should be cleared');
    });

    // ============ 錯誤處理測試 ============
    console.log('\n⚠️ Section 8: Error Handling Tests');
    console.log('─'.repeat(50));

    await test('Handle null/undefined values', async () => {
        await cache.set('test:null', null, 10000);
        const retrieved = await cache.get('test:null');
        assert(retrieved === null, 'Should handle null value');
    });

    await test('Handle empty string', async () => {
        await cache.set('test:empty', '', 10000);
        const retrieved = await cache.get('test:empty');
        assert(retrieved === '', 'Should handle empty string');
    });

    await test('Handle special characters in key', async () => {
        const key = 'test:special:chars:key:123';
        await cache.set(key, 'value', 10000);
        const retrieved = await cache.get(key);
        assert(retrieved === 'value', 'Should handle special characters in key');
    });

    // ============ 斷開連接測試 ============
    console.log('\n🔌 Section 9: Disconnection Tests');
    console.log('─'.repeat(50));

    await test('Disconnect from Redis', async () => {
        await cache.disconnect();
        assert(cache.isConnected === false, 'Should be disconnected');
    });

    await test('Operations fail gracefully when disconnected', async () => {
        const result = await cache.set('test:disconnected', 'value', 10000);
        assert(result === false, 'Set should fail when disconnected');

        const value = await cache.get('test:disconnected');
        assert(value === null, 'Get should return null when disconnected');
    });

    // ============ 測試結果 ============
    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Results');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${stats.total}`);
    console.log(`✅ Passed: ${stats.passed}`);
    console.log(`❌ Failed: ${stats.failed}`);
    console.log(`Success Rate: ${((stats.passed / stats.total) * 100).toFixed(1)}%`);
    console.log('='.repeat(60) + '\n');

    if (stats.failed > 0) {
        console.log('⚠️ Some tests failed. Please review the errors above.\n');
        process.exit(1);
    } else {
        console.log('🎉 All Redis tests passed successfully!\n');
    }
}

// 執行測試
runTests().catch(error => {
    console.error('\n❌ Redis test suite failed:', error);
    process.exit(1);
});

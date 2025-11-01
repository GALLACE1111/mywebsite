# Test Suite Documentation

This directory contains comprehensive test suites for the Leaderboard API v2.0.

## Test Files

### 1. `api-test.js` (Original Test Suite)
Basic API endpoint tests for the leaderboard functionality.

**Run:** `npm test` or `node test/api-test.js`

**Coverage:**
- Health check endpoint
- Get leaderboard (all-time, daily)
- Pagination
- Get user rank
- Get user rank with context
- Error handling (invalid parameters, non-existent users)
- Game type filters

### 2. `comprehensive-test.js` (New Integration Tests)
Comprehensive integration tests covering all v2.0 features.

**Run:** `node test/comprehensive-test.js`

**Coverage:**
- Basic endpoints (health, API info)
- Monitoring API (stats, Firestore, cache, quota, estimation, recommendations)
- Cache functionality (hit rates, clearing)
- Admin API (player management, pagination)
- Leaderboard backward compatibility
- Integration tests (score submission, cache invalidation, admin operations)
- Error handling

**Test Sections:**
1. Basic Tests (2 tests)
2. Monitoring API Tests (7 tests)
3. Cache Functionality Tests (3 tests)
4. Admin API Tests (2 tests)
5. Leaderboard API Tests (2 tests)
6. Integration Tests (4 tests)
7. Error Handling Tests (3 tests)

**Total:** 23 tests

### 3. `redis-test.js` (Redis Cache Adapter Tests)
Standalone tests for the Redis cache adapter.

**Run:** `node test/redis-test.js`

**Prerequisites:** Redis server must be running on localhost:6379

**Coverage:**
- Connection management
- Basic operations (set, get, delete)
- TTL/expiration handling
- Pattern-based deletion
- Statistics tracking
- Redis info retrieval
- Cache clearing
- Error handling
- Disconnection handling

**Test Sections:**
1. Connection Tests (2 tests)
2. Basic Operations (5 tests)
3. TTL Tests (2 tests)
4. Delete Operations (5 tests)
5. Statistics Tests (5 tests)
6. Redis Info Tests (1 test)
7. Cleanup Tests (1 test)
8. Error Handling Tests (3 tests)
9. Disconnection Tests (2 tests)

**Total:** 26 tests

---

## Running Tests

### Prerequisites

1. **Server must be running:**
   ```bash
   npm start
   # or
   npm run dev
   ```

2. **For Redis tests:**
   - Redis server must be running
   - Set `USE_REDIS=true` in `.env` (optional for Redis tests)

### Run All Test Suites

```bash
# Run original API tests
npm test

# Run comprehensive integration tests
node test/comprehensive-test.js

# Run Redis cache tests
node test/redis-test.js
```

### Quick Test All

```bash
# Run all tests in sequence
npm test && node test/comprehensive-test.js && node test/redis-test.js
```

---

## Test Results

### Expected Results

**api-test.js:**
- Total: 10 tests
- Expected: 100% pass rate

**comprehensive-test.js:**
- Total: 23 tests
- Expected: 95.7% pass rate (22/23)
- Note: 1 test may fail due to test ordering (monitoring stats reset)

**redis-test.js:**
- Total: 26 tests
- Expected: 100% pass rate (requires Redis)

### Common Issues

#### Port Already in Use
If you see "EADDRINUSE: address already in use", the server is already running. This is okay for running tests.

#### Redis Connection Failed
If Redis tests fail with connection errors:
1. Ensure Redis is installed: `redis-server --version`
2. Start Redis: `redis-server`
3. Check connection: `redis-cli ping` (should return "PONG")

#### Firestore Connection Failed
Ensure your `.env` file has valid Firebase credentials:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

---

## Writing New Tests

### Test Template

```javascript
#!/usr/bin/env node

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

const stats = {
    total: 0,
    passed: 0,
    failed: 0
};

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

async function runTests() {
    console.log('\\n🧪 My Test Suite\\n');

    await test('My test case', async () => {
        const data = await fetchJSON(`${BASE_URL}/api/endpoint`);
        assert(data.success === true, 'Should be successful');
    });

    // Print results
    console.log(`\\nTotal: ${stats.total}`);
    console.log(`✅ Passed: ${stats.passed}`);
    console.log(`❌ Failed: ${stats.failed}`);

    if (stats.failed > 0) {
        process.exit(1);
    }
}

runTests().catch(error => {
    console.error('\\n❌ Test suite failed:', error);
    process.exit(1);
});
```

---

## Continuous Integration

### Recommended CI Pipeline

```yaml
# .github/workflows/test.yml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      redis:
        image: redis
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Start server
        run: npm start &
        env:
          USE_REDIS: true
          REDIS_URL: redis://localhost:6379

      - name: Wait for server
        run: sleep 5

      - name: Run API tests
        run: npm test

      - name: Run comprehensive tests
        run: node test/comprehensive-test.js

      - name: Run Redis tests
        run: node test/redis-test.js
```

---

## Test Coverage

### Current Coverage

- ✅ Basic API endpoints
- ✅ Monitoring endpoints
- ✅ Admin endpoints
- ✅ Cache functionality
- ✅ Redis adapter
- ✅ Error handling
- ✅ Integration scenarios

### Areas for Future Testing

- Load testing (concurrent requests)
- Performance benchmarks
- Security testing (authentication bypass attempts)
- Edge cases (very large datasets, boundary values)
- Network failure scenarios
- Long-running operations

---

## Troubleshooting

### Test Failures

1. **Check server is running:** `curl http://localhost:3000/api/health`
2. **Check Redis is running:** `redis-cli ping`
3. **Check Firebase credentials:** Verify `.env` file
4. **Check test order:** Some tests depend on previous tests

### Performance Issues

If tests run slowly:
1. Check network latency
2. Check Firestore quota (may be rate limited)
3. Check Redis connection
4. Reduce test timeout values

### Debugging

Add verbose logging:
```javascript
// In test file
console.log('Request:', url, options);
console.log('Response:', data);
```

Run server with verbose logs:
```bash
DEBUG=* npm start
```

---

## Summary

All test suites are comprehensive and cover the major functionality of the Leaderboard API v2.0. The tests verify:
- Core leaderboard features
- Redis caching
- Monitoring and statistics
- Admin management
- Error handling
- Integration scenarios

For detailed test results, see `TEST_RESULTS.md` in the parent directory.

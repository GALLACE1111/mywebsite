# 分數排行榜後端系統

一個完整的分數排行榜系統，採用混合架構（PHP + Node.js），結合 MySQL 持久化與 Redis 高效能查詢。

## 📋 目錄結構

```
backend/
├── database/                    # 資料庫相關
│   ├── schema.sql              # MySQL 資料庫結構
│   ├── config.example.php      # PHP 資料庫配置範例
│   └── config.php              # 實際配置（需自行建立）
│
├── php/                        # PHP 後端（分數提交）
│   ├── Database.php            # MySQL 連線類別
│   ├── RedisClient.php         # Redis 客戶端類別
│   ├── submit-score.php        # 分數提交 API
│   └── .htaccess               # Apache 路由設定
│
├── nodejs/                     # Node.js 後端（排行榜查詢）
│   ├── config/
│   │   └── database.js         # 資料庫連線配置
│   ├── services/
│   │   └── leaderboard.service.js  # 排行榜服務邏輯
│   ├── routes/
│   │   └── leaderboard.routes.js   # API 路由
│   ├── scripts/
│   │   └── rebuild-leaderboard.js  # 重建排行榜腳本
│   ├── test/
│   │   └── api-test.js         # API 測試腳本
│   ├── server.js               # 主伺服器
│   ├── package.json
│   ├── .env.example            # 環境變數範例
│   └── .env                    # 實際環境變數（需自行建立）
│
└── README.md                   # 本文件
```

## 🚀 快速開始

### 1. 安裝資料庫

#### 安裝 MySQL
```bash
# 匯入資料庫結構
mysql -u root -p < database/schema.sql

# 或使用特定資料庫
mysql -u root -p your_database < database/schema.sql
```

#### 安裝 Redis
```bash
# Windows (使用 Chocolatey)
choco install redis-64

# macOS
brew install redis

# Linux (Ubuntu/Debian)
sudo apt-get install redis-server

# 啟動 Redis
redis-server
```

### 2. 設定 PHP 後端

#### 複製並設定資料庫配置
```bash
cd backend
cp database/config.example.php database/config.php
```

編輯 `database/config.php`，填入實際的資料庫資訊：
```php
return [
    'mysql' => [
        'host' => 'localhost',
        'port' => 3306,
        'database' => 'leaderboard_db',
        'username' => 'your_username',
        'password' => 'your_password',
    ],
    'redis' => [
        'host' => '127.0.0.1',
        'port' => 6379,
    ]
];
```

#### 啟動 PHP 伺服器（開發環境）
```bash
cd php
php -S localhost:8000
```

### 3. 設定 Node.js 後端

#### 安裝依賴
```bash
cd nodejs
npm install
```

#### 設定環境變數
```bash
cp .env.example .env
```

編輯 `.env` 檔案：
```env
PORT=3000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=leaderboard_db
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

#### 啟動 Node.js 伺服器
```bash
# 生產環境
npm start

# 開發環境（自動重啟）
npm run dev
```

## 📡 API 文件

### PHP API（分數提交）

#### POST `/api/scores` - 提交分數

**請求：**
```bash
curl -X POST http://localhost:8000/submit-score.php \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "score": 9500,
    "game_type": "default",
    "metadata": {
      "level": 10,
      "time_spent": 120
    }
  }'
```

**回應：**
```json
{
  "success": true,
  "data": {
    "score_id": 123,
    "user_id": 1,
    "username": "Alice",
    "score": 9500,
    "game_type": "default",
    "redis_synced": true,
    "created_at": "2025-10-27 12:00:00"
  }
}
```

### Node.js API（排行榜查詢）

#### GET `/api/leaderboard` - 獲取排行榜

**參數：**
- `period`: 時間範圍（`daily` / `weekly` / `monthly` / `all`，預設：`all`）
- `game_type`: 遊戲類型（預設：`default`）
- `page`: 頁碼（預設：`1`）
- `limit`: 每頁數量（預設：`50`，最大：`100`）

**範例：**
```bash
# 獲取全時段排行榜
curl "http://localhost:3000/api/leaderboard?period=all&page=1&limit=10"

# 獲取今日排行榜
curl "http://localhost:3000/api/leaderboard?period=daily&page=1&limit=10"
```

**回應：**
```json
{
  "success": true,
  "period": "all",
  "game_type": "default",
  "page": 1,
  "limit": 10,
  "total": 100,
  "total_pages": 10,
  "data": [
    {
      "rank": 1,
      "user_id": 5,
      "username": "Eve",
      "score": 9800
    },
    {
      "rank": 2,
      "user_id": 1,
      "username": "Alice",
      "score": 9500
    }
  ]
}
```

#### GET `/api/leaderboard/my-rank/:userId` - 獲取個人排名

**範例：**
```bash
curl "http://localhost:3000/api/leaderboard/my-rank/1?period=all"
```

**回應：**
```json
{
  "success": true,
  "user_id": 1,
  "username": "Alice",
  "rank": 2,
  "score": 9500,
  "total_users": 100,
  "percentile": "98.00%"
}
```

#### GET `/api/leaderboard/around/:userId` - 獲取用戶周圍排名

**參數：**
- `range`: 前後範圍（預設：`5`）

**範例：**
```bash
curl "http://localhost:3000/api/leaderboard/around/1?range=3"
```

**回應：**
```json
{
  "success": true,
  "user_id": 1,
  "user_rank": 2,
  "data": [
    {
      "rank": 1,
      "user_id": 5,
      "username": "Eve",
      "score": 9800,
      "is_current_user": false
    },
    {
      "rank": 2,
      "user_id": 1,
      "username": "Alice",
      "score": 9500,
      "is_current_user": true
    },
    {
      "rank": 3,
      "user_id": 9,
      "username": "Ivy",
      "score": 9400,
      "is_current_user": false
    }
  ]
}
```

#### POST `/api/leaderboard/rebuild` - 重建排行榜（管理員）

**請求：**
```bash
curl -X POST http://localhost:3000/api/leaderboard/rebuild \
  -H "Content-Type: application/json" \
  -d '{
    "period": "all",
    "game_type": "default"
  }'
```

**回應：**
```json
{
  "success": true,
  "message": "Leaderboard rebuilt successfully for all period"
}
```

## 🔧 維護與管理

### 手動重建排行榜

如果 Redis 資料遺失或需要重新同步：

```bash
cd nodejs

# 方法 1: 使用 API
curl -X POST http://localhost:3000/api/leaderboard/rebuild \
  -H "Content-Type: application/json" \
  -d '{"period": "all", "game_type": "default"}'

# 方法 2: 使用命令列腳本
npm run rebuild
```

### 定時任務

系統已自動設定每天凌晨 1 點重建所有排行榜（`server.js:115`）。

如需修改時間，編輯 `server.js` 中的 cron 設定：
```javascript
// 每天凌晨 1 點
cron.schedule('0 1 * * *', async () => { ... });

// 每小時
cron.schedule('0 * * * *', async () => { ... });

// 每 30 分鐘
cron.schedule('*/30 * * * *', async () => { ... });
```

### 監控 Redis 狀態

```bash
# 連線到 Redis
redis-cli

# 查看所有排行榜 key
KEYS leaderboard:*

# 查看特定排行榜人數
ZCARD leaderboard:default:all

# 查看前 10 名
ZREVRANGE leaderboard:default:all 0 9 WITHSCORES

# 查看特定用戶分數
ZSCORE leaderboard:default:all 1

# 查看特定用戶排名（從 0 開始）
ZREVRANK leaderboard:default:all 1
```

## 🎯 架構優勢

### 為什麼使用混合架構？

1. **PHP 處理寫入**：
   - 簡單穩定，適合處理分數提交
   - 直接寫入 MySQL 確保資料持久化
   - 同步更新 Redis 實現即時排名

2. **Node.js 處理查詢**：
   - 非同步 I/O，適合高並發查詢
   - `ioredis` 提供高效能 Redis 操作
   - 支援複雜的排行榜邏輯

3. **Redis Sorted Sets**：
   - `O(log N)` 時間複雜度插入/查詢
   - 原生支援分數排序
   - 記憶體快取，查詢極快

4. **MySQL 持久化**：
   - 資料永久儲存
   - 支援複雜查詢與統計
   - 作為 Redis 的資料來源

## 🧪 測試

```bash
cd nodejs

# 運行 API 測試
npm test
```

## 📊 效能優化建議

### 針對大規模（>10萬用戶）

1. **Redis 記憶體優化**：
   - 只保留 TOP 10,000 排名在 Redis
   - 使用 `ZREMRANGEBYRANK` 定期清理

2. **資料庫索引**：
   - 已在 `schema.sql` 中建立所有必要索引
   - 定期執行 `ANALYZE TABLE` 優化查詢

3. **分散式架構**：
   - 可依遊戲類型分片（不同 game_type 使用不同 Redis 實例）
   - 使用 Redis Cluster 提升容量

4. **快取策略**：
   - 熱門查詢（TOP 100）可額外快取 5 分鐘
   - 使用 CDN 快取靜態排行榜頁面

## ⚠️ 注意事項

1. **資料一致性**：
   - Redis 為快取層，MySQL 為真實來源
   - 如遇 Redis 故障，系統會自動從 MySQL 重建

2. **安全性**：
   - 生產環境請加入身份驗證（JWT）
   - 限制 API 呼叫頻率（Rate Limiting）
   - 驗證分數合法性（防止作弊）

3. **備份**：
   - 定期備份 MySQL 資料庫
   - Redis 資料可隨時從 MySQL 重建

## 📝 授權

MIT License

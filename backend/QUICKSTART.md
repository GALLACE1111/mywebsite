# 🚀 快速開始指南

本指南將幫助你在 5 分鐘內啟動分數排行榜系統。

## 📋 前置需求

- PHP 7.4+ (含 PDO、Redis 擴充)
- Node.js 18+
- MySQL 5.7+ 或 MariaDB 10.3+
- Redis 6.0+

## ⚡ 5 分鐘快速部署

### 步驟 1: 安裝資料庫

```bash
# 1. 建立 MySQL 資料庫
mysql -u root -p -e "CREATE DATABASE leaderboard_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 匯入資料庫結構（含測試資料）
mysql -u root -p leaderboard_db < database/schema.sql

# 3. 啟動 Redis（如果尚未啟動）
redis-server
```

### 步驟 2: 設定 PHP 後端

```bash
# 1. 複製配置檔案
cd backend
cp database/config.example.php database/config.php

# 2. 編輯 config.php，填入你的資料庫資訊
# 使用任何文字編輯器，例如：
nano database/config.php
# 或
code database/config.php

# 3. 啟動 PHP 開發伺服器
cd php
php -S localhost:8000
```

配置範例（`database/config.php`）：
```php
return [
    'mysql' => [
        'host' => 'localhost',
        'port' => 3306,
        'database' => 'leaderboard_db',
        'username' => 'root',      // 改成你的 MySQL 用戶名
        'password' => 'your_pass',  // 改成你的 MySQL 密碼
        'charset' => 'utf8mb4',
    ],
    'redis' => [
        'host' => '127.0.0.1',
        'port' => 6379,
        'password' => null,
        'database' => 0,
    ]
];
```

### 步驟 3: 設定 Node.js 後端

```bash
# 1. 安裝依賴
cd nodejs
npm install

# 2. 複製環境變數檔案
cp .env.example .env

# 3. 編輯 .env，填入你的資料庫資訊
nano .env
# 或
code .env

# 4. 啟動 Node.js 伺服器
npm start
```

環境變數範例（`.env`）：
```env
PORT=3000
NODE_ENV=development

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=leaderboard_db
MYSQL_USER=root           # 改成你的 MySQL 用戶名
MYSQL_PASSWORD=your_pass  # 改成你的 MySQL 密碼

REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## 🧪 測試 API

### 測試 1: 提交分數（PHP API）

```bash
curl -X POST http://localhost:8000/submit-score.php \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "score": 9999,
    "game_type": "default"
  }'
```

預期回應：
```json
{
  "success": true,
  "data": {
    "score_id": 11,
    "user_id": 1,
    "username": "Alice",
    "score": 9999,
    "game_type": "default",
    "redis_synced": true,
    "created_at": "2025-10-27 12:00:00"
  }
}
```

### 測試 2: 查看排行榜（Node.js API）

```bash
# 查看全時段 TOP 10
curl "http://localhost:3000/api/leaderboard?period=all&limit=10"
```

預期回應：
```json
{
  "success": true,
  "period": "all",
  "game_type": "default",
  "page": 1,
  "limit": 10,
  "total": 10,
  "total_pages": 1,
  "data": [
    {
      "rank": 1,
      "user_id": 1,
      "username": "Alice",
      "score": 9999
    },
    ...
  ]
}
```

### 測試 3: 查看個人排名

```bash
curl "http://localhost:3000/api/leaderboard/my-rank/1?period=all"
```

預期回應：
```json
{
  "success": true,
  "user_id": 1,
  "username": "Alice",
  "rank": 1,
  "score": 9999,
  "total_users": 10,
  "percentile": "100.00%"
}
```

## 🎉 完成！

現在你已經成功啟動了排行榜系統！

### 接下來可以做什麼？

1. **前端整合**：參考 `README.md` 的 API 文件，將排行榜整合到你的前端頁面
2. **自動化測試**：執行 `npm test` 測試所有 API 端點
3. **生產部署**：參考 `DEPLOYMENT.md` 部署到正式環境

## 🔧 常見問題

### Q1: Redis 連線失敗怎麼辦？

```bash
# 檢查 Redis 是否正在運行
redis-cli ping
# 應該回應: PONG

# 如果沒有回應，啟動 Redis
redis-server
```

### Q2: MySQL 連線失敗怎麼辦？

```bash
# 檢查 MySQL 是否正在運行
mysql -u root -p -e "SELECT 1;"

# 檢查資料庫是否存在
mysql -u root -p -e "SHOW DATABASES LIKE 'leaderboard_db';"
```

### Q3: PHP Redis 擴充未安裝？

```bash
# Ubuntu/Debian
sudo apt-get install php-redis

# macOS
pecl install redis

# Windows
# 下載 dll 檔案放到 PHP ext 目錄，並在 php.ini 加入：
# extension=php_redis.dll
```

### Q4: Node.js 版本太舊？

```bash
# 檢查版本
node --version  # 需要 18.0.0 或更高

# 升級 Node.js（使用 nvm）
nvm install 18
nvm use 18
```

## 📚 更多資訊

- 完整 API 文件：`README.md`
- 架構說明：`README.md#架構優勢`
- 效能優化：`README.md#效能優化建議`
- 故障排除：`README.md#維護與管理`

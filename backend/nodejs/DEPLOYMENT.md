# 部署指南

本文檔說明如何部署 Leaderboard API 到不同的平台。

## 目錄
- [本地部署（PM2）](#本地部署pm2)
- [雲端部署選項](#雲端部署選項)
  - [Render.com](#rendercom推薦)
  - [Railway.app](#railwayapp)
  - [Vercel](#vercel)
  - [Google Cloud Run](#google-cloud-run)

---

## 本地部署（PM2）

### 1. 安裝 PM2
```bash
npm install -g pm2
```

### 2. 配置環境變數
複製 `.env.example` 為 `.env` 並填入配置：
```bash
cp .env.example .env
```

編輯 `.env` 文件：
```env
# Firebase 配置
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Redis 配置（可選）
USE_REDIS=true
REDIS_HOST=localhost
REDIS_PORT=6379

# 伺服器配置
PORT=3000
NODE_ENV=production
```

### 3. 啟動應用
```bash
# 啟動應用
pm2 start ecosystem.config.cjs

# 查看狀態
pm2 status

# 查看日誌
pm2 logs leaderboard-api

# 重啟應用
pm2 restart leaderboard-api

# 停止應用
pm2 stop leaderboard-api

# 開機自啟
pm2 startup
pm2 save
```

### 4. 常用命令
```bash
# 監控
pm2 monit

# 刪除應用
pm2 delete leaderboard-api

# 重載配置
pm2 reload ecosystem.config.cjs

# 查看詳細信息
pm2 show leaderboard-api
```

---

## 雲端部署選項

### Render.com（推薦）

**優點：**
- ✅ 免費方案提供 750 小時/月
- ✅ 支援自動部署（Git 推送即部署）
- ✅ 內建 SSL 證書
- ✅ 易於使用

**步驟：**

1. 在 Render.com 註冊帳號
2. 創建新的 Web Service
3. 連接 GitHub/GitLab 倉庫
4. 配置：
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. 添加環境變數（從 `.env` 文件複製）
6. 部署！

**配置文件：**
創建 `render.yaml`：
```yaml
services:
  - type: web
    name: leaderboard-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
      - key: FIREBASE_PROJECT_ID
        sync: false
      - key: FIREBASE_PRIVATE_KEY
        sync: false
      - key: FIREBASE_CLIENT_EMAIL
        sync: false
```

---

### Railway.app

**優點：**
- ✅ 免費 $5 月度額度
- ✅ 支援自動部署
- ✅ 簡單易用

**步驟：**

1. 在 Railway.app 註冊
2. 點擊 "New Project" → "Deploy from GitHub"
3. 選擇倉庫
4. Railway 會自動檢測 Node.js 項目
5. 添加環境變數
6. 部署完成！

**配置文件：**
創建 `railway.json`：
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

### Vercel

**優點：**
- ✅ 完全免費
- ✅ 全球 CDN
- ✅ 自動 HTTPS

**限制：**
- ⚠️ Serverless 函數（有冷啟動）
- ⚠️ 10 秒執行時間限制

**步驟：**

1. 安裝 Vercel CLI：
```bash
npm install -g vercel
```

2. 創建 `vercel.json`：
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

3. 部署：
```bash
vercel
```

---

### Google Cloud Run

**優點：**
- ✅ 免費額度：每月 200 萬次請求
- ✅ 自動擴展
- ✅ 僅在使用時計費

**步驟：**

1. 創建 `Dockerfile`：
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

2. 創建 `.dockerignore`：
```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
```

3. 部署到 Cloud Run：
```bash
# 安裝 Google Cloud SDK
# https://cloud.google.com/sdk/docs/install

# 登入
gcloud auth login

# 設定項目
gcloud config set project YOUR_PROJECT_ID

# 構建並部署
gcloud run deploy leaderboard-api \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 環境變數設置

所有平台都需要設置以下環境變數：

```env
# 必須
NODE_ENV=production
PORT=3000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# 可選（Redis）
USE_REDIS=false
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

**⚠️ 注意：**
- `FIREBASE_PRIVATE_KEY` 包含換行符 `\n`，確保正確轉義
- 生產環境建議使用 Redis 提升性能

---

## 部署後檢查清單

- [ ] 訪問 `/health` 端點確認服務運行
- [ ] 測試 API 端點：`/api/leaderboard`
- [ ] 檢查環境變數是否正確
- [ ] 確認 Firebase 連接成功
- [ ] 測試分數提交功能
- [ ] 設置監控和日誌
- [ ] 更新前端配置文件中的 API URL

---

## 故障排除

### 問題：Firebase 連接失敗
**解決：**
- 檢查 `FIREBASE_PRIVATE_KEY` 格式是否正確
- 確認換行符 `\n` 沒有被轉義兩次
- 驗證 Service Account 權限

### 問題：Redis 連接失敗
**解決：**
- 檢查 Redis 服務是否運行
- 確認連接信息正確
- 或設置 `USE_REDIS=false` 使用記憶體快取

### 問題：CORS 錯誤
**解決：**
- 檢查 `server.js` 中的 CORS 配置
- 確認前端域名在白名單中

---

## 性能優化建議

1. **啟用 Redis 快取** - 減少 Firestore 讀取次數
2. **設置 CDN** - 加速全球訪問
3. **監控配額使用** - 使用 `/api/monitoring/stats` 端點
4. **壓縮響應** - 已在 `server.js` 中配置
5. **限流** - 防止濫用 API

---

## 監控和維護

### PM2 監控
```bash
pm2 monit
pm2 logs leaderboard-api --lines 100
```

### 查看配額使用
```bash
curl http://your-domain.com/api/monitoring/quota
```

### 健康檢查
```bash
curl http://your-domain.com/health
```

---

## 支援

如有問題，請檢查：
- [PM2 官方文檔](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Render 文檔](https://render.com/docs)
- [Railway 文檔](https://docs.railway.app/)
- 項目 GitHub Issues

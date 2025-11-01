# GitHub Pages + Backend API 部署指南

## 📋 架構說明

因為 GitHub Pages 只能託管靜態文件，我們採用分離式架構：

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  GitHub Pages (前端)                            │
│  https://gallace1111.github.io/mywebsite        │
│  ├── HTML/CSS/JavaScript                        │
│  └── 靜態資源                                    │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 │ HTTPS API 請求
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│                                                 │
│  Render.com (後端 API)                          │
│  https://mywebsite-api.onrender.com            │
│  ├── Node.js Server                             │
│  ├── Redis Cache                                │
│  └── Firebase Database                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🚀 步驟 1: 部署後端到 Render

### 1.1 創建 Render 帳號

訪問 https://render.com 並使用 GitHub 登入

### 1.2 創建 Web Service

1. 點擊 **"New +"** → **"Web Service"**
2. 連接 GitHub 倉庫：`GALLACE1111/mywebsite`
3. 配置如下：

```yaml
Name: mywebsite-api
Environment: Node
Region: Oregon (或 Singapore 更接近台灣)
Branch: main
Root Directory: backend/nodejs
Build Command: npm install
Start Command: npm start
```

### 1.3 添加環境變數

在 Render Dashboard 的 Environment 標籤頁添加：

```env
NODE_ENV=production
PORT=3000

# Firebase 配置（從 backend/nodejs/.env 複製）
FIREBASE_PROJECT_ID=side-project-663de
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@side-project-663de.iam.gserviceaccount.com

# Redis（可選，Render 免費方案不含 Redis，設為 false）
USE_REDIS=false
```

⚠️ **重要：** `FIREBASE_PRIVATE_KEY` 必須保留所有的 `\n` 換行符

### 1.4 部署

點擊 **"Create Web Service"**，Render 會自動：
- 讀取 `render.yaml` 配置
- 安裝依賴
- 啟動服務
- 提供 HTTPS URL

部署完成後會得到：
```
https://mywebsite-api.onrender.com
```

### 1.5 驗證部署

訪問以下端點測試：
```bash
curl https://mywebsite-api.onrender.com/health
# 應返回: {"status":"ok","timestamp":"..."}

curl https://mywebsite-api.onrender.com/api/leaderboard
# 應返回排行榜數據
```

---

## 🌐 步驟 2: 配置 GitHub Pages

### 2.1 檢查 GitHub Pages 設置

1. 訪問 https://github.com/GALLACE1111/mywebsite/settings/pages
2. 確認配置：
   - **Source**: Deploy from a branch
   - **Branch**: main
   - **Folder**: / (root) 或 /frontend（如果設置了）

### 2.2 驗證 GitHub Pages URL

你的網站應該在：
```
https://gallace1111.github.io/mywebsite
```

---

## 🔧 步驟 3: 更新前端 API 配置

### 3.1 更新 config.js

編輯 `frontend/config.js`，將 Render 的 URL 填入：

```javascript
const CONFIG = {
    // 開發環境（本地測試）
    development: {
        API_BASE_URL: 'http://localhost:3000/api'
    },

    // 生產環境（GitHub Pages）
    production: {
        // 替換為你的 Render API URL
        API_BASE_URL: 'https://mywebsite-api.onrender.com/api'
    }
};

// 自動檢測環境
const isProduction = window.location.hostname !== 'localhost' &&
                     window.location.hostname !== '127.0.0.1' &&
                     !window.location.hostname.includes('192.168') &&
                     window.location.protocol !== 'file:';

const currentConfig = isProduction ? CONFIG.production : CONFIG.development;

if (typeof window !== 'undefined') {
    window.APP_CONFIG = currentConfig;
}
```

### 3.2 提交並推送

```bash
git add frontend/config.js
git commit -m "chore: Update production API URL for Render deployment"
git push origin main
```

GitHub Pages 會自動重新部署（約 1-2 分鐘）

---

## ✅ 步驟 4: 配置 CORS

後端已配置 CORS 允許 GitHub Pages：

```javascript
// server.js 已包含
const allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://gallace1111.github.io'  // GitHub Pages
];
```

如果需要添加更多域名，編輯 `backend/nodejs/server.js` 第 20 行。

---

## 🧪 步驟 5: 測試完整流程

### 5.1 測試後端 API

```bash
# 健康檢查
curl https://mywebsite-api.onrender.com/health

# 獲取排行榜
curl https://mywebsite-api.onrender.com/api/leaderboard

# 監控狀態
curl https://mywebsite-api.onrender.com/api/monitoring/stats
```

### 5.2 測試前端

1. 訪問 https://gallace1111.github.io/mywebsite
2. 打開瀏覽器開發者工具（F12）
3. 切換到 Console 標籤
4. 檢查是否有 API 請求錯誤
5. 查看 Network 標籤確認 API 調用成功

### 5.3 測試功能

- ✅ 排行榜顯示
- ✅ 分數提交
- ✅ 玩家排名查詢
- ✅ 管理後台（如果有）

---

## 📊 部署清單

- [ ] 後端部署到 Render
- [ ] 獲取 Render API URL
- [ ] 更新 `frontend/config.js` 中的生產 API URL
- [ ] 提交並推送到 GitHub
- [ ] 等待 GitHub Pages 自動部署
- [ ] 測試健康檢查端點
- [ ] 測試 API 功能
- [ ] 測試前端網站
- [ ] 檢查瀏覽器 Console 無錯誤
- [ ] 確認排行榜功能正常

---

## ⚠️ 常見問題

### Q1: CORS 錯誤
**問題：** 瀏覽器顯示 CORS policy 錯誤

**解決：**
1. 確認 `backend/nodejs/server.js` 中包含你的 GitHub Pages URL
2. 重新部署 Render 服務
3. 清除瀏覽器緩存

### Q2: API 請求失敗
**問題：** 前端無法連接 API

**解決：**
1. 檢查 `frontend/config.js` 中的 URL 是否正確
2. 確認 Render 服務正在運行
3. 檢查瀏覽器 Network 標籤查看實際請求的 URL

### Q3: Render 免費服務休眠
**問題：** Render 免費方案會在 15 分鐘無活動後休眠

**解決：**
- 第一次訪問可能需要 30-60 秒喚醒
- 考慮升級到付費方案（$7/月）
- 或使用 UptimeRobot 定期 ping（每 5 分鐘一次）

### Q4: GitHub Pages 更新慢
**問題：** 推送後網站沒有更新

**解決：**
1. 查看 https://github.com/GALLACE1111/mywebsite/actions
2. 等待 GitHub Actions 完成部署（通常 1-2 分鐘）
3. 清除瀏覽器緩存（Ctrl+F5）

---

## 🎯 優化建議

### 1. 使用自定義域名

在 GitHub 和 Render 都可以綁定自定義域名：

**GitHub Pages:**
- Settings → Pages → Custom domain
- 添加 CNAME 記錄指向 `gallace1111.github.io`

**Render:**
- Dashboard → Settings → Custom Domain
- 添加 A 記錄或 CNAME

### 2. 啟用 CDN

Render 自帶全球 CDN，GitHub Pages 也有。無需額外配置。

### 3. 監控服務

設置 UptimeRobot 監控：
- 目標：`https://mywebsite-api.onrender.com/health`
- 間隔：5 分鐘
- 通知：Email/Telegram

### 4. 環境變數管理

敏感信息不要提交到 Git：
- 使用 Render Dashboard 管理環境變數
- 本地使用 `.env` 文件（已在 `.gitignore` 中）

---

## 📈 成本分析

| 服務 | 方案 | 費用 | 限制 |
|------|------|------|------|
| GitHub Pages | 免費 | $0 | 1GB 空間，100GB 流量/月 |
| Render (Free) | 免費 | $0 | 750 小時/月，15 分鐘休眠 |
| Render (Starter) | 付費 | $7/月 | 無休眠，更多資源 |
| Firebase (Spark) | 免費 | $0 | 50K 讀/20K 寫/天 |

**推薦配置（免費）:**
- GitHub Pages：前端
- Render Free：後端 API
- Firebase Spark：數據庫

**總成本：** $0/月（完全免費）

---

## 🔗 相關鏈接

- **GitHub 倉庫：** https://github.com/GALLACE1111/mywebsite
- **GitHub Pages：** https://gallace1111.github.io/mywebsite
- **Render Dashboard：** https://dashboard.render.com
- **Firebase Console：** https://console.firebase.google.com

---

## 🆘 需要幫助？

1. 查看 Render 服務日誌
2. 查看 GitHub Actions 日誌
3. 檢查瀏覽器 Console 和 Network
4. 參考 `DEPLOYMENT.md` 詳細說明

---

**部署完成後，記得更新這個文件記錄你的實際 URL！**

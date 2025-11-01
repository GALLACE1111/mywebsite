# ⚡ 5分鐘快速部署指南

## 🎯 混合式部署架構

```
前端 (GitHub Pages)  ←→  後端 (Render.com)  ←→  資料庫 (Firebase)
   48 MB 靜態文件         Node.js API            Firestore
      完全免費               完全免費               完全免費
```

---

## ✅ 你的狀態（已完成）

- ✅ Git 倉庫已正確配置（node_modules 已忽略）
- ✅ 代碼已推送到 GitHub
- ✅ 部署配置文件已創建（render.yaml）
- ✅ 前端使用統一配置系統
- ✅ 後端已優化並測試

**只需 3 步完成部署！**

---

## 📝 步驟 1: 部署後端到 Render（2 分鐘）

### 1.1 註冊 Render

訪問：https://render.com

點擊 **"Get Started for Free"**，使用 GitHub 登入

### 1.2 創建 Web Service

1. 點擊 **"New +"** 按鈕
2. 選擇 **"Web Service"**
3. 點擊 **"Connect account"** 連接 GitHub
4. 找到並選擇：`GALLACE1111/mywebsite`
5. 點擊 **"Connect"**

### 1.3 配置服務

Render 會自動檢測到 `render.yaml`，但你需要手動設置：

**基本設置：**
```
Name: mywebsite-api
Region: Oregon (或 Singapore 更快)
Branch: main
Root Directory: backend/nodejs
Runtime: Node
Build Command: npm install
Start Command: npm start
```

**選擇方案：**
- 選擇 **"Free"** 方案

### 1.4 添加環境變數

點擊 **"Add Environment Variable"**，逐個添加：

```env
NODE_ENV
production

PORT
3000

FIREBASE_PROJECT_ID
side-project-663de

FIREBASE_CLIENT_EMAIL
firebase-adminsdk-xxxxx@side-project-663de.iam.gserviceaccount.com

FIREBASE_PRIVATE_KEY
-----BEGIN PRIVATE KEY-----
（完整複製你的私鑰，保留所有 \n）
-----END PRIVATE KEY-----

USE_REDIS
false
```

⚠️ **重要：**
- `FIREBASE_PRIVATE_KEY` 需要保留所有換行符
- 從 `backend/nodejs/.env` 文件複製

### 1.5 部署

點擊 **"Create Web Service"**

等待 3-5 分鐘，你會看到：
```
✅ Build successful
✅ Deploy live
```

你的後端 URL 會是：
```
https://mywebsite-api-xxxx.onrender.com
```

**記下這個 URL！**

### 1.6 測試後端

打開瀏覽器訪問：
```
https://mywebsite-api-xxxx.onrender.com/health
```

應該返回：
```json
{
  "status": "ok",
  "timestamp": "2025-11-02T...",
  "service": "leaderboard-api",
  "uptime": 123.45
}
```

✅ 成功！後端已部署！

---

## 📝 步驟 2: 更新前端配置（1 分鐘）

### 2.1 編輯配置文件

打開 `frontend/config.js`，修改第 14 行：

**修改前：**
```javascript
production: {
    API_BASE_URL: 'https://us-central1-side-project-663de.cloudfunctions.net/api'
}
```

**修改後：**
```javascript
production: {
    // 替換為你的 Render URL
    API_BASE_URL: 'https://mywebsite-api-xxxx.onrender.com/api'
}
```

### 2.2 提交並推送

```bash
cd D:\網頁\website
git add frontend/config.js
git commit -m "chore: Update production API URL to Render"
git push origin main
```

GitHub Pages 會自動重新部署（1-2 分鐘）

---

## 📝 步驟 3: 驗證部署（2 分鐘）

### 3.1 檢查 GitHub Pages

訪問：https://gallace1111.github.io/mywebsite

### 3.2 打開開發者工具

按 `F12` 打開瀏覽器開發者工具

### 3.3 檢查 Console

應該沒有錯誤，類似：
```
✅ Config loaded: production
✅ API Base URL: https://mywebsite-api-xxxx.onrender.com/api
```

### 3.4 檢查 Network

切換到 **Network** 標籤，刷新頁面：
- 查看 API 請求
- 狀態應該是 `200 OK`
- 響應時間第一次可能 30 秒（喚醒 Render）
- 之後應該 < 1 秒

### 3.5 測試功能

測試以下功能：
- [ ] 排行榜顯示
- [ ] 分數提交
- [ ] 玩家排名查詢
- [ ] 管理後台（如果有）

✅ 全部完成！

---

## 🎉 部署完成檢查清單

- [ ] Render 服務狀態顯示 "Live"
- [ ] 健康檢查端點返回 OK
- [ ] GitHub Pages 網站可訪問
- [ ] 前端配置已更新並推送
- [ ] 瀏覽器 Console 無錯誤
- [ ] API 請求成功（Network 200 OK）
- [ ] 排行榜功能正常
- [ ] 分數提交功能正常

---

## 📊 部署結果

### 你的網址

**前端（GitHub Pages）：**
```
https://gallace1111.github.io/mywebsite
```

**後端 API（Render）：**
```
https://mywebsite-api-xxxx.onrender.com
```

**API 端點：**
```
GET  https://mywebsite-api-xxxx.onrender.com/health
GET  https://mywebsite-api-xxxx.onrender.com/api/leaderboard
POST https://mywebsite-api-xxxx.onrender.com/api/leaderboard/submit
GET  https://mywebsite-api-xxxx.onrender.com/api/monitoring/stats
```

---

## ⚠️ Render 免費方案注意事項

### 休眠機制

Render 免費方案會在 **15 分鐘** 無活動後休眠：
- 第一次訪問需要 30-60 秒喚醒
- 之後正常速度 < 1 秒

### 解決方案

#### 方案 A: 使用 UptimeRobot（推薦）

1. 註冊：https://uptimerobot.com（免費）
2. 添加監控：
   ```
   Monitor Type: HTTP(s)
   URL: https://mywebsite-api-xxxx.onrender.com/health
   Monitoring Interval: 5 minutes
   ```
3. UptimeRobot 每 5 分鐘 ping 一次，保持喚醒

#### 方案 B: 升級到付費方案

Render Starter: **$7/月**
- 無休眠
- 更多資源
- 更快速度

---

## 💰 成本總結

| 服務 | 方案 | 成本 | 說明 |
|------|------|------|------|
| GitHub Pages | 免費 | $0 | 前端託管 |
| Render | 免費 | $0 | 後端 API |
| Firebase | Spark | $0 | 資料庫 |
| UptimeRobot | 免費 | $0 | 監控（可選） |
| **總計** | | **$0/月** | **完全免費** |

---

## 🔄 未來更新流程

### 更新前端

```bash
# 修改前端代碼
git add frontend/
git commit -m "feat: 更新前端功能"
git push

# GitHub Pages 自動部署（1-2 分鐘）
```

### 更新後端

```bash
# 修改後端代碼
git add backend/
git commit -m "feat: 更新後端 API"
git push

# Render 自動部署（3-5 分鐘）
```

---

## 🆘 常見問題

### Q1: Render 部署失敗

**檢查：**
1. Render Dashboard → Logs
2. 確認環境變數格式正確
3. 確認 `Root Directory` 設置為 `backend/nodejs`

### Q2: 前端無法連接 API

**檢查：**
1. `frontend/config.js` 中的 URL 是否正確
2. Render 服務是否在運行（Dashboard 顯示 "Live"）
3. 瀏覽器 Console 和 Network 標籤

### Q3: CORS 錯誤

**解決：**
1. 編輯 `backend/nodejs/server.js`
2. 在 `allowedOrigins` 數組中添加你的域名
3. 推送更新

### Q4: Firebase 連接失敗

**檢查：**
1. Render 環境變數中的 Firebase 配置
2. 確保 `FIREBASE_PRIVATE_KEY` 包含完整的密鑰
3. 檢查換行符 `\n` 是否正確

---

## 📚 相關文檔

- **詳細部署指南：** `DEPLOYMENT.md`
- **部署策略：** `DEPLOYMENT_STRATEGY.md`
- **GitHub Pages 配置：** `GITHUB_PAGES_DEPLOYMENT.md`
- **快速啟動：** `backend/nodejs/START.md`

---

## 🎯 下一步建議

1. **設置 UptimeRobot** - 防止 Render 休眠
2. **自定義域名**（可選）- 更專業的 URL
3. **啟用分析**（可選）- Google Analytics
4. **SEO 優化**（可選）- meta 標籤、sitemap

---

**準備好了嗎？開始部署吧！** 🚀

有任何問題隨時問我！

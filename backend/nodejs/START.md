# 🚀 快速啟動指南

## 立即開始使用

### 選項 1: 開發模式（推薦用於測試）
```bash
npm run dev
```
✅ 自動重載
✅ 詳細日誌
✅ 適合開發測試

### 選項 2: 生產模式（PM2 長期運行）
```bash
# 1. 安裝 PM2（只需一次）
npm install -g pm2

# 2. 啟動服務
pm2 start ecosystem.config.cjs

# 3. 查看狀態
pm2 status

# 4. 查看日誌
pm2 logs leaderboard-api

# 5. 設置開機自啟（可選）
pm2 startup
pm2 save
```

### 選項 3: Docker 容器化
```bash
# 構建鏡像
docker build -t leaderboard-api .

# 運行容器
docker run -d -p 3000:3000 --env-file .env --name leaderboard leaderboard-api

# 查看日誌
docker logs -f leaderboard
```

---

## ✅ 檢查服務是否正常運行

訪問以下 URL：
- 健康檢查: http://localhost:3000/health
- 監控狀態: http://localhost:3000/api/monitoring/stats
- 排行榜: http://localhost:3000/api/leaderboard

---

## 📦 雲端部署

選擇一個平台快速部署：

### Render.com（推薦 - 最簡單）
1. 訪問 https://render.com
2. 創建 Web Service
3. 連接 Git 倉庫
4. Render 自動讀取 `render.yaml`
5. 添加環境變數
6. 部署！

### Railway.app
1. 訪問 https://railway.app
2. New Project → Deploy from GitHub
3. 選擇倉庫
4. 添加環境變數
5. 自動部署！

### Vercel（適合無狀態應用）
```bash
npm install -g vercel
vercel
```

詳細步驟請參考 [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🔧 常用命令

### PM2 管理
```bash
pm2 start ecosystem.config.cjs    # 啟動
pm2 stop leaderboard-api          # 停止
pm2 restart leaderboard-api       # 重啟
pm2 logs leaderboard-api          # 查看日誌
pm2 monit                         # 監控面板
pm2 delete leaderboard-api        # 刪除
```

### 測試 API
```bash
# 健康檢查
curl http://localhost:3000/health

# 獲取排行榜
curl http://localhost:3000/api/leaderboard

# 提交分數
curl -X POST http://localhost:3000/api/leaderboard/submit \
  -H "Content-Type: application/json" \
  -d '{"userId":"test_user","score":100}'

# 監控狀態
curl http://localhost:3000/api/monitoring/stats
```

---

## 📊 前端配置

更新前端 `config.js` 中的生產環境 URL：
```javascript
production: {
    API_BASE_URL: 'https://your-domain.com/api'  // 替換為你的域名
}
```

---

## 🆘 遇到問題？

### 伺服器無法啟動
- 檢查 `.env` 文件是否存在
- 確認 Firebase 配置正確
- 檢查端口 3000 是否被佔用

### Firebase 連接失敗
- 驗證 `FIREBASE_PROJECT_ID`
- 檢查 `FIREBASE_PRIVATE_KEY` 格式（包含 `\n`）
- 確認 Service Account 權限

### Redis 連接失敗
- 如果不使用 Redis，設置 `USE_REDIS=false`
- 檢查 Redis 服務是否運行
- 驗證連接信息

---

## 📚 更多資源

- [完整部署指南](./DEPLOYMENT.md)
- [API 文檔](./README.md)
- [PM2 官方文檔](https://pm2.keymetrics.io/)

---

**需要幫助？** 查看日誌文件：
- PM2: `pm2 logs leaderboard-api`
- 本地: `./logs/error.log` 和 `./logs/out.log`

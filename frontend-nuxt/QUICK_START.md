# 快速啟動指南

## 🚀 5 分鐘開始使用

### 步驟 1：啟動後端

打開第一個終端機：

```bash
cd D:\網頁\website\backend\nodejs
npm start
```

你應該看到：
```
Server running on port 3000
```

### 步驟 2：啟動 Nuxt 前端

打開第二個終端機：

```bash
cd D:\網頁\website\frontend-nuxt
npm run dev
```

你應該看到：
```
Nuxt 4.2.0 with Nitro 2.x.x

  > Local:    http://localhost:3000/
  > Network:  http://192.168.x.x:3000/
```

如果 3000 端口被占用，Nuxt 會自動使用 3001。

### 步驟 3：訪問測試頁面

在瀏覽器中打開：`http://localhost:3000`

你應該看到測試頁面，包含：
- 玩家資訊
- 愛心點擊按鈕
- 分數提交功能
- 排行榜顯示

## 🧪 測試功能

### 測試 1：愛心點擊
1. 點擊「❤️ 點擊愛心 (+1)」按鈕
2. 觀察「愛心數量」是否增加

### 測試 2：提交分數
1. 累積一些愛心
2. 點擊「提交分數」
3. 檢查是否顯示成功訊息
4. 查看排行榜是否更新

### 測試 3：排行榜刷新
1. 點擊「🔄 刷新排行榜」
2. 查看數據是否更新

## 🐛 遇到問題？

### 問題 1：後端無法啟動

**錯誤**: `Port 3000 is already in use`

**解決方案**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# 或修改端口
# 在 backend/nodejs/.env 中設置 PORT=3001
```

### 問題 2：前端無法連接後端

**錯誤**: 排行榜顯示「錯誤: Failed to fetch」

**檢查**:
1. 後端是否正在運行？
2. 檢查 Console 是否有 CORS 錯誤
3. 驗證 `.env` 中的 `NUXT_PUBLIC_API_BASE`

### 問題 3：Firestore 未啟用

**錯誤**: 後端返回 Firestore 相關錯誤

**解決方案**:
按照 `FIRESTORE_啟用指南.md` 啟用 Firestore

### 問題 4：依賴安裝失敗

**錯誤**: `npm install` 報錯

**解決方案**:
```bash
# 清除緩存
npm cache clean --force

# 刪除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json

# 重新安裝
npm install
```

## 📖 下一步

1. **閱讀完整文檔**
   - `README-ZH.md` - 專案說明
   - `MIGRATION-GUIDE.md` - 遷移指南

2. **開始遷移功能**
   - 從愛心互動組件開始
   - 參考遷移指南中的範例

3. **學習 Nuxt 和 Vue**
   - [Nuxt 3 官方教程](https://nuxt.com/docs/getting-started/introduction)
   - [Vue 3 互動教程](https://vuejs.org/tutorial/)

## 💡 開發技巧

### 熱更新
修改程式碼後，Nuxt 會自動重新載入頁面，無需手動刷新。

### Vue DevTools
安裝 [Vue DevTools](https://devtools.vuejs.org/) 瀏覽器擴展，可以：
- 檢查組件狀態
- 查看 Pinia Store
- 調試事件

### TypeScript 自動補全
使用 VS Code 可獲得完整的 TypeScript 類型提示。

## 🎯 目標檢查清單

第一次運行時，請確認：
- [ ] 後端成功啟動（port 3000）
- [ ] 前端成功啟動（port 3000 或 3001）
- [ ] 可以訪問測試頁面
- [ ] 愛心點擊功能正常
- [ ] 可以提交分數（需要 Firestore）
- [ ] 排行榜可以顯示

全部打勾後，你就可以開始開發了！🎉

## 📞 獲取幫助

如有問題，請查看：
1. 專案文檔（`docs/`）
2. 常見問題（`MIGRATION-GUIDE.md`）
3. 使用 AI 助手協助除錯

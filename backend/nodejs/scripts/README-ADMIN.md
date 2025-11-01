# 排行榜管理系統使用說明

## 📋 目錄

1. [管理腳本使用方法](#管理腳本使用方法)
2. [管理 API 端點](#管理-api-端點)
3. [網頁管理後台](#網頁管理後台)
4. [注意事項](#注意事項)

---

## 管理腳本使用方法

### 1. 查看所有玩家

```bash
cd D:\網頁\website\backend\nodejs
node scripts/view-players.js
```

顯示所有玩家的排名、ID、名稱、分數和最後更新時間。

### 2. 刪除特定玩家

```bash
node scripts/delete-player.js
```

**功能：**
- 刪除玩家的所有資料（users、userTotals、scores）
- 自動更新 metadata 統計
- 包含二次確認機制

**範例：**
```
請輸入要刪除的玩家 ID: user_1234567890_abc
📊 玩家資料:
   名稱: 測試玩家
   總分: 1500
❓ 確定要刪除此玩家嗎？此操作無法復原！(yes/no): yes
✅ 玩家已完全刪除！
```

### 3. 重置玩家分數

```bash
node scripts/reset-player-score.js
```

**功能：**
- 將玩家分數重置為 0
- 可選擇是否刪除歷史分數記錄
- 保留玩家基本資料

**範例：**
```
請輸入要重置分數的玩家 ID: user_1234567890_abc
📊 玩家資料:
   名稱: 測試玩家
   當前總分: 1500
❓ 確定要重置此玩家的分數為 0 嗎？(yes/no): yes
✅ 分數已重置為 0
❓ 是否同時刪除該玩家的所有歷史分數記錄？(yes/no): no
```

### 4. 清空整個排行榜

```bash
node scripts/clear-leaderboard.js
```

**功能：**
- 刪除所有玩家資料
- 重置 metadata 統計
- 包含多重確認機制

**範例：**
```
📊 當前資料統計:
   users 集合: 10 筆
   userTotals 集合: 10 筆
   scores 集合: 50 筆
⚠️⚠️⚠️ 警告：此操作將刪除所有玩家資料且無法復原！⚠️⚠️⚠️
確認要清空排行榜嗎？(yes/no): yes
再次確認：真的要刪除所有資料嗎？請輸入 "DELETE ALL" 來確認: DELETE ALL
✅ 排行榜已完全清空！
```

---

## 管理 API 端點

### Base URL
```
http://localhost:3000/api/leaderboard
```

### 1. 獲取所有玩家列表

**GET** `/admin/players`

**查詢參數：**
- `page` - 頁碼（預設：1）
- `limit` - 每頁數量（預設：50，最大：200）

**範例請求：**
```bash
curl "http://localhost:3000/api/leaderboard/admin/players?page=1&limit=50"
```

**回應：**
```json
{
  "success": true,
  "page": 1,
  "limit": 50,
  "total": 10,
  "total_pages": 1,
  "data": [
    {
      "rank": 1,
      "user_id": "user_1234567890_abc",
      "username": "測試玩家",
      "total_score": 1500,
      "last_updated": "2025-01-15T10:30:00.000Z"
    }
  ]
}
```

### 2. 刪除特定玩家

**DELETE** `/admin/player/:userId`

**範例請求：**
```bash
curl -X DELETE "http://localhost:3000/api/leaderboard/admin/player/user_1234567890_abc"
```

**回應：**
```json
{
  "success": true,
  "user_id": "user_1234567890_abc",
  "username": "測試玩家",
  "deleted_scores": 5,
  "message": "Player deleted successfully"
}
```

### 3. 重置玩家分數

**POST** `/admin/reset-score`

**請求體：**
```json
{
  "userId": "user_1234567890_abc",
  "deleteHistory": false
}
```

**範例請求：**
```bash
curl -X POST "http://localhost:3000/api/leaderboard/admin/reset-score" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_1234567890_abc",
    "deleteHistory": false
  }'
```

**回應：**
```json
{
  "success": true,
  "user_id": "user_1234567890_abc",
  "username": "測試玩家",
  "old_score": 1500,
  "new_score": 0,
  "deleted_history": false,
  "deleted_scores": 0,
  "message": "Score reset successfully"
}
```

### 4. 清空整個排行榜

**POST** `/admin/clear-all`

**請求體：**
```json
{
  "confirm": "DELETE ALL"
}
```

**範例請求：**
```bash
curl -X POST "http://localhost:3000/api/leaderboard/admin/clear-all" \
  -H "Content-Type: application/json" \
  -d '{"confirm": "DELETE ALL"}'
```

**回應：**
```json
{
  "success": true,
  "message": "Leaderboard cleared successfully",
  "stats": {
    "users": 10,
    "userTotals": 10,
    "scores": 50,
    "total": 70
  }
}
```

---

## 網頁管理後台

### 訪問方式

1. 啟動後端伺服器：
```bash
cd D:\網頁\website\backend\nodejs
npm start
```

2. 打開瀏覽器訪問：
```
http://localhost:3000/admin.html
```

### 功能介紹

#### 1. 統計儀表板
- 顯示總玩家數
- 顯示當前頁面和總頁數
- 即時更新統計資料

#### 2. 玩家列表
- 顯示所有玩家的排名、ID、名稱、分數
- 搜尋功能：可按玩家 ID 或名稱搜尋
- 分頁瀏覽：每頁顯示 50 筆

#### 3. 操作功能
- **重置分數**：將特定玩家分數歸零
  - 可選擇是否同時刪除歷史記錄
  - 包含確認對話框

- **刪除玩家**：完全移除玩家資料
  - 刪除所有相關資料
  - 包含確認對話框

- **清空排行榜**：刪除所有玩家資料
  - 需要輸入 "DELETE ALL" 確認
  - 多重確認機制

#### 4. 即時通知
- 操作成功/失敗會顯示 Toast 通知
- 自動消失，無需手動關閉

---

## 注意事項

### ⚠️ 安全性

1. **身份驗證**
   - 目前管理後台**沒有密碼保護**
   - 建議在生產環境中添加身份驗證
   - 可考慮使用 HTTP Basic Auth 或 API 密鑰

2. **訪問控制**
   - 不要公開管理後台的 URL
   - 建議使用防火牆限制訪問 IP
   - 考慮部署在內部網路

3. **CORS 設定**
   - 確保 CORS 設定正確
   - 避免允許所有來源（`*`）

### 🔒 資料保護

1. **備份機制**
   - 執行清空操作前先備份資料
   - 使用 Firebase Console 的匯出功能
   - 定期備份 Firestore 資料

2. **無法復原**
   - 所有刪除操作**無法復原**
   - 執行前請仔細確認
   - 測試環境先行驗證

### 📊 Firebase 配額

1. **讀取配額**
   - 免費版每日 50,000 次讀取
   - 管理後台每次載入約消耗 50-200 次讀取
   - 避免頻繁重新載入

2. **寫入配額**
   - 免費版每日 20,000 次寫入
   - 刪除操作會消耗較多配額
   - 批次刪除時注意配額限制

3. **建議**
   - 使用快取減少讀取次數
   - 避免在高峰期執行大量刪除
   - 監控 Firebase Console 的配額使用情況

### 🛠️ 故障排除

#### 問題 1：無法連接到 API
```
解決方法：
1. 確認後端伺服器正在運行（npm start）
2. 檢查 API_BASE_URL 是否正確（admin.js）
3. 檢查 CORS 設定（server.js）
```

#### 問題 2：Firebase 權限錯誤
```
解決方法：
1. 確認 Firebase 服務帳號金鑰正確
2. 檢查 .env 檔案配置
3. 確認 Firestore 規則允許讀寫
```

#### 問題 3：刪除失敗
```
解決方法：
1. 檢查玩家 ID 是否正確
2. 確認 metadata 文檔存在
3. 查看後端日誌錯誤訊息
```

---

## 📝 最佳實踐

1. **定期維護**
   - 定期清理無效玩家
   - 監控資料庫大小
   - 檢查異常分數記錄

2. **測試環境**
   - 在測試環境先驗證操作
   - 使用測試資料練習
   - 熟悉各項功能後再操作生產環境

3. **文檔記錄**
   - 記錄每次重大操作
   - 保留刪除玩家的記錄
   - 追蹤分數重置歷史

4. **權限管理**
   - 限制管理後台訪問人員
   - 使用不同權限等級
   - 定期審查訪問日誌

---

## 🔗 相關連結

- Firebase Console: https://console.firebase.google.com/
- 後端伺服器文檔: ../README.md
- API 測試工具: http://localhost:3000/leaderboard-test.html

---

## 📞 支援

如有問題或建議，請查看：
- 後端日誌：檢查 console 輸出
- Firebase 日誌：Firebase Console > Functions 日誌
- 系統狀態：http://localhost:3000/api/health

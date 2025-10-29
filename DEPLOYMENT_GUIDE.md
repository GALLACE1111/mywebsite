# Firebase 部署指南

完整的步驟說明,幫助你將網站和後端部署到 Firebase。

## 📋 前置準備

### 1. 確認已安裝工具
- ✅ Node.js (v18 或以上)
- ✅ Firebase CLI (已安裝)
- ✅ Google 帳號

### 2. 檢查文件結構
```
website/
├── frontend/              # 前端靜態文件
│   ├── index.html
│   ├── config.js         # API 配置文件
│   └── assets/
├── functions/            # Cloud Functions
│   ├── index.js         # API 邏輯
│   └── package.json
├── firebase.json        # Firebase 配置
├── .firebaserc         # 專案配置
├── firestore.rules     # Firestore 安全規則
└── firestore.indexes.json  # Firestore 索引
```

## 🚀 部署步驟

### 步驟 1: 登入 Firebase

```bash
firebase login
```

這會打開瀏覽器讓你登入 Google 帳號。

### 步驟 2: 創建 Firebase 專案

有兩種方式:

**方式 A: 使用 Firebase Console (推薦)**
1. 訪問 https://console.firebase.google.com/
2. 點擊「新增專案」
3. 輸入專案名稱(例如: my-leaderboard-app)
4. 按照指引完成創建
5. 記下你的專案 ID

**方式 B: 使用命令行**
```bash
# 在 website 目錄下
cd D:\網頁\website
firebase projects:create
```

### 步驟 3: 關聯本地專案與 Firebase 專案

```bash
cd D:\網頁\website

# 使用你的專案 ID 替換 your-project-id
firebase use your-project-id
```

或者手動編輯 `.firebaserc` 文件:
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

### 步驟 4: 啟用 Firestore

1. 訪問 Firebase Console: https://console.firebase.google.com/
2. 選擇你的專案
3. 左側菜單選擇「Firestore Database」
4. 點擊「創建數據庫」
5. 選擇「以測試模式啟動」(稍後會更新為生產規則)
6. 選擇地區(推薦: asia-east1 台灣或 asia-northeast1 東京)

### 步驟 5: 部署 Firestore 規則和索引

```bash
cd D:\網頁\website
firebase deploy --only firestore
```

這會部署:
- `firestore.rules` - 安全規則
- `firestore.indexes.json` - 索引配置

### 步驟 6: 部署 Cloud Functions

```bash
firebase deploy --only functions
```

第一次部署可能需要幾分鐘。部署完成後,你會看到 Functions URL,類似:
```
https://us-central1-your-project-id.cloudfunctions.net/api
```

**重要**: 記下這個 URL!

### 步驟 7: 更新前端 API 配置

編輯 `frontend/config.js`:

```javascript
const CONFIG = {
    development: {
        API_BASE_URL: 'http://localhost:3000/api'
    },
    production: {
        // 替換為你的 Cloud Functions URL
        API_BASE_URL: 'https://REGION-PROJECT_ID.cloudfunctions.net/api'
    }
};
```

將 `https://REGION-PROJECT_ID.cloudfunctions.net/api` 替換為步驟 6 中獲得的 URL。

### 步驟 8: 部署前端

```bash
firebase deploy --only hosting
```

部署完成後,你會看到 Hosting URL,類似:
```
https://your-project-id.web.app
https://your-project-id.firebaseapp.com
```

### 步驟 9: 測試部署

訪問你的 Hosting URL,測試以下功能:

1. **前端頁面** ✓
   - 頁面正常載入
   - 所有樣式正確

2. **排行榜功能** ✓
   - 左側排行榜顯示
   - 點擊展開/收起按鈕
   - 前三名獎盃顯示

3. **API 連接** ✓
   - 打開瀏覽器開發者工具(F12)
   - 查看 Console 是否有錯誤
   - 檢查 Network 標籤,確認 API 請求成功

4. **數據操作** ✓
   - 嘗試編輯玩家名稱
   - 查看是否同步到 Firestore

## 🔧 常見問題

### Q1: Functions 部署失敗

**錯誤**: `HTTP Error: 403, Permission 'cloudfunctions.functions.create' denied`

**解決方案**:
1. 訪問 Google Cloud Console
2. 啟用 Cloud Functions API 和 Cloud Build API
3. 確認計費帳戶已設置(免費方案足夠)

### Q2: CORS 錯誤

**錯誤**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**解決方案**:
Functions 代碼中已包含 CORS 設置(`cors({ origin: true })`),應該不會有問題。如果還是出現,檢查:
1. 確認 Functions 已成功部署
2. 檢查前端配置文件中的 API URL 是否正確

### Q3: Firestore 索引未創建

**錯誤**: `The query requires an index`

**解決方案**:
1. 查看錯誤消息中的鏈接
2. 點擊鏈接自動創建索引
3. 或手動在 Firebase Console > Firestore > 索引 中創建

### Q4: API 請求返回 404

**解決方案**:
1. 確認 Functions 已部署: `firebase functions:list`
2. 檢查 `firebase.json` 中的 rewrite 規則
3. 確認前端 `config.js` 中的 API URL 正確

## 📊 監控和日誌

### 查看 Functions 日誌
```bash
firebase functions:log
```

### 查看特定 Function 日誌
```bash
firebase functions:log --only api
```

### Firebase Console 監控
1. 訪問 Firebase Console
2. Functions > Dashboard - 查看調用次數、錯誤率
3. Firestore > Usage - 查看讀寫次數
4. Hosting > Usage - 查看流量統計

## 💰 費用估算

Firebase 免費方案(Spark Plan)包含:
- **Hosting**: 10 GB 存儲 + 360 MB/天 流量
- **Functions**: 125K 次調用/月 + 40K GB-秒計算時間
- **Firestore**: 1 GB 存儲 + 50K 讀 + 20K 寫/天

對於小型網站,免費方案綽綽有餘!

## 🔄 更新部署

### 只更新前端
```bash
firebase deploy --only hosting
```

### 只更新後端
```bash
firebase deploy --only functions
```

### 完整部署
```bash
firebase deploy
```

## 🛡️ 安全建議

### 1. 更新 Firestore 規則
編輯 `firestore.rules`,從測試模式改為生產模式:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /scores/{scoreId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if false;
    }

    match /userTotals/{userId} {
      allow read: if true;
      allow write: if false; // 只能通過 Functions 更新
    }
  }
}
```

部署規則:
```bash
firebase deploy --only firestore:rules
```

### 2. 設置自定義域名

1. Firebase Console > Hosting > 添加自定義域名
2. 按照指引配置 DNS
3. Firebase 會自動配置 SSL 證書

## 📞 獲取幫助

- Firebase 文檔: https://firebase.google.com/docs
- Stack Overflow: https://stackoverflow.com/questions/tagged/firebase
- Firebase Support: https://firebase.google.com/support

## ✅ 部署檢查清單

部署前確認:
- [ ] Firebase CLI 已登入
- [ ] 專案 ID 已配置在 `.firebaserc`
- [ ] Firestore 已啟用
- [ ] `functions/` 目錄的依賴已安裝
- [ ] `frontend/config.js` 已更新 API URL
- [ ] Firestore 規則已配置
- [ ] Firestore 索引已創建

部署後驗證:
- [ ] Hosting URL 可訪問
- [ ] 排行榜正常顯示
- [ ] API 請求成功(檢查瀏覽器 Console)
- [ ] 數據可以正常讀寫
- [ ] 前三名獎盃正常顯示
- [ ] 展開/收起功能正常

---

**部署完成!** 🎉

你的網站現在已經運行在 Firebase 上,享受全球 CDN 加速和自動擴展!

# 🚀 快速開始 - 部署到 Firebase

只需 5 個命令,將你的網站部署到雲端!

## 📝 準備工作

1. 確認你有 Google 帳號
2. 在 [Firebase Console](https://console.firebase.google.com/) 創建新專案
3. 記下你的專案 ID

## ⚡ 快速部署

```bash
# 1. 進入專案目錄
cd D:\網頁\website

# 2. 登入 Firebase
firebase login

# 3. 設置專案 ID (替換 your-project-id)
firebase use your-project-id

# 4. 啟用 Firestore (訪問 Firebase Console 手動啟用)
# https://console.firebase.google.com/ > Firestore Database > 創建數據庫

# 5. 一鍵部署所有內容
firebase deploy
```

## 📋 部署後配置

### 更新前端 API 配置

1. 查看部署完成後顯示的 Functions URL
2. 編輯 `frontend/config.js`:

```javascript
production: {
    API_BASE_URL: 'https://REGION-PROJECT_ID.cloudfunctions.net/api'
}
```

3. 重新部署前端:
```bash
firebase deploy --only hosting
```

## ✅ 驗證部署

訪問你的網站 URL (部署完成後會顯示):
- `https://your-project-id.web.app`
- `https://your-project-id.firebaseapp.com`

檢查:
1. 網站正常顯示 ✓
2. 左側排行榜加載 ✓
3. 前三名獎盃顯示 ✓
4. 展開按鈕正常工作 ✓

## 🆘 遇到問題?

查看詳細部署指南: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

**就這麼簡單!** 🎉

# 🤖 GitHub Actions 自動部署設置指南

## 📋 概述

當你推送代碼到 GitHub 的 `main` 分支時，會自動觸發部署流程：
1. ✅ 自動構建 Nuxt 專案
2. ✅ 部署到 Firebase Hosting
3. ✅ 更新 Firestore 規則
4. ✅ 更新 Storage 規則
5. ✅ 部署 Firebase Functions

---

## 🔧 設置步驟

### 步驟 1: 獲取 Firebase Token

在本地電腦執行以下命令：

```bash
# 登入 Firebase（如果還沒登入）
firebase login

# 生成 CI Token
firebase login:ci
```

這會生成一個 token，看起來像這樣：
```
1//0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ 重要：複製這個 token，稍後會用到！**

---

### 步驟 2: 在 GitHub 設置 Secret

1. **前往你的 GitHub Repository**
   - 打開 https://github.com/GALLACE1111/mywebsite

2. **進入 Settings**
   - 點擊右上角的 `Settings` 按鈕

3. **打開 Secrets and variables**
   - 左側選單選擇 `Secrets and variables` → `Actions`

4. **新增 Secret**
   - 點擊 `New repository secret` 按鈕
   - **Name**: `FIREBASE_TOKEN`
   - **Secret**: 貼上步驟 1 獲取的 token
   - 點擊 `Add secret`

---

### 步驟 3: 驗證設置

#### 方法 1: 推送代碼觸發
```bash
# 在專案目錄執行
cd "D:\網頁\website"

# 測試推送（已經設置好自動部署）
git add .
git commit -m "test: 測試自動部署"
git push origin main
```

#### 方法 2: 手動觸發
1. 前往 GitHub Repository
2. 點擊 `Actions` 標籤
3. 選擇 `自動部署到 Firebase` workflow
4. 點擊 `Run workflow` 按鈕
5. 選擇 `main` 分支
6. 點擊 `Run workflow` 開始部署

---

## 📊 查看部署狀態

### 在 GitHub 上查看

1. 前往你的 Repository
2. 點擊 `Actions` 標籤
3. 查看最新的 workflow 運行狀態

### 部署流程時間

- 📦 安裝依賴: ~30 秒
- 🔨 構建 Nuxt: ~1-2 分鐘
- 🚀 部署到 Firebase: ~30 秒
- ⚡ 部署 Functions: ~1 分鐘

**總時間**: 約 3-4 分鐘

---

## 🎯 自動部署觸發條件

### 自動觸發
當你修改以下檔案並推送到 `main` 分支時：
- ✅ `frontend-nuxt/**` - 前端代碼
- ✅ `functions/**` - Firebase Functions
- ✅ `firebase.json` - Firebase 配置
- ✅ `firestore.rules` - Firestore 規則
- ✅ `firestore.indexes.json` - Firestore 索引
- ✅ `storage.rules` - Storage 規則

### 手動觸發
隨時可以在 GitHub Actions 頁面手動執行 workflow

---

## ❌ 常見問題

### 問題 1: 部署失敗 - Authentication Error

**原因**: Firebase Token 未設置或過期

**解決方案**:
1. 重新執行 `firebase login:ci` 獲取新 token
2. 在 GitHub Settings → Secrets 更新 `FIREBASE_TOKEN`

### 問題 2: 部署失敗 - Build Error

**原因**: Nuxt 構建失敗

**解決方案**:
1. 在本地測試構建: `cd frontend-nuxt && npm run build`
2. 修復錯誤後重新推送

### 問題 3: Functions 部署失敗

**原因**: Functions 依賴或代碼錯誤

**解決方案**:
1. 檢查 `functions/package.json` 依賴
2. 在本地測試: `cd functions && npm install && npm test`

### 問題 4: 權限錯誤

**原因**: Firebase Token 權限不足

**解決方案**:
1. 確保登入的 Google 帳號有專案管理權限
2. 在 Firebase Console 檢查 IAM 權限

---

## 🔐 安全性

- ✅ Token 儲存在 GitHub Secrets，加密保護
- ✅ Token 不會出現在日誌中
- ✅ 只有 Repository 擁有者可以查看/編輯 Secrets
- ✅ 可以隨時撤銷或更新 Token

---

## 📝 部署日誌

### 成功的部署日誌範例
```
🎉 部署成功！
📱 專案: side-project-663de
🔗 查看: https://side-project-663de.web.app
```

### 查看完整日誌
1. GitHub Actions → 選擇 workflow run
2. 點擊任一步驟查看詳細輸出

---

## 🚀 開始使用

### 快速設置（3 步驟）

```bash
# 1. 獲取 Firebase Token
firebase login:ci

# 2. 前往 GitHub → Settings → Secrets
# 新增 Secret: FIREBASE_TOKEN = [你的token]

# 3. 推送代碼測試
git add .
git commit -m "feat: 啟用自動部署"
git push origin main
```

---

## 📊 部署統計

- **觸發頻率**: 每次推送到 main 分支
- **平均部署時間**: 3-4 分鐘
- **成功率**: 取決於代碼品質
- **成本**: 免費（GitHub Actions 有免費額度）

---

## ✅ 設置完成檢查清單

- [ ] 已執行 `firebase login:ci` 獲取 token
- [ ] 已在 GitHub 設置 `FIREBASE_TOKEN` secret
- [ ] 已推送 `.github/workflows/firebase-deploy.yml` 到 main
- [ ] 已測試自動部署（推送或手動觸發）
- [ ] 部署成功，網站可以訪問

---

## 🆘 需要幫助？

- **GitHub Actions 文檔**: https://docs.github.com/actions
- **Firebase CI 文檔**: https://firebase.google.com/docs/cli#cli-ci-systems
- **查看 Workflow**: https://github.com/GALLACE1111/mywebsite/actions

---

## 🎉 優勢

- ✅ **零手動操作**: 推送即部署
- ✅ **版本控制**: 每次部署都有記錄
- ✅ **快速回滾**: 出問題可快速回到之前版本
- ✅ **團隊協作**: 多人開發也能自動部署
- ✅ **狀態通知**: 部署成功或失敗都會收到通知

---

**準備好了嗎？開始設置你的自動部署吧！** 🚀

最後更新: 2025-11-02

# 🔑 手動獲取 Firebase Token 步驟

## ⚠️ 重要提醒

`firebase login:ci` 命令必須在**真實的終端機**中執行，不能在自動化腳本中運行。

---

## 📝 獲取 Token 的步驟

### 步驟 1: 打開命令提示字元 (CMD)

1. 按 `Win + R` 鍵
2. 輸入 `cmd`
3. 按 Enter

### 步驟 2: 切換到專案目錄

在 CMD 中執行：
```cmd
cd /d D:\網頁\website
```

### 步驟 3: 檢查 Firebase 登入狀態

```cmd
firebase login:list
```

如果顯示未登入，先執行：
```cmd
firebase login
```
這會開啟瀏覽器讓你登入 Google 帳號。

### 步驟 4: 生成 CI Token

```cmd
firebase login:ci
```

**重要**：這個命令會：
1. 開啟瀏覽器
2. 要求你授權
3. 生成一個 Token 並顯示在終端機

### 步驟 5: 複製 Token

Token 看起來像這樣：
```
✔  Success! Use this token to login on a CI server:

1//0gHmF2JCnSK8aCgYIARAAGBASNwF-L9IrPt...（很長的字串）

Example: firebase deploy --token "$FIREBASE_TOKEN"
```

**複製完整的 Token**（從 `1//0` 開始的整個字串）

---

## 🔐 設置 GitHub Secret

### 步驟 1: 前往 GitHub Repository

打開瀏覽器，前往：
```
https://github.com/GALLACE1111/mywebsite/settings/secrets/actions
```

### 步驟 2: 新增 Secret

1. 點擊 **"New repository secret"** 按鈕（綠色）

2. 填寫表單：
   - **Name**: `FIREBASE_TOKEN`（必須完全一樣）
   - **Secret**: 貼上你複製的 Token

3. 點擊 **"Add secret"** 按鈕

### 步驟 3: 確認設置

你應該會看到 `FIREBASE_TOKEN` 出現在 Secrets 列表中。

---

## 🚀 測試自動部署

### 方法 1: 推送新的 commit

在 CMD 中執行：
```cmd
cd /d D:\網頁\website
git commit --allow-empty -m "test: 測試自動部署"
git push origin main
```

### 方法 2: 手動觸發 workflow

1. 前往：https://github.com/GALLACE1111/mywebsite/actions

2. 點擊左側的 **"自動部署到 Firebase"**

3. 點擊右上角的 **"Run workflow"** 下拉選單

4. 確認分支是 **main**

5. 點擊綠色的 **"Run workflow"** 按鈕

6. 等待 3-4 分鐘，查看部署狀態

---

## 📊 查看部署結果

### 在 GitHub Actions 查看

1. 前往：https://github.com/GALLACE1111/mywebsite/actions

2. 點擊最新的 workflow run

3. 查看每個步驟的執行狀態：
   - ✅ 綠色勾勾 = 成功
   - ❌ 紅色叉叉 = 失敗
   - 🟡 黃色圓圈 = 執行中

### 訪問你的網站

部署成功後，訪問：
```
https://side-project-663de.web.app
```
或
```
https://side-project-663de.firebaseapp.com
```

---

## ❌ 常見問題

### Q: `firebase login:ci` 沒有顯示 Token？

**A**: 檢查以下幾點：
1. 是否在真實的 CMD 視窗中執行（不是 PowerShell）
2. 瀏覽器是否成功完成授權
3. 往上滾動終端機，Token 可能在較早的輸出中

### Q: Token 太長，無法完整複製？

**A**: 在 CMD 中：
1. 右鍵點擊標題列 → 屬性
2. 增加 "螢幕緩衝區大小" 的寬度到 500
3. 重新執行命令

### Q: 顯示 "Error: Cannot run login:ci in non-interactive mode"

**A**: 這表示在腳本或自動化環境中執行。必須在真實的終端機視窗中手動執行。

### Q: GitHub Actions 還是失敗？

**A**: 檢查：
1. Secret 名稱是否完全是 `FIREBASE_TOKEN`（區分大小寫）
2. Token 是否完整複製（包含開頭的 `1//0`）
3. Token 沒有多餘的空格或換行

---

## 🎯 完整命令列表

```cmd
# 1. 切換目錄
cd /d D:\網頁\website

# 2. 登入 Firebase（如需要）
firebase login

# 3. 生成 Token
firebase login:ci

# 4. 複製 Token，前往 GitHub 設置

# 5. 測試部署
git commit --allow-empty -m "test: 測試自動部署"
git push origin main
```

---

## ✅ 成功指標

設置成功後：
- ✅ GitHub Secrets 中有 `FIREBASE_TOKEN`
- ✅ 推送代碼會自動觸發 GitHub Actions
- ✅ Actions 執行成功（綠色勾勾）
- ✅ 網站自動更新

---

## 📞 還有問題？

如果按照以上步驟仍有問題：

1. 截圖 CMD 視窗的輸出
2. 截圖 GitHub Actions 的錯誤訊息
3. 確認 Firebase 專案權限

---

**現在開始執行吧！打開 CMD 執行 `firebase login:ci`** 🚀

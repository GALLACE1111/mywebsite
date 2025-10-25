# GitHub Pages 部署指南

這份文件將協助您將「阿賢的小窩」網站部署到 GitHub Pages。

## 前置準備

1. ✅ 您已經有 GitHub 帳號
2. ✅ 您已經建立了 GitHub Repository
3. ✅ 已安裝 Git（可在終端機執行 `git --version` 確認）

## 部署步驟

### 步驟 1：初始化 Git（如果尚未初始化）

在終端機中，切換到專案目錄：

```bash
cd "D:\網頁\my-website"
```

如果尚未初始化 Git，執行：

```bash
git init
```

### 步驟 2：添加所有檔案到 Git

```bash
git add .
```

### 步驟 3：建立第一個 commit

```bash
git commit -m "✨ 網站功能優化：添加時鐘提示、名稱驗證、自定義游標等功能"
```

### 步驟 4：連接到您的 GitHub Repository

將 `YOUR_USERNAME` 和 `YOUR_REPOSITORY` 替換為您的 GitHub 使用者名稱和儲存庫名稱：

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

如果已經有 remote，可以先移除再重新添加：

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

### 步驟 5：推送到 GitHub

第一次推送需要設定上游分支：

```bash
git branch -M main
git push -u origin main
```

如果遇到權限問題，可能需要使用 Personal Access Token。

### 步驟 6：啟用 GitHub Pages

1. 前往您的 GitHub Repository 頁面
2. 點擊 **Settings**（設定）
3. 在左側選單中找到 **Pages**
4. 在 **Source** 下拉選單中選擇 **main** 分支
5. 資料夾選擇 **/ (root)**
6. 點擊 **Save**（儲存）

### 步驟 7：等待部署完成

GitHub Pages 會自動開始部署，通常需要 1-3 分鐘。
部署完成後，您會看到一個綠色的提示訊息顯示網站 URL：

```
Your site is published at https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/
```

## 之後的更新流程

當您修改了網站內容，只需要執行以下命令更新：

```bash
# 1. 添加所有變更
git add .

# 2. 建立 commit（修改訊息為您的更新內容）
git commit -m "更新網站內容"

# 3. 推送到 GitHub
git push
```

GitHub Pages 會自動偵測到更新並重新部署。

## 常見問題

### Q: 推送時要求輸入帳號密碼怎麼辦？

GitHub 已經停止支援密碼認證，您需要使用 **Personal Access Token (PAT)**：

1. 前往 GitHub 設定：https://github.com/settings/tokens
2. 點擊 **Generate new token** > **Generate new token (classic)**
3. 勾選 **repo** 權限
4. 生成 token 並複製（只會顯示一次！）
5. 推送時，使用者名稱輸入您的 GitHub 使用者名，密碼輸入 token

### Q: 為什麼網站樣式沒有正常顯示？

檢查以下幾點：
- 確認所有 CSS、JS、圖片檔案都已經推送到 GitHub
- 檢查 HTML 中的檔案路徑是否正確（使用相對路徑）
- 等待幾分鐘讓 GitHub Pages 完全更新

### Q: 可以使用自訂網域嗎？

可以！在 GitHub Pages 設定中的 **Custom domain** 欄位輸入您的網域名稱，
然後在您的網域服務商設定 DNS 記錄指向 GitHub Pages。

## 更新記錄

### 最新版本 (2025-10-26)

**新增功能：**
- ✨ 時鐘雙擊視覺提示（箭頭動畫 + 文字）
- ✨ 雙擊時鐘直接進入月球世界（移除確認彈窗）
- ✨ 主按鈕確認彈窗文字優化（左紅「繼續漂泊」、右綠「進入未知」）
- ✨ 排行榜更新頻率調整為每 60 秒
- ✨ 排行榜名稱驗證系統（必須設定名稱才能查看）
- ✨ 名稱設定提示系統（初次訪問 + 右上角提示）
- ✨ 自定義小熊貓游標（土色黑眼圈）
- ✨ 全網站音效系統優化

## 技術支援

如果遇到任何問題，可以：
1. 檢查 GitHub Repository 的 Actions 頁面查看部署日誌
2. 查看瀏覽器開發者工具的 Console 檢查錯誤訊息
3. 參考 GitHub Pages 官方文件：https://docs.github.com/pages

---

祝您部署順利！🎉

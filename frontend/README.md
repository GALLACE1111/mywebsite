# 前端檔案結構說明

## 📂 目錄結構

```
frontend/
├── assets/                      # 資源檔案
│   ├── css/                     # 樣式檔案
│   │   ├── style.css           # 主要樣式
│   │   └── additional_styles.css  # 額外樣式
│   ├── js/                      # JavaScript 檔案
│   │   ├── script.js           # 主要腳本
│   │   └── additional_scripts.js  # 額外腳本
│   └── images/                  # 圖片資源（預留）
│
├── pages/                       # 其他頁面
│   └── maintenance.html        # 維護/開發中頁面
│
├── test/                        # 測試頁面
│   └── index.html              # 功能測試頁面
│
├── index.html                   # 主頁面
├── .gitignore                   # Git 忽略檔案
└── README.md                    # 本文件
```

## 🎯 頁面說明

### 1. 主頁面 (`index.html`)

**阿賢的小窩** - 主要網站入口

- **功能**：歡迎頁面，提供進入網站的主要入口
- **路徑**：`/index.html`
- **樣式**：`assets/css/style.css`, `assets/css/additional_styles.css`
- **腳本**：`assets/js/script.js`, `assets/js/additional_scripts.js`

### 2. 維護頁面 (`pages/maintenance.html`)

**響應式維護/開發中頁面**

- **功能**：
  - ✅ 自動偵測裝置類型（手機/平板/電腦）
  - ✅ 手機版顯示「維修中」
  - ✅ 網頁版（電腦）顯示「開發中」
  - ✅ 響應式設計，適配所有螢幕尺寸
  - ✅ 動畫效果與進度條

- **使用方式**：
  ```html
  <!-- 重新導向到維護頁面 -->
  <meta http-equiv="refresh" content="0;url=pages/maintenance.html">

  <!-- 或使用 JavaScript -->
  <script>
    window.location.href = 'pages/maintenance.html';
  </script>
  ```

- **預覽**：
  - 手機版（寬度 < 768px）：顯示「📱 手機版維修中」
  - 電腦版（寬度 >= 768px）：顯示「💻 網頁版開發中」

### 3. 測試網站 (`test/index.html`)

**功能驗證與 API 測試平台**

- **功能**：
  - 📱 裝置資訊偵測（瀏覽器、平台、解析度）
  - 🔗 頁面導航測試（主頁、維護頁、排行榜範例）
  - 🔌 API 測試
    - Node.js API 測試（排行榜查詢）
    - PHP API 測試（分數提交）
  - ⚙️ 功能測試
    - LocalStorage 測試
    - 網路狀態檢測
    - CSS 動畫測試
    - 日期時間顯示

- **使用方式**：
  1. 直接開啟 `frontend/test/index.html`
  2. 確保後端服務已啟動：
     - Node.js API: `http://localhost:3000`
     - PHP API: `http://localhost:8000`

## 🚀 快速開始

### 開發環境

```bash
# 1. 直接開啟主頁面
# 使用任何網頁伺服器，例如：

# Python 3
python -m http.server 8080

# Node.js (http-server)
npx http-server -p 8080

# PHP
php -S localhost:8080

# 2. 訪問頁面
# 主頁：http://localhost:8080/index.html
# 維護頁：http://localhost:8080/pages/maintenance.html
# 測試頁：http://localhost:8080/test/index.html
```

### 生產環境

將整個 `frontend` 目錄部署到網頁伺服器（Apache、Nginx 等）。

## 📝 檔案說明

### CSS 檔案

- **`assets/css/style.css`**：主要樣式表
- **`assets/css/additional_styles.css`**：額外樣式（動畫、特效等）

### JavaScript 檔案

- **`assets/js/script.js`**：主要邏輯腳本
- **`assets/js/additional_scripts.js`**：額外功能腳本

## 🎨 自訂設定

### 修改維護頁面訊息

編輯 `pages/maintenance.html`:

```javascript
// 手機版訊息（第 85-92 行）
deviceMessage.innerHTML = `
    很抱歉，手機版網站目前正在進行維護和優化。<br>
    <strong>預計完成時間：近期內</strong><br><br>
    如需立即訪問，請使用電腦瀏覽器。
`;

// 電腦版訊息（第 107-112 行）
deviceMessage.innerHTML = `
    網頁版（電腦版）正在積極開發中！<br>
    <strong>預計推出時間：敬請期待</strong><br><br>
    我們正在為您打造更快速、更美觀、功能更強大的網站。
`;
```

### 修改測試頁面 API 位址

編輯 `test/index.html`:

```javascript
// API 配置（第 260-263 行）
const API_CONFIG = {
    nodeAPI: 'http://localhost:3000/api',  // 修改為實際 Node.js API 位址
    phpAPI: 'http://localhost:8000'        // 修改為實際 PHP API 位址
};
```

## 📱 響應式設計

所有頁面都支援響應式設計：

- **手機版**：螢幕寬度 < 768px
- **平板版**：螢幕寬度 768px - 1024px
- **電腦版**：螢幕寬度 > 1024px

## 🔧 常見問題

### Q1: 為什麼維護頁面在電腦上也顯示維修中？

A: 維護頁面會自動偵測裝置類型。如果顯示錯誤，請檢查：
1. 瀏覽器 User Agent 是否正確
2. 視窗寬度是否 >= 768px
3. JavaScript 是否已啟用

### Q2: 測試頁面 API 測試失敗？

A: 請確認：
1. 後端服務已啟動（Node.js 和 PHP）
2. API 位址正確（預設 localhost:3000 和 localhost:8000）
3. CORS 設定正確
4. 資料庫連線正常

### Q3: 如何臨時啟用維護模式？

A: 在 `index.html` 的 `<head>` 加入：

```html
<meta http-equiv="refresh" content="0;url=pages/maintenance.html">
```

或在最前面加入 JavaScript：

```html
<script>
  window.location.href = 'pages/maintenance.html';
</script>
```

## 📚 相關文件

- [後端 API 文件](../backend/README.md)
- [快速開始指南](../backend/QUICKSTART.md)
- [專案說明](../README.md)

## 📄 授權

MIT License

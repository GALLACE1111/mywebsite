# 📂 專案結構總覽

> 最後更新：2025-10-27

## 🎯 專案組織架構

```
website/
│
├── 📁 backend/                          後端系統（PHP + Node.js 混合架構）
│   ├── 📁 database/                    資料庫相關
│   │   ├── schema.sql                  MySQL 資料庫結構（含測試資料）
│   │   ├── config.example.php          資料庫配置範例
│   │   ├── config.php                  實際配置（不納入 Git）
│   │   └── .gitignore
│   │
│   ├── 📁 php/                         PHP API（分數提交）
│   │   ├── Database.php                MySQL 連線類別
│   │   ├── RedisClient.php             Redis 客戶端
│   │   ├── submit-score.php            分數提交 API
│   │   └── .htaccess                   Apache 路由設定
│   │
│   ├── 📁 nodejs/                      Node.js API（排行榜查詢）
│   │   ├── 📁 config/
│   │   │   └── database.js             資料庫連線配置
│   │   ├── 📁 services/
│   │   │   └── leaderboard.service.js  排行榜核心邏輯
│   │   ├── 📁 routes/
│   │   │   └── leaderboard.routes.js   API 路由
│   │   ├── 📁 scripts/
│   │   │   └── rebuild-leaderboard.js  重建排行榜腳本
│   │   ├── 📁 test/
│   │   │   └── api-test.js             API 測試腳本
│   │   ├── server.js                   主伺服器（含定時任務）
│   │   ├── package.json                依賴管理
│   │   ├── .env.example                環境變數範例
│   │   ├── .env                        實際環境變數（不納入 Git）
│   │   └── .gitignore
│   │
│   ├── 📁 examples/
│   │   └── frontend-integration.html   前端整合範例（排行榜）
│   │
│   ├── README.md                       後端 API 完整文件
│   └── QUICKSTART.md                   5 分鐘快速開始指南
│
├── 📁 frontend/                         前端系統（已整理）
│   ├── 📁 assets/                      資源檔案（統一管理）
│   │   ├── 📁 css/                     樣式檔案
│   │   │   ├── style.css               主要樣式
│   │   │   └── additional_styles.css   額外樣式
│   │   │
│   │   ├── 📁 js/                      JavaScript 檔案
│   │   │   ├── script.js               主要腳本（路徑已更新）
│   │   │   └── additional_scripts.js   額外腳本
│   │   │
│   │   ├── 📁 images/                  圖片資源（11 個，33MB）
│   │   │   ├── 1219.png                下午背景
│   │   │   ├── 1922.png                夜晚背景
│   │   │   ├── 2206.png                深夜背景
│   │   │   ├── morning.png             早晨背景
│   │   │   ├── background-galaxy01.png 銀河背景
│   │   │   ├── character_combined.webp 角色合併圖
│   │   │   ├── character_running.gif   角色跑步動畫
│   │   │   ├── Support Group1.png      應援角色 1
│   │   │   ├── Support Group2.png      應援角色 2
│   │   │   ├── Support Group3.png      應援角色 3
│   │   │   └── Support Group4.png      應援角色 4
│   │   │
│   │   └── 📁 music/                   音樂資源（3 個，11.8MB）
│   │       ├── rain-piano.mp3          放鬆音樂（預設）
│   │       ├── PerituneMaterial_8bitRPG_Battle.mp3  戰鬥音樂（第一階段）
│   │       └── fast-chiptune-instrumental-2-minute-boss-fight-254040.mp3  血月音樂（第二階段）
│   │
│   ├── 📁 pages/                       其他頁面
│   │   └── maintenance.html            維護/開發中頁面（響應式）
│   │
│   ├── 📁 test/                        測試頁面
│   │   └── index.html                  功能測試與 API 測試平台
│   │
│   ├── index.html                      主頁面（阿賢的小窩）
│   ├── .gitignore                      前端 Git 忽略規則
│   └── README.md                       前端說明文件
│
├── 📁 .git/                             Git 版本控制
├── 📁 .github/                          GitHub 設定
│   └── workflows/                      GitHub Actions（如有）
├── 📁 .vscode/                          VS Code 設定
│
├── 📄 .gitignore                        根目錄 Git 忽略規則
├── 📄 DEPLOYMENT.md                     部署說明文件
├── 📄 LEARNING-GUIDE.md                 學習指南
├── 📄 README.md                         專案總說明
├── 📄 FRONTEND_STRUCTURE.md             前端結構報告
├── 📄 CLEANUP_REPORT.md                 檔案整理報告
├── 📄 PROJECT_STRUCTURE.md              本文件
└── 📄 website.code-workspace            VS Code 工作區設定
```

## 📊 專案統計

### 檔案數量
- **後端檔案**：~20 個（PHP + Node.js）
- **前端檔案**：~25 個（HTML + CSS + JS + 資源）
- **文件檔案**：7 個（README 等）

### 資源大小
- **圖片總大小**：~33 MB（11 個檔案）
- **音樂總大小**：~11.8 MB（3 個檔案）
- **程式碼大小**：~500 KB（估計）

### 技術棧
- **後端**：PHP 7.4+, Node.js 18+
- **資料庫**：MySQL 5.7+, Redis 6.0+
- **前端**：HTML5, CSS3, Vanilla JavaScript
- **工具**：Git, VS Code

## 🎯 目錄職責說明

### Backend（後端）
**職責**：處理 API 請求、資料存取、業務邏輯

#### `backend/database/`
- 資料庫結構定義
- 連線配置管理
- 測試資料提供

#### `backend/php/`
- **用途**：處理分數提交
- **優勢**：簡單穩定，適合寫入操作
- **端點**：POST `/api/scores`

#### `backend/nodejs/`
- **用途**：處理排行榜查詢
- **優勢**：非同步高效能，適合讀取操作
- **端點**：
  - GET `/api/leaderboard`
  - GET `/api/leaderboard/my-rank/:userId`
  - GET `/api/leaderboard/around/:userId`
  - POST `/api/leaderboard/rebuild`

### Frontend（前端）
**職責**：使用者介面、互動體驗、資源展示

#### `frontend/assets/`
**集中管理所有前端資源**

- **css/**：樣式表（顏色、佈局、動畫）
- **js/**：JavaScript 邏輯（互動、API 呼叫）
- **images/**：圖片資源（背景、角色、UI）
- **music/**：音樂資源（BGM、音效）

#### `frontend/pages/`
**其他獨立頁面**

- `maintenance.html`：維護頁（自動偵測裝置）

#### `frontend/test/`
**測試與驗證工具**

- `index.html`：完整測試平台（API、功能、裝置）

## 🔗 檔案引用關係

### index.html 引用
```
index.html
├── assets/css/style.css
├── assets/css/additional_styles.css
├── assets/js/script.js
├── assets/js/additional_scripts.js
└── assets/images/Support Group[1-4].png
```

### script.js 引用
```
script.js
├── assets/images/background-galaxy01.png
├── assets/images/morning.png
├── assets/images/1219.png
├── assets/images/1922.png
├── assets/images/2206.png
├── assets/music/rain-piano.mp3
├── assets/music/PerituneMaterial_8bitRPG_Battle.mp3
└── assets/music/fast-chiptune-instrumental-2-minute-boss-fight-254040.mp3
```

## 📝 重要檔案說明

### 配置檔案
| 檔案 | 用途 | 納入 Git |
|------|------|---------|
| `backend/database/config.php` | 資料庫實際配置 | ❌ 否 |
| `backend/database/config.example.php` | 資料庫配置範例 | ✅ 是 |
| `backend/nodejs/.env` | Node.js 環境變數 | ❌ 否 |
| `backend/nodejs/.env.example` | 環境變數範例 | ✅ 是 |

### 文件檔案
| 檔案 | 說明 |
|------|------|
| `README.md` | 專案總說明 |
| `backend/README.md` | 後端 API 完整文件 |
| `backend/QUICKSTART.md` | 後端 5 分鐘快速開始 |
| `frontend/README.md` | 前端詳細說明 |
| `FRONTEND_STRUCTURE.md` | 前端整理報告 |
| `CLEANUP_REPORT.md` | 檔案整理記錄 |
| `PROJECT_STRUCTURE.md` | 本文件 |

## 🚀 快速導航

### 開發相關
- **後端開發**：查看 `backend/README.md`
- **前端開發**：查看 `frontend/README.md`
- **快速開始**：查看 `backend/QUICKSTART.md`

### 測試相關
- **API 測試**：開啟 `frontend/test/index.html`
- **排行榜範例**：開啟 `backend/examples/frontend-integration.html`
- **維護頁面**：開啟 `frontend/pages/maintenance.html`

### 部署相關
- **部署指南**：查看 `DEPLOYMENT.md`
- **環境設定**：參考 `.env.example` 檔案
- **資料庫初始化**：執行 `backend/database/schema.sql`

## 💡 最佳實踐

### 新增資源
```bash
# 新增圖片
cp new-image.png frontend/assets/images/

# 新增音樂
cp new-music.mp3 frontend/assets/music/

# 更新 HTML/JS 中的引用
# 使用相對路徑：assets/images/new-image.png
```

### 修改配置
```bash
# 1. 複製範例檔案
cp backend/database/config.example.php backend/database/config.php

# 2. 編輯實際配置
nano backend/database/config.php

# 3. 確保不提交到 Git（已在 .gitignore 中）
```

### 執行測試
```bash
# 後端測試
cd backend/nodejs
npm test

# 前端測試
# 開啟 frontend/test/index.html
```

## 📚 延伸閱讀

- [後端 API 文件](backend/README.md)
- [前端說明文件](frontend/README.md)
- [快速開始指南](backend/QUICKSTART.md)
- [整理完成報告](CLEANUP_REPORT.md)
- [前端結構報告](FRONTEND_STRUCTURE.md)

---

**維護者**：專案團隊
**最後更新**：2025-10-27
**專案狀態**：✅ 結構已優化，可投入開發

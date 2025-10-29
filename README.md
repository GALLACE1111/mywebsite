# 🌙✨ 阿賢的小窩 - 互動式網站

> 一個充滿愛與溫暖的夢幻互動網站，擁有動態天空、許願池、排行榜系統

![狀態](https://img.shields.io/badge/狀態-線上運行中-success)
![版本](https://img.shields.io/badge/版本-3.0.0-blue)
![授權](https://img.shields.io/badge/授權-MIT-green)

## 🌐 線上預覽

**網站連結**：[https://gallace1111.github.io/mywebsite/](https://gallace1111.github.io/mywebsite/)

## ✨ 功能特色

### 🎨 前端功能
- **Canvas 動畫背景**：全屏動態天空效果
- **時間循環背景**：4 張美麗背景圖片自動循環
- **月亮鬧鐘**：顯示真實時間和愛心計數
- **互動星星系統**：點擊發射星星粒子動畫
- **許願池系統**：投入愛心許願，記錄許願內容
- **排行榜顯示**：即時顯示用戶排名

### 🚀 後端系統
- **Node.js + Express** API 服務器
- **MySQL 資料庫**：儲存用戶資料和分數記錄
- **排行榜 API**：提供排名查詢和分數提交
- **一鍵啟動**：簡化的啟動腳本

## 🛠️ 技術架構

### 前端技術
- HTML5 + CSS3
- JavaScript (ES6+)
- Canvas API
- 粒子系統動畫

### 後端技術
- Node.js + Express
- MySQL 9.x
- RESTful API

### 部署
- GitHub Pages（前端）
- 本地伺服器（後端）

## 📁 專案結構

```
website/
├── frontend/                    # 前端檔案
│   ├── index.html              # 主頁面
│   ├── leaderboard-test.html  # 排行榜測試頁面
│   └── assets/
│       ├── css/                # 樣式表
│       ├── js/                 # JavaScript 檔案
│       ├── images/             # 圖片資源
│       └── music/              # 音樂檔案
│
├── backend/                     # 後端系統
│   ├── nodejs/                 # Node.js 後端
│   │   ├── server.js           # 主伺服器
│   │   ├── config/             # 配置檔案
│   │   ├── routes/             # API 路由
│   │   └── services/           # 業務邏輯
│   ├── database/               # 資料庫相關
│   │   ├── schema-simplified.sql  # 資料庫架構
│   │   └── 常用查詢.sql           # 常用 SQL 查詢
│   ├── SQL_基礎教學.md         # SQL 教學文件
│   └── SQL_快速指令.bat        # MySQL 快速啟動
│
├── START_LEADERBOARD.bat       # 啟動後端伺服器
├── 測試流程指南.md              # 完整測試流程
└── 如何打開網站.md              # 使用說明

```

## 🚀 快速開始

### 前端部署
1. 直接訪問線上版本：[https://gallace1111.github.io/mywebsite/](https://gallace1111.github.io/mywebsite/)
2. 或本地開啟 `frontend/index.html`

### 後端啟動

#### 方法 1：一鍵啟動（推薦）
```bash
# Windows
雙擊 START_LEADERBOARD_NEW_WINDOW.bat
```

#### 方法 2：手動啟動
```bash
cd backend/nodejs
npm install
npm start
```

後端將運行在 `http://localhost:3000`

### 資料庫設定

1. 確保 MySQL 已安裝並運行
2. 建立資料庫：
```bash
mysql -u root
CREATE DATABASE leaderboard_db;
```

3. 匯入資料庫架構：
```bash
mysql -u root leaderboard_db < backend/database/schema-simplified.sql
```

## 🎮 使用說明

### 前端操作
1. **觀看時間**：右上角月亮鬧鐘顯示真實時間
2. **發射星星**：點擊角色或星星發射按鈕
3. **許願池**：點擊許願池按鈕，投入愛心許願
4. **查看排行榜**：點擊排行榜按鈕查看排名

### 後端測試
1. 開啟測試頁面：`frontend/leaderboard-test.html`
2. 測試功能：
   - 獲取排行榜
   - 提交分數
   - 查詢個人排名
3. 用 SQL 驗證資料變更

詳細測試流程請參考：[測試流程指南.md](./測試流程指南.md)

## 📋 API 端點

### 排行榜 API

**Base URL**: `http://localhost:3000/api/leaderboard`

#### 獲取排行榜
```http
GET /api/leaderboard?page=1&limit=50
```

#### 查詢個人排名
```http
GET /api/leaderboard/my-rank/:userId
```

#### 查詢周圍排名
```http
GET /api/leaderboard/around/:userId?range=5
```

#### 提交分數
```http
POST /api/leaderboard/submit
Content-Type: application/json

{
  "user_id": 1,
  "score": 50
}
```

## 🔧 設定檔案

### 環境變數 (.env)
```env
PORT=3000
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=leaderboard_db
MYSQL_USER=root
MYSQL_PASSWORD=
```

## 📝 版本歷史

### v3.0.0 (2025-10-29) - 系統簡化 🎉
- ♻️ 移除 PHP + Redis，簡化為 Node.js + MySQL
- ✨ 新增完整的測試工具和文檔
- 🛠️ 修復 MySQL 9.x 相容性問題
- 📚 建立 SQL 基礎教學文件
- 🚀 一鍵啟動腳本

### v2.0.0 (2025-01-19)
- ✨ Canvas 動畫系統
- 🌙 月亮風格鬧鐘
- ⭐ 星星粒子系統

### v1.0.0 (2025-01-16)
- 初始版本上線

## 🗂️ 重要檔案說明

| 檔案 | 說明 |
|------|------|
| `START_LEADERBOARD.bat` | 一鍵啟動後端伺服器 |
| `測試流程指南.md` | 完整的 API 測試流程 |
| `backend/SQL_基礎教學.md` | SQL 入門教學 |
| `backend/SQL_快速指令.bat` | 快速開啟 MySQL |
| `backend/database/常用查詢.sql` | 常用 SQL 查詢集合 |

## 🤝 貢獻

歡迎提出建議或回報問題！

## 📄 授權

本專案採用 MIT 授權條款

## 👤 作者

**GALLACE1111**
- GitHub: [@GALLACE1111](https://github.com/GALLACE1111)
- 專案連結: [https://github.com/GALLACE1111/mywebsite](https://github.com/GALLACE1111/mywebsite)

## 🙏 致謝

- 💙 感謝 Claude Code AI 的開發協助
- 🌐 感謝 GitHub Pages 提供免費託管
- 🎨 感謝所有開源社群的貢獻

---

⭐ 如果你喜歡這個專案，請給個星星支持一下！

**Made with 💕 and ✨ by GALLACE1111**

🌙 *在夢幻的星空下，讓每一顆星星都帶著愛飛翔*

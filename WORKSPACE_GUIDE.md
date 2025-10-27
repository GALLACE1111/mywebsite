# 🛠️ VS Code 工作區設定指南

## 📋 工作區概覽

你的 VS Code 工作區包含兩個專案：

### 1. 🌐 Website (主專案)
**路徑**：`D:\網頁\website`
**說明**：主要網站專案，包含前後端系統

- **前端**：`frontend/` - HTML、CSS、JavaScript
- **後端**：`backend/` - PHP + Node.js API
- **資料庫**：MySQL + Redis

### 2. 📘 GALLACE1111 (GitHub Pages)
**路徑**：`D:\網頁\GALLACE1111`
**說明**：GitHub Pages 網站專案

## 🎯 工作區設定說明

### 資料夾名稱
工作區中的兩個資料夾已加上圖示和說明：

```
🌐 Website (主專案)
📘 GALLACE1111 (GitHub Pages)
```

### 自動排除檔案
以下檔案/資料夾會自動隱藏，不會出現在檔案總管：

- `.git/` - Git 版本控制資料夾
- `node_modules/` - Node.js 依賴套件
- `__pycache__/` - Python 快取
- `*.pyc` - Python 編譯檔案

### 搜尋排除
搜尋時會自動排除以下資料夾，加快搜尋速度：

- `node_modules/`
- `bower_components/`
- `.git/`

### 編輯器設定

#### 自動格式化
- ✅ **儲存時自動格式化**（`formatOnSave: true`）
- ✅ **Tab 大小**：2 個空格
- ✅ **使用空格**而非 Tab 鍵
- ✅ **檔案編碼**：UTF-8
- ✅ **換行符號**：LF (Unix 風格)

#### 檔案關聯
自動識別檔案類型：

- `*.css` → CSS
- `*.js` → JavaScript
- `*.php` → PHP
- `*.md` → Markdown

## 📦 建議安裝的擴充套件

工作區已設定建議的擴充套件，VS Code 會提示你安裝：

### 必備擴充套件

1. **ESLint** (`dbaeumer.vscode-eslint`)
   - JavaScript/TypeScript 程式碼檢查
   - 自動發現並修正常見錯誤

2. **Prettier** (`esbenp.prettier-vscode`)
   - 程式碼格式化工具
   - 支援多種語言（JS、CSS、HTML、Markdown）

3. **Auto Rename Tag** (`formulahendry.auto-rename-tag`)
   - 自動重新命名配對的 HTML/XML 標籤
   - 修改開始標籤時，結束標籤自動更新

4. **Live Server** (`ritwickdey.liveserver`)
   - 啟動本地開發伺服器
   - 即時重新載入（Hot Reload）

5. **PHP Intelephense** (`bmewburn.vscode-intelephense-client`)
   - PHP 智慧提示與自動完成
   - 語法檢查與除錯

### 安裝方式

#### 方法 1：透過工作區建議安裝
1. 開啟工作區檔案 (`website.code-workspace`)
2. VS Code 右下角會出現提示：「此工作區建議安裝擴充套件」
3. 點擊「安裝所有」

#### 方法 2：手動安裝
1. 按 `Ctrl + Shift + X` 開啟擴充套件面板
2. 搜尋並安裝上述擴充套件

## 🚀 開啟工作區

### 方法 1：雙擊工作區檔案
```
D:\網頁\website\website.code-workspace
```
直接雙擊此檔案即可開啟工作區

### 方法 2：從 VS Code 開啟
1. 開啟 VS Code
2. 檔案 → 開啟工作區
3. 選擇 `website.code-workspace`

### 方法 3：從命令列開啟
```bash
cd D:\網頁\website
code website.code-workspace
```

## 📂 工作區檔案結構

```
D:\網頁/
├── website/                    # 主專案
│   ├── backend/               # 後端系統
│   ├── frontend/              # 前端系統
│   ├── website.code-workspace # 工作區設定檔（本檔案）
│   └── ...
│
└── GALLACE1111/               # GitHub Pages
    ├── README.md
    └── ...
```

## 🎨 自訂工作區設定

### 修改專案名稱

編輯 `website.code-workspace`：

```json
{
  "folders": [
    {
      "name": "你的專案名稱",  // 修改這裡
      "path": "."
    }
  ]
}
```

### 新增更多專案

```json
{
  "folders": [
    {
      "name": "🌐 Website",
      "path": "."
    },
    {
      "name": "📘 GALLACE1111",
      "path": "../GALLACE1111"
    },
    {
      "name": "🚀 新專案",      // 新增專案
      "path": "../new-project"
    }
  ]
}
```

### 新增專案特定設定

例如，針對 Node.js 專案的設定：

```json
{
  "settings": {
    "[javascript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[typescript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "javascript.updateImportsOnFileMove.enabled": "always"
  }
}
```

## 💡 使用技巧

### 1. 快速切換專案
- 使用側邊欄的檔案總管
- 點擊資料夾名稱展開/收合

### 2. 搜尋特定專案
- `Ctrl + Shift + F` 開啟搜尋
- 點擊「要包含的檔案」
- 輸入專案名稱，例如：`./frontend`

### 3. 在終端機中切換專案
```bash
# 切換到 Website 專案
cd D:\網頁\website

# 切換到 GALLACE1111 專案
cd D:\網頁\GALLACE1111
```

### 4. 使用分割視窗
- 拖曳檔案到編輯器右側
- 同時檢視兩個專案的檔案

### 5. 使用多個終端機
- 按 `` Ctrl + ` `` 開啟終端機
- 點擊 `+` 新增終端機
- 分別切換到不同專案目錄

## 🔧 常見問題

### Q1: 工作區設定沒有生效？
**A**: 重新載入 VS Code 視窗
- 按 `Ctrl + Shift + P`
- 輸入「Reload Window」
- 按 Enter

### Q2: 擴充套件建議沒有出現？
**A**: 手動檢查建議的擴充套件
- 按 `Ctrl + Shift + X`
- 點擊「顯示建議的擴充套件」

### Q3: 想要不同專案使用不同設定？
**A**: 在各專案根目錄建立 `.vscode/settings.json`

例如，在 `frontend/.vscode/settings.json`：
```json
{
  "liveServer.settings.root": "/frontend",
  "liveServer.settings.port": 5500
}
```

### Q4: 如何匯出/分享工作區設定？
**A**: 直接複製 `website.code-workspace` 檔案即可

## 📚 延伸閱讀

### VS Code 官方文件
- [工作區設定](https://code.visualstudio.com/docs/editor/workspaces)
- [多資料夾工作區](https://code.visualstudio.com/docs/editor/multi-root-workspaces)

### 相關專案文件
- [專案結構總覽](PROJECT_STRUCTURE.md)
- [前端說明文件](frontend/README.md)
- [後端 API 文件](backend/README.md)

## 🎯 快速指令

```bash
# 開啟工作區
code website.code-workspace

# 啟動前端開發伺服器（Live Server）
# 右鍵 frontend/index.html → Open with Live Server

# 啟動後端 Node.js 伺服器
cd backend/nodejs
npm start

# 啟動後端 PHP 伺服器
cd backend/php
php -S localhost:8000
```

---

**建立時間**：2025-10-27
**工作區檔案**：`website.code-workspace`
**狀態**：✅ 已設定完成

# 愛心互動遊戲 - Nuxt.js 版本

這是從原本的 Vanilla JavaScript 版本遷移到 Nuxt.js 的新版本。

## 📁 專案結構

```
frontend-nuxt/
├── app/                    # 應用程式根組件
├── pages/                  # 頁面路由
│   └── index.vue          # 主頁面
├── components/            # Vue 組件
├── composables/           # 組合式函數
│   └── useAPI.ts         # API 調用封裝
├── stores/                # Pinia 狀態管理
│   ├── game.ts           # 遊戲狀態
│   └── leaderboard.ts    # 排行榜狀態
├── types/                 # TypeScript 類型定義
│   └── api.ts            # API 類型
├── assets/                # 靜態資源
│   ├── css/              # 樣式文件
│   ├── images/           # 圖片
│   └── audio/            # 音效
└── public/                # 公共文件

```

## 🚀 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 配置環境變數

複製 `.env` 文件並根據需要修改：

```bash
# 開發環境（默認）
NUXT_PUBLIC_API_BASE=http://localhost:3000/api

# 生產環境
# NUXT_PUBLIC_API_BASE=https://us-central1-side-project-663de.cloudfunctions.net/api
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

訪問 `http://localhost:3000` 查看應用。

### 4. 構建生產版本

```bash
npm run build
```

### 5. 預覽生產版本

```bash
npm run preview
```

## 🔧 已完成的功能

- ✅ Nuxt.js 專案架構設置
- ✅ 後端 API 連接配置
- ✅ Pinia 狀態管理（遊戲狀態 + 排行榜狀態）
- ✅ TypeScript 類型定義
- ✅ API 調用層封裝
- ✅ 基礎測試頁面

## 📋 待遷移功能

### 高優先級
- [ ] 愛心互動系統組件
- [ ] 排行榜組件（虛擬滾動）
- [ ] 物理引擎整合（Matter.js）

### 中優先級
- [ ] Boss 戰鬥系統
- [ ] 月球世界切換
- [ ] 樣式遷移

### 低優先級
- [ ] 管理後台
- [ ] 其他附加功能（許願池、鬧鐘等）

## 🎯 技術棧

- **框架**: Nuxt 3 + Vue 3
- **語言**: TypeScript
- **狀態管理**: Pinia
- **物理引擎**: Matter.js
- **API**: RESTful API (Express.js 後端)
- **數據庫**: Firebase Firestore

## 📝 開發注意事項

### 與後端通訊

後端 API 端點保持不變：
- 開發環境: `http://localhost:3000/api`
- 生產環境: `https://us-central1-side-project-663de.cloudfunctions.net/api`

確保後端伺服器正在運行：

```bash
# 在 backend/nodejs 目錄下
npm start
```

### 狀態管理

使用 Pinia stores：

```vue
<script setup>
// 遊戲狀態
const gameStore = useGameStore()

// 排行榜狀態
const leaderboardStore = useLeaderboardStore()
</script>
```

### API 調用

使用 `useAPI` composable：

```typescript
const api = useAPI()

// 獲取排行榜
const leaderboard = await api.getLeaderboard()

// 提交分數
const result = await api.submitScore({
  player_id: 'xxx',
  username: 'Player',
  score: 100
})
```

## 🚢 部署

### Vercel 部署（推薦）

```bash
# 安裝 Vercel CLI
npm install -g vercel

# 部署
vercel deploy
```

### Firebase Hosting 部署

```bash
# 生成靜態文件
npm run generate

# 部署到 Firebase
firebase deploy --only hosting
```

## 📊 與舊版本的差異

| 功能 | 舊版本 (Vanilla JS) | 新版本 (Nuxt.js) |
|------|-------------------|-----------------|
| 檔案數量 | 單個 3019 行的 JS | 模組化多個文件 |
| 狀態管理 | 全域變數 | Pinia Store |
| API 調用 | 分散在各處 | 統一 composable |
| 類型檢查 | 無 | TypeScript |
| 開發體驗 | 手動刷新 | 熱更新 (HMR) |
| 打包優化 | 無 | Vite 自動優化 |

## 🤝 貢獻

這是一個正在進行的遷移專案。歡迎提出建議和改進！

## 📄 授權

與原專案相同

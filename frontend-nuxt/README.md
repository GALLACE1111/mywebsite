# 愛心互動遊戲 ❤️✨

一款充滿愛心的互動網頁遊戲！點擊收集愛心、探索月球世界、挑戰血月守護者。

**项目状态**：✅ Nuxt 3 遷移 100% 完成！準備部署！

---

## 🎮 游戏特色

### ✨ 核心玩法
- **💖 愛心收集系統**：點擊任何位置冒出愛心特效
- **🌙 月球世界探索**：雙擊右上角月球進入神秘世界
- **⚔️ Boss 戰鬥系統**：挑戰血月守護者，發射星星攻擊
- **💬 Boss 對話系統**：戰鬥中 Boss 會說話（7句循環對話）
- **👥 應援團系統**：4個可愛角色為你加油

### 🎯 功能系統
- **⏰ 專注鬧鐘**：番茄鐘計時器，8種預設時間
- **🌠 許願池**：許願並查看其他玩家的願望（需 Firebase）
- **🏆 排行榜**：競爭愛心排名（需 Firebase）
- **📝 意見回饋**：提交建議和 Bug 回報（需 Firebase）

### 🎨 視覺效果
- **🖱️ 自定義游標**：奶油色箭頭 + 金色 hover 效果
- **🌅 動態背景**：根據時段自動切換（早晨/下午/晚上/深夜）
- **🎬 豐富動畫**：彈跳、旋轉、漸隱等多種特效
- **🎵 音效系統**：背景音樂、戰鬥音樂、按鈕音效

---

## 🚀 快速开始

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器（http://localhost:3002）
npm run dev

# 生成静态网站
npm run generate

# 预览生成的网站
npx serve .output/public
```

### 部署

**推荐：GitHub Pages（自动部署）**

查看详细部署指南：
- 📄 [GITHUB_PAGES_DEPLOY.md](./GITHUB_PAGES_DEPLOY.md) - GitHub Actions 快速指南
- 📄 [DEPLOYMENT.md](./DEPLOYMENT.md) - 完整部署选项

**快速部署步骤**：
1. 创建 GitHub 仓库
2. 推送代码到 GitHub
3. 在仓库设置中启用 GitHub Pages（Source: GitHub Actions）
4. 自动部署完成！

---

## 🛠️ 技术栈

### 前端框架
- **Nuxt 3** - Vue.js 元框架
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全
- **Pinia** - 状态管理

### 样式和动画
- **CSS3** - 原生 CSS 动画
- **Canvas API** - 背景特效和星星发射系统

### 音频系统
- **Web Audio API** - 音效和音乐播放

### 部署
- **GitHub Actions** - 自动化 CI/CD
- **GitHub Pages** - 静态网站托管

### 后端（可选）
- **Firebase Firestore** - 数据库（许愿池、排行榜、回馈）
- **Firebase Functions** - 无服务器函数

---

## 📊 遷移進度

### ✅ 已完成（100%）

**核心组件**：
- [x] TimeDisplay.vue - 时段显示
- [x] MoonClock.vue - 月亮时钟 + 爱心计数器
- [x] WelcomeCard.vue - 欢迎卡片
- [x] CharacterAnimation.vue - 像素风角色
- [x] VolumeControl.vue - 音量控制
- [x] CanvasBackground.vue - 动画背景
- [x] MoonDialog.vue - 进入月球对话框
- [x] StarHint.vue - 星星发射器提示
- [x] MoonHint.vue - 双击提示
- [x] SocialLinks.vue - 社交媒体面板

**功能面板**：
- [x] WishingWell.vue - 许愿池
- [x] FocusTimer.vue - 专注闹钟
- [x] Feedback.vue - 意见回馈
- [x] Leaderboard.vue - 排行榜

**战斗系统**：
- [x] BossBattle.vue - Boss 战斗（含对话系统）
- [x] BattleDialog.vue - 战斗确认对话框
- [x] useStarShooter.ts - 星星发射系统
- [x] stores/game.ts - 游戏状态管理

**其他系统**：
- [x] useHeartClick.ts - 爱心点击系统
- [x] MoonWorld.vue - 月球世界
- [x] useAudio.ts - 音频系统

---

## 🎯 功能状态

### ✅ 完整功能（不需要后端）
- 愛心點擊系統
- 月球世界
- Boss 戰鬥系統（包含對話）
- 專注鬧鐘（本地存储）
- 所有視覺效果和音效

### ⚠️ 需要 Firebase 后端
- 許願池
- 排行榜
- 意見回饋

---

## 🐛 故障排除

### 常见问题

**Q: 页面刷新后 404**
A: 正常现象，静态 SPA 通过 `200.html` fallback 处理

**Q: 音频无法播放**
A: 检查浏览器控制台，确认 `public/audio/` 文件存在

**Q: 部署后资源 404**
A: 检查 `nuxt.config.ts` 的 `baseURL` 配置

更多问题请查看 [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🎉 里程碑

- **2025-10-31**: frontend/ 稳定版本完成（90% 功能）
- **2025-11-12**: Nuxt 3 遷移项目启动
- **2025-11-15**: Boss 对话系统完成 - **遷移 100% 完成！**
- **2025-11-15**: 静态部署配置完成，准备上线

---

**立即开始你的愛心冒險！** 🚀❤️

# 🌙✨ 阿賢的小窩 - 互動式動畫網站

> 一個充滿愛與溫暖的夢幻互動網站，擁有動態天空、可愛月亮鬧鐘與星星粒子系統

![狀態](https://img.shields.io/badge/狀態-線上運行中-success)
![版本](https://img.shields.io/badge/版本-2.0.0-blue)
![授權](https://img.shields.io/badge/授權-MIT-green)

## 🌐 線上預覽

**網站連結**：[https://gallace1111.github.io/mywebsite/](https://gallace1111.github.io/mywebsite/)

## ✨ 功能特色

### 🎨 動態背景系統
- **Canvas 動畫背景**：全屏動態天空效果
- **時間循環背景**：4 張美麗背景圖片每 5 分鐘自動循環
  - 早晨場景（0-75秒）
  - 下午/傍晚場景（75-150秒）
  - 夜晚場景（150-225秒）
  - 深夜場景（225-300秒）
- **雪花粒子系統**：100+ 飄落的雪花，永續循環

### 🌙 月亮鬧鐘
- **可愛月亮設計**：淡黃色漸層背景
- **月球坑洞裝飾**：4 個真實的月球坑洞效果
- **星星閃爍動畫**：頂部和兩側的閃爍星星
- **真實時鐘顯示**：顯示當前真實時間
- **愛心計數器**：追蹤接收到的星星數量

### ⭐ 互動星星系統
- **雙重發射方式**：
  - 點擊畫面左下角的角色
  - 點擊底部的「星星發射按鈕」
- **美麗的粒子動畫**：
  - 5 角星星設計，帶旋轉效果
  - 金黃色漸層和發光效果
  - 貝茲曲線飛行路徑
  - 每次發射 4 顆星星
- **智能計數**：星星到達月亮時自動增加計數

### 🎯 視覺設計
- **青藍科技風格卡片**：長矩形設計，科技感光效
- **響應式設計**：完美支援手機、平板、電腦
- **流暢動畫**：所有元素都有精心設計的動畫效果
- **暖色調配色**：粉色、紫色、金黃色的和諧搭配

## 🛠️ 技術架構

### 前端技術
- **HTML5** - Canvas API、語意化標籤
- **CSS3** - 動畫、漸層、Backdrop Filter、響應式設計
- **JavaScript (ES6+)** - Canvas 繪圖、粒子系統、時間計算

### 核心技術亮點
- **Canvas 動畫系統**：requestAnimationFrame 高效渲染
- **粒子物理系統**：雪花和星星的獨立粒子類別
- **時間循環機制**：自動背景切換系統
- **貝茲曲線路徑**：星星的優美飛行軌跡
- **事件委派**：智能點擊檢測

### 部署
- **GitHub Pages** - 靜態網站託管
- **GitHub Actions** - 自動化部署工作流程

## 📁 專案結構

```
my-website/
│
├── index.html              # 主頁面結構
├── style.css               # 完整樣式表
├── script.js               # Canvas 動畫與互動邏輯
│
├── images/                 # 圖片資源
│   ├── character.png       # 主角角色圖片
│   ├── 0612.png           # 早晨背景
│   ├── 1219.png           # 下午/傍晚背景
│   ├── 1922.png           # 夜晚背景
│   └── 2206.png           # 深夜背景
│
├── .github/
│   └── workflows/
│       └── static.yml     # GitHub Actions 設定
│
└── README.md              # 專案說明（本文件）
```

## 🎮 使用說明

### 基本操作
1. **觀看時間**：右上角月亮鬧鐘顯示真實時間
2. **欣賞背景**：每 75 秒自動切換不同時段的美麗背景
3. **發射星星**：
   - 點擊左下角的角色
   - 或點擊底部的「星星發射按鈕 ✨」
4. **收集愛心**：觀看星星飛向月亮，計數器會自動增加

### 背景循環時間表
| 時間段 | 背景場景 | 特色 |
|--------|---------|------|
| 0-75秒 | 早晨 | 溫暖的晨光 |
| 75-150秒 | 下午/傍晚 | 柔和的黃昏 |
| 150-225秒 | 夜晚 | 寧靜的夜空 |
| 225-300秒 | 深夜 | 深邃的星空 |

*每 5 分鐘完整循環一次*

## 🚀 如何使用

### 方法一：線上瀏覽
直接訪問：[https://gallace1111.github.io/mywebsite/](https://gallace1111.github.io/mywebsite/)

### 方法二：本地運行

1. **Clone 專案**
   ```bash
   git clone https://github.com/GALLACE1111/mywebsite.git
   cd mywebsite
   ```

2. **開啟網頁**
   - 直接用瀏覽器打開 `index.html`
   - 或使用 VSCode 的 Live Server 擴充功能

## 🎨 設計細節

### 配色方案

**卡片區域（青藍科技風）**
```css
青綠色: rgba(64, 224, 208, 0.15)
青藍色: rgba(0, 191, 255, 0.15)
邊框: rgba(100, 255, 218, 0.3)
```

**月亮鬧鐘**
```css
漸層: #FFF8DC → #F0E68C → #E6D98A → #D4C48A
邊框: #FFFACD
時鐘文字: #6B5D4F
計數器: #DAA520 (金黃色)
```

**星星發射按鈕**
```css
背景: rgba(205, 170, 125, 0.9) - 土色調
文字: #2c2416 - 深棕色
```

### 動畫效果

| 元素 | 動畫類型 | 時長 |
|------|---------|------|
| 容器淡入 | fadeInUp | 0.8s |
| 月亮浮動 | clockFloat | 3s |
| 月亮發光 | moonGlow | 4s |
| 星星閃爍 | starTwinkle | 2-2.5s |
| 標題脈動 | titlePulse | 2s |
| 雪花飄落 | 持續 | 隨機速度 |
| 粒子飛行 | 貝茲曲線 | 約12.5s |

## 💻 技術實現

### Canvas 動畫循環
```javascript
function animate() {
  drawSky();              // 繪製背景圖片
  updateSnowflakes();     // 更新雪花位置
  drawCharacter();        // 繪製角色
  updateParticles();      // 更新星星粒子
  requestAnimationFrame(animate);
}
```

### 背景循環系統
- **循環週期**：5 分鐘（300,000 毫秒）
- **切換頻率**：每 75 秒
- **實現方式**：時間戳計算 + 圖片預載入

### 粒子系統
- **雪花類別（Snowflake）**：隨機大小、速度、飄移
- **星星類別（Particle）**：旋轉、發光、曲線路徑
- **物理模擬**：重力、速度、加速度

## 🔧 自訂修改

### 修改背景循環速度
編輯 `script.js`：
```javascript
// 改為 10 分鐘循環
const BACKGROUND_CYCLE_DURATION = 10 * 60 * 1000;
```

### 修改星星數量
```javascript
// 改為發射 6 顆星星
for (let i = 0; i < 6; i++) {
  // ...
}
```

### 修改雪花數量
```javascript
// 改為 200 個雪花
initSnowflakes(200);
```

### 更換背景圖片
將您的圖片放入 `images/` 資料夾，並更新 `script.js` 中的檔案名稱：
```javascript
backgroundImages.morning.src = 'images/您的檔案名.png';
```

## 📝 版本歷史

### v2.0.0 (2025-01-19) - 重大更新 🎉
- ✨ 全新 Canvas 動畫系統
- 🌙 月亮風格鬧鐘設計
- 🎨 4 張時段背景圖片
- ⭐ 星星粒子發射系統
- ❄️ 雪花粒子效果
- 🔄 自動背景循環（5分鐘）
- ⏰ 真實時間顯示
- 📱 優化響應式設計

### v1.0.0 (2025-01-16)
- 初始版本上線
- 愛心接籃子遊戲
- 基礎互動功能

## 🤝 貢獻

歡迎提出建議或回報問題！

1. Fork 這個專案
2. 創建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

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
- ⭐ 感謝每一位訪客的支持

## 📞 聯絡方式

如有任何問題或建議，歡迎在 GitHub 上開 Issue！

---

⭐ 如果你喜歡這個專案，請給個星星支持一下！

**Made with 💕 and ✨ by GALLACE1111**

🌙 *在夢幻的星空下，讓每一顆星星都帶著愛飛翔*

# 💕 Hien Love Kitty - 可愛網站專案

> 一個充滿愛與溫暖的個人網站，包含像素風格愛心接籃子小遊戲

![狀態](https://img.shields.io/badge/狀態-線上運行中-success)
![版本](https://img.shields.io/badge/版本-1.0.0-blue)
![授權](https://img.shields.io/badge/授權-MIT-green)

## 🌐 線上預覽

**網站連結**：[https://gallace1111.github.io/mywebsite/](https://gallace1111.github.io/mywebsite/)

## ✨ 功能特色

### 主頁面
- 💖 可愛的粉紫色漸層背景
- 🎨 流暢的動畫效果
- 📱 響應式設計（手機、平板、電腦都適用）
- 🎭 互動式按鈕

### 愛心接籃子小遊戲
- 🎮 像素風格的遊戲介面
- 👧 會揮手的可愛角色（SVG 動畫）
- 🧺 可愛的籃子
- 💕 飛行的愛心（拋物線動畫）
- 📊 分數系統
- 🎉 成就彈窗（每 5 分）

## 🛠️ 技術架構

### 前端技術
- **HTML5** - 語意化標籤
- **CSS3** - 動畫、漸層、Flexbox
- **JavaScript (ES6+)** - DOM 操作、事件處理

### 部署
- **GitHub Pages** - 靜態網站託管
- **GitHub Actions** - 自動化部署

### 圖片資源
- **SVG** - 向量圖形（籃子、角色、愛心）
- **像素風格** - 復古遊戲美術風格

## 📁 專案結構

```
my-website/
│
├── index.html              # 主頁面
├── style.css               # 樣式表
├── script.js               # 互動功能
│
├── images/                 # 圖片資料夾
│   ├── logo.png           # 網站 Logo
│   ├── basket.svg         # 像素籃子
│   ├── character.svg      # 像素角色（帶動畫）
│   └── heart.svg          # 像素愛心
│
├── .github/
│   └── workflows/
│       └── static.yml     # GitHub Actions 設定
│
├── notes/                  # 筆記資料夾
│   └── front-end-notes.txt
│
├── README.md              # 專案說明（本文件）
└── LEARNING-GUIDE.md      # 新手學習指南
```

## 🎯 遊戲玩法

1. 點擊右下角的 🎮 按鈕開啟遊戲
2. 點擊「丟愛心！」按鈕
3. 愛心會從角色飛向籃子
4. 成功接住愛心 = 得分 +1
5. 每接住 5 顆愛心會顯示祝賀訊息
6. 挑戰自己的最高分！

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

## 📚 學習資源

如果你是程式新手，想學習如何製作這樣的網站，請查看：

👉 **[LEARNING-GUIDE.md](./LEARNING-GUIDE.md)** - 完整的新手學習指南

內容包括：
- 🛠️ 需要的開發工具
- 📊 開發流程圖
- 💻 程式碼詳細解說
- 🎓 4 週學習計畫
- 📖 推薦的學習資源
- ❓ 常見問題解答

## 🎨 設計特色

### 顏色配色
```css
主要粉紅：#ff6b9d
主要紫色：#c44dff
次要粉紅：#ffa8d5
深色文字：#2d3436
淺色文字：#636e72
```

### 動畫效果
- **漸層背景**：15 秒循環動畫
- **浮動效果**：3 秒上下浮動
- **標題脈動**：2 秒呼吸效果
- **愛心飛行**：2 秒拋物線動畫
- **碰撞效果**：0.5 秒放大消失

## 🔧 自訂修改

### 修改顏色
編輯 `style.css` 的 CSS 變數：
```css
:root {
  --primary-pink: #你的顏色;
  --primary-purple: #你的顏色;
}
```

### 修改遊戲難度
編輯 `script.js`：
```javascript
// 修改愛心飛行時間（預設 2 秒）
setTimeout(() => {
  checkCatch(heart);
}, 1900);  // 改成更小的數字 = 更難
```

### 修改祝賀頻率
```javascript
// 每 5 分祝賀一次
if (score % 5 === 0) {  // 改成 10 = 每 10 分
  alert(`太棒了！`);
}
```

## 📝 版本歷史

- **v1.0.0** (2025-01-16)
  - ✅ 初始版本上線
  - ✅ 主頁面設計完成
  - ✅ 愛心接籃子遊戲
  - ✅ 像素風格圖片（SVG）
  - ✅ GitHub Pages 自動部署

## 🤝 貢獻

歡迎提出建議或回報問題！

1. Fork 這個專案
2. 創建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

本專案採用 MIT 授權條款 - 詳見 LICENSE 檔案

## 👤 作者

**GALLACE1111**
- GitHub: [@GALLACE1111](https://github.com/GALLACE1111)
- 專案連結: [https://github.com/GALLACE1111/mywebsite](https://github.com/GALLACE1111/mywebsite)

## 🙏 致謝

- 感謝 Claude Code AI 的開發協助
- 感謝 GitHub Pages 提供免費託管
- 感謝所有開源社群的貢獻

## 📞 聯絡方式

如有任何問題或建議，歡迎在 GitHub 上開 Issue！

---

⭐ 如果你喜歡這個專案，請給個星星支持一下！

**Made with 💕 by GALLACE1111**

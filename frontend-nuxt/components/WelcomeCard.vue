<!--
  ⚠️ 手機版響應式：永久關閉
  - 不要添加 @media 查詢
  - 不要添加 body.mobile-mode 樣式
  - 手機用戶會看到維護中頁面
-->
<template>
  <div class="container">
    <div class="card">
      <!-- Emoji 裝飾 -->
      <div class="emoji-decoration">🐱✨</div>

      <!-- 標題 -->
      <h1 class="title">阿賢的小窩</h1>

      <!-- 歡迎文字區域 -->
      <div class="welcome-text">
        <p class="welcome-line1">歡迎來到我的可愛星球 💕</p>
        <p class="welcome-line2">這是一個充滿愛與溫暖的小天地</p>
      </div>

      <!-- 進入月球按鈕 -->
      <button class="btn" @click="handleEnterMoonWorld">
        <span>進入月球</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * WelcomeCard 組件 - 歡迎卡片（正中央）
 *
 * 功能說明：
 * - 顯示網站標題「阿賢的小窩」
 * - Emoji 裝飾（🐱✨）
 * - 歡迎文字（兩行）
 * - 進入月球按鈕
 *
 * 互動功能：
 * - 卡片 hover 效果（向上浮動 + 陰影增強）
 * - 按鈕 hover 效果（漸層滑動 + 放大）
 * - 點擊按鈕觸發進入月球世界
 *
 * 參考來源：
 * - HTML: frontend/index.html 第 18-33 行
 * - JS: frontend/assets/js/script.js enterMoonWorld() 函數（第 24 行起）
 * - CSS: frontend/assets/css/style.css（第 78-253 行）
 */

/**
 * 處理進入月球世界按鈕點擊
 * 完全參照 frontend/assets/js/script.js 的 enterMoonWorld() 實現
 */
function handleEnterMoonWorld(): void {
  console.log('🌙 點擊進入月球按鈕')

  // TODO: 未來實現
  // 1. 播放按鈕音效
  // 2. 觸發按鈕反饋動畫
  // 3. 顯示月球確認對話框（MoonDialog 組件）

  // 暫時輸出日誌
  console.log('  - 觸發進入月球世界流程')
  console.log('  - 未來會顯示確認對話框')
}
</script>

<style scoped>
/**
 * 歡迎卡片樣式
 * 完全參照 frontend/assets/css/style.css 第 78-253 行
 * ⚠️ 已移除所有手機版響應式設計
 */

/* ===== 容器 ===== */
.container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 900px; /* 變寬以容納長矩形 */
  margin: 0 auto;
  padding: 60px 20px 20px 20px; /* 上方留60px空間 */
  min-height: 100vh;
  display: flex;
  align-items: flex-start; /* 改為上方對齊 */
  justify-content: center;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== 卡片 ===== */
.card {
  background: linear-gradient(135deg, rgba(64, 224, 208, 0.08), rgba(0, 191, 255, 0.08)); /* 青綠色到青藍色（更透明） */
  backdrop-filter: none; /* 移除模糊效果 */
  padding: 35px 60px; /* 減少垂直空間，水平空間也略減 */
  border-radius: 25px;
  box-shadow: 0 20px 60px rgba(0, 191, 255, 0.2), 0 0 30px rgba(64, 224, 208, 0.15);
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid rgba(100, 255, 218, 0.25); /* 邊框適度透明 */
  position: relative;
  overflow: hidden;
  width: 100%; /* 佔滿容器寬度 */
  max-width: 800px; /* 長矩形最大寬度 */
}

/* 科技光效背景（更透明） */
.card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(100, 255, 218, 0.05) 0%, transparent 70%);
  animation: techGlow 4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes techGlow {
  0%, 100% {
    transform: translate(0, 0);
    opacity: 0.2;
  }
  50% {
    transform: translate(10px, 10px);
    opacity: 0.4;
  }
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 80px rgba(0, 191, 255, 0.3), 0 0 40px rgba(64, 224, 208, 0.25);
  border-color: rgba(100, 255, 218, 0.35);
}

/* ===== Emoji 裝飾 ===== */
.emoji-decoration {
  font-size: 50px; /* 略微縮小 */
  margin-bottom: 15px; /* 減少間距 */
  animation: float 3s ease-in-out infinite;
  position: relative;
  z-index: 1;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
}

/* ===== 標題 ===== */
.title {
  font-size: 48px; /* 略微縮小但仍然比歡迎文字大很多 */
  font-weight: 700;
  color: #000000; /* 黑色文字 */
  margin-bottom: 20px; /* 增加與下方文字的間距 */
  animation: titlePulse 2s ease-in-out infinite;
  letter-spacing: 8px; /* 拉長字距 */
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@keyframes titlePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

/* ===== 歡迎文字區域 ===== */
.welcome-text {
  margin-top: 0;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.welcome-line1 {
  font-size: 18px; /* 比標題小很多 */
  font-weight: 600;
  background: linear-gradient(180deg, #000000, #1a1a1a); /* 漸層黑 */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px; /* 增加行距 */
  letter-spacing: 1px;
  position: relative;
  z-index: 1;
}

.welcome-line2 {
  font-size: 16px; /* 更小的字體 */
  font-weight: 700; /* 加粗讓文字更清晰 */
  color: #000000; /* 改用純黑色，不用漸層 */
  margin-bottom: 0;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 1;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); /* 添加陰影增加清晰度 */
}

/* ===== 進入月球按鈕 ===== */
.btn {
  padding: 16px 48px;
  font-size: 18px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, var(--primary-pink), var(--primary-purple));
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(255, 107, 157, 0.4);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary-purple), var(--secondary-pink));
  transition: left 0.3s ease;
  z-index: 0;
}

.btn:hover::before {
  left: 0;
}

.btn span {
  position: relative;
  z-index: 2;
}

.btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 15px 40px rgba(255, 107, 157, 0.5);
}

.btn:active {
  transform: translateY(-1px) scale(1.02);
  box-shadow: 0 8px 20px rgba(255, 107, 157, 0.4);
}

/* ===== CSS 變數（繼承自全域） ===== */
:root {
  --primary-pink: #ff6b9d;
  --primary-purple: #c44dff;
  --secondary-pink: #ffa8d5;
}
</style>

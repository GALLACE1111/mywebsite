<!--
  ⚠️ 手機版響應式：永久關閉
  - 不要添加 @media 查詢
  - 不要添加 body.mobile-mode 樣式
  - 手機用戶會看到維護中頁面
-->
<template>
  <!-- 右上角月亮顯示區域 -->
  <div class="info-panel" @click="handleClick">
    <!-- 月球坑洞裝飾 -->
    <div class="moon-crater crater-1"></div>
    <div class="moon-crater crater-2"></div>
    <div class="moon-crater crater-3"></div>
    <div class="moon-crater crater-4"></div>

    <!-- 時鐘顯示 HH:MM -->
    <div class="clock-display">{{ currentTime }}</div>

    <!-- 愛心計數器 -->
    <div class="counter-display">
      <span class="counter-label">我收到的愛</span>
      <span class="counter-value">{{ heartCount }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

/**
 * MoonClock 組件 - 右上角月亮時鐘 + 愛心計數器
 *
 * 功能說明：
 * - 顯示當前時間（HH:MM 格式）
 * - 顯示愛心計數（我收到的愛）
 * - 月球坑洞裝飾（4個）
 * - 雙擊進入月球世界
 * - 星星裝飾（::before 和 ::after）
 *
 * 雙擊邏輯：
 * - 200ms 內點擊兩次視為雙擊
 * - 雙擊觸發進入月球世界
 *
 * 參考來源：
 * - HTML: frontend/index.html 第 41-54 行
 * - JS 時鐘: frontend/assets/js/script.js updateClock() 函數（第 689-697 行）
 * - JS 雙擊: frontend/assets/js/additional_scripts.js initMoonPortal() 函數（第 369-421 行）
 * - CSS: frontend/assets/css/style.css .info-panel 等（第 300-475 行）
 */

// 當前時間（HH:MM）
const currentTime = ref<string>('00:00')

// 愛心計數（暫時寫死，未來會連接到狀態管理）
const heartCount = ref<number>(0)

// 雙擊相關變數
let clickCount = 0
let clickTimer: NodeJS.Timeout | null = null

// 時鐘更新定時器
let clockInterval: NodeJS.Timeout | null = null

/**
 * 更新時鐘顯示
 * 完全參照 frontend/assets/js/script.js 的 updateClock() 實現（第 689-694 行）
 */
function updateClock(): void {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}`
}

/**
 * 處理點擊事件（雙擊檢測）
 * 完全參照 frontend/assets/js/additional_scripts.js 的 initMoonPortal() 實現（第 383-421 行）
 */
function handleClick(e: MouseEvent): void {
  console.log('🌙 月亮時鐘被點擊，點擊次數:', clickCount + 1)

  // 播放點擊音效（未來實現）
  // playButtonSound();

  clickCount++

  if (clickCount === 1) {
    console.log('👆 第一次點擊')
    // 優化：從 300ms 減少到 200ms，提升反應速度
    clickTimer = setTimeout(() => {
      clickCount = 0
      console.log('⏰ 點擊計時器重置')
    }, 200)
  } else if (clickCount === 2) {
    console.log('👆👆 雙擊偵測！')
    clearTimeout(clickTimer!)
    clickCount = 0

    // 觸發進入月球世界（未來實現）
    enterMoonWorld()
  }
}

/**
 * 進入月球世界
 * 未來會觸發 MoonDialog 組件
 */
function enterMoonWorld(): void {
  console.log('🌙 觸發進入月球世界')
  // TODO: 觸發 MoonDialog 組件
  // emit('enterMoonWorld')
}

// 組件掛載時啟動時鐘定時器
onMounted(() => {
  // 立即更新一次
  updateClock()

  // 每秒更新時鐘（參照 script.js 第 696 行）
  clockInterval = setInterval(updateClock, 1000)
})

// 組件卸載時清除定時器
onUnmounted(() => {
  if (clockInterval) {
    clearInterval(clockInterval)
    clockInterval = null
  }

  if (clickTimer) {
    clearTimeout(clickTimer)
    clickTimer = null
  }
})
</script>

<style scoped>
/**
 * 月亮時鐘面板樣式
 * 完全參照 frontend/assets/css/style.css 第 300-475 行
 * 注意：已移除所有手機版響應式設計
 */

/* ===== 右上角可愛月亮鬧鐘 ===== */
.info-panel {
  position: fixed !important;
  top: 25px;
  right: 25px;
  background: radial-gradient(circle at 35% 35%, #FFF8DC 0%, #F0E68C 30%, #E6D98A 60%, #D4C48A 100%) !important; /* 月亮漸層 */
  backdrop-filter: blur(10px);
  padding: 0;
  border-radius: 50%; /* 圓形 */
  box-shadow: 0 15px 50px rgba(240, 230, 140, 0.6), 0 0 30px rgba(255, 248, 220, 0.8), inset -10px -10px 30px rgba(212, 196, 138, 0.4);
  z-index: 9999 !important;
  width: 220px;
  height: 220px;
  display: flex !important;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  user-select: none;
}

/* Hover 效果 */
.info-panel:hover {
  transform: scale(1.05) rotate(2deg);
  box-shadow: 0 20px 60px rgba(240, 230, 140, 0.8), 0 0 40px rgba(255, 248, 220, 1), inset -12px -12px 35px rgba(212, 196, 138, 0.5);
}

/* 頂部星星裝飾 ⭐ */
.info-panel::before {
  content: '⭐';
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 28px;
  filter: drop-shadow(0 0 8px rgba(255, 248, 220, 0.8));
  animation: starTwinkle 2s ease-in-out infinite;
  z-index: 1;
}

/* 兩側小星星裝飾 ✨ */
.info-panel::after {
  content: '✨';
  position: absolute;
  top: -8px;
  left: -20px;
  font-size: 20px;
  filter: drop-shadow(0 0 5px rgba(255, 248, 220, 0.6));
  animation: starTwinkle 2.5s ease-in-out infinite;
  z-index: 1;
  text-shadow: 220px 0 0 currentColor; /* 右側星星 */
}

/* 星星閃爍動畫 */
@keyframes starTwinkle {
  0%, 100% {
    opacity: 0.7;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

/* ===== 月球坑洞裝飾 ===== */
.moon-crater {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(212, 196, 138, 0.3), rgba(160, 140, 100, 0.5));
  box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.crater-1 {
  width: 25px;
  height: 25px;
  top: 40px;
  left: 35px;
}

.crater-2 {
  width: 18px;
  height: 18px;
  top: 70px;
  right: 40px;
}

.crater-3 {
  width: 15px;
  height: 15px;
  bottom: 50px;
  left: 50px;
}

.crater-4 {
  width: 20px;
  height: 20px;
  bottom: 60px;
  right: 35px;
}

/* ===== 時鐘顯示 ===== */
.clock-display {
  font-size: 28px;
  font-weight: 700;
  color: #6B5D4F; /* 溫暖的深褐色 */
  text-align: center;
  margin-bottom: 12px;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  text-shadow: 1px 1px 3px rgba(255, 248, 220, 0.8), 0 0 5px rgba(240, 230, 140, 0.3);
  position: relative;
  z-index: 2;
}

/* ===== 計數器顯示 ===== */
.counter-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  position: relative;
  z-index: 2;
}

.counter-label {
  font-size: 16px;
  color: #8B7355; /* 溫暖的咖啡色 */
  margin-bottom: 5px;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(255, 248, 220, 0.6);
}

.counter-value {
  font-size: 36px;
  font-weight: 700;
  color: #D4A574; /* 金黃色 */
  font-family: 'Courier New', monospace;
  text-shadow: 2px 2px 4px rgba(255, 248, 220, 0.9), 0 0 10px rgba(212, 165, 116, 0.5);
  animation: counterPulse 2s ease-in-out infinite;
}

/* 計數器脈動動畫 */
@keyframes counterPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>

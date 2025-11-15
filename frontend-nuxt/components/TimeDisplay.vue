<!--
  ⚠️ 手機版響應式：永久關閉
  - 不要添加 @media 查詢
  - 不要添加 body.mobile-mode 樣式
  - 手機用戶會看到維護中頁面
-->
<template>
  <!-- 左上角時段顯示器 -->
  <div class="time-period-display">
    當前時段：{{ currentPeriod }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

/**
 * TimeDisplay 組件 - 左上角時段顯示器
 *
 * 功能說明：
 * - 顯示當前時段（早晨/下午/晚上/深夜）
 * - 根據真實時間自動更新
 * - 每秒檢查一次，確保即時切換
 *
 * 時段劃分：
 * - 早晨：6:00-12:00
 * - 下午：12:00-18:00
 * - 晚上：18:00-22:00
 * - 深夜：22:00-6:00
 *
 * 參考來源：
 * - HTML: frontend/index.html 第 36-38 行
 * - JS: frontend/assets/js/script.js getRealTimePeriodName() 函數（第 614-626 行）
 * - CSS: frontend/assets/css/style.css .time-period-display（第 255-297 行）
 */

// 當前時段名稱
const currentPeriod = ref<string>('載入中...')

// 定時器 ID
let intervalId: NodeJS.Timeout | null = null

/**
 * 根據真實時間獲取時段名稱
 * 此函數完全參照 frontend/assets/js/script.js 的 getRealTimePeriodName() 實現
 */
function getRealTimePeriodName(): string {
  const now = new Date()
  const hour = now.getHours()

  if (hour >= 6 && hour < 12) {
    return '早晨' // 6:00-12:00
  } else if (hour >= 12 && hour < 18) {
    return '下午' // 12:00-18:00
  } else if (hour >= 18 && hour < 22) {
    return '晚上' // 18:00-22:00
  } else {
    return '深夜' // 22:00-6:00
  }
}

/**
 * 更新時段顯示
 * 此函數完全參照 frontend/assets/js/script.js 的 updateTimePeriodDisplay() 實現
 */
function updateTimePeriodDisplay(): void {
  currentPeriod.value = getRealTimePeriodName()
}

// 組件掛載時啟動定時器
onMounted(() => {
  // 立即更新一次
  updateTimePeriodDisplay()

  // 每秒更新時段顯示（確保即時切換）
  // 參照 frontend/assets/js/script.js 第 708 行
  intervalId = setInterval(updateTimePeriodDisplay, 1000)
})

// 組件卸載時清除定時器
onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
})
</script>

<style scoped>
/**
 * 時段顯示器樣式
 * 完全參照 frontend/assets/css/style.css 第 255-297 行
 */
.time-period-display {
  position: fixed;
  top: 25px;
  left: 25px;
  background: rgba(40, 40, 50, 0.5); /* 更黯淡的深灰色，透明度降低 */
  backdrop-filter: blur(10px);
  padding: 15px 25px;
  border-radius: 15px;
  color: rgba(200, 200, 210, 0.9); /* 黯淡的淺灰色文字 */
  font-size: 18px;
  font-weight: 600;
  font-family: Arial, sans-serif;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  z-index: 999;
  border: 2px solid rgba(255, 255, 255, 0.15); /* 更透明的邊框 */
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
}

.time-period-display:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  background: rgba(50, 50, 60, 0.6); /* hover 時稍微亮一點 */
}
</style>

<!--
  ⚠️ 手機版響應式：永久關閉
  - 不要添加 @media 查詢
  - 不要添加 body.mobile-mode 樣式
  - 手機用戶會看到維護中頁面
-->
<template>
  <!-- 右下角音量控制器 -->
  <div class="volume-control-panel">
    <!-- 音量圖示 -->
    <label for="volume-slider" class="volume-label">🔊</label>

    <!-- 音量滑桿 -->
    <input
      id="volume-slider"
      type="range"
      class="volume-slider"
      min="0"
      max="100"
      :value="volume"
      step="1"
      @input="handleVolumeChange"
    />

    <!-- 百分比顯示 -->
    <span class="volume-percentage">{{ volume }}%</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

/**
 * VolumeControl 組件 - 右下角音量控制器
 *
 * 功能說明：
 * - 音量滑桿（0-100）
 * - 即時百分比顯示
 * - 控制所有音效和音樂
 * - 預設音量 70%
 *
 * 互動功能：
 * - 拖動滑桿調整音量
 * - Hover 時面板向上浮動
 * - 滑桿圓點 Hover 放大
 *
 * 參考來源：
 * - HTML: frontend/index.html 第 69-73 行
 * - JS: frontend/assets/js/script.js 第 2223-2235 行
 * - CSS: frontend/assets/css/style.css 第 763-877 行
 */

// 當前音量（0-100）
const volume = ref<number>(70)

/**
 * 處理音量變化
 * 完全參照 frontend/assets/js/script.js 第 2226-2234 行
 */
function handleVolumeChange(event: Event): void {
  const target = event.target as HTMLInputElement
  const newVolume = parseInt(target.value)

  volume.value = newVolume

  // 轉換為 0-1 範圍（給音頻使用）
  const volumeDecimal = newVolume / 100

  console.log('音量調整為:', newVolume + '%')
  console.log('  - 小數值:', volumeDecimal)

  // TODO: 未來整合音頻系統
  // - 更新背景音樂音量
  // - 更新所有音效音量
  // - 儲存到 localStorage
}
</script>

<style scoped>
/**
 * 音量控制器樣式
 * 完全參照 frontend/assets/css/style.css 第 763-877 行
 * ⚠️ 已移除所有手機版響應式設計
 */

/* ===== 音量控制面板 ===== */
.volume-control-panel {
  position: fixed;
  bottom: 15px; /* 最右下角 */
  right: 15px; /* 最右下角 */
  background: rgba(40, 40, 45, 0.7); /* 重黑色低調背景 */
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  padding: 8px 15px; /* 縮小 padding */
  border-radius: 50px;
  display: flex;
  align-items: center;
  gap: 8px; /* 縮小間距 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  border: 2px solid rgba(255, 255, 255, 0.1); /* 極淡的邊框 */
  transition: all 0.3s ease;
}

.volume-control-panel:hover {
  transform: translateY(-2px);
  background: rgba(50, 50, 55, 0.75); /* hover 時稍微亮一點 */
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.5);
}

/* ===== 音量圖示 ===== */
.volume-label {
  font-size: 16px; /* 縮小圖標 */
  cursor: default;
  user-select: none;
}

/* ===== 音量滑桿 ===== */
.volume-slider {
  width: 80px; /* 縮小滑桿長度 */
  height: 5px; /* 縮小高度 */
  border-radius: 5px;
  outline: none;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.5));
  -webkit-appearance: none;
  appearance: none;
  cursor: pointer;
}

/* ===== 滑桿圓點樣式（Chrome/Safari/Edge） ===== */
.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 3px 12px rgba(255, 255, 255, 0.5);
}

/* ===== 滑桿圓點樣式（Firefox） ===== */
.volume-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: white;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.volume-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 3px 12px rgba(255, 255, 255, 0.5);
}

/* ===== 百分比顯示 ===== */
.volume-percentage {
  font-size: 14px;
  font-weight: 700;
  color: white;
  min-width: 40px;
  text-align: right;
  user-select: none;
}
</style>

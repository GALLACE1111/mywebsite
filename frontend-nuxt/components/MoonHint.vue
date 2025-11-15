<!--
  月球雙擊提示組件
  參考：frontend/index.html:56-60, frontend/assets/css/additional_styles.css:76-137
  位置：右上角月亮附近（top: 50px; right: 150px）
  功能：提示用戶可以雙擊右上角月亮進入月球世界
  隱藏條件：進入月球世界時
-->

<template>
  <div
    v-if="!gameStore.inMoonWorld"
    class="moon-hint-container"
  >
    <div class="moon-hint-arrow">👆</div>
    <div class="moon-hint-text">雙擊進入月球</div>
  </div>
</template>

<script setup lang="ts">
const gameStore = useGameStore()

/**
 * 純視覺提示組件
 * - 無點擊事件（pointer-events: none）
 * - 持續閃爍和彈跳動畫
 * - 提示用戶雙擊右上角的月亮時鐘可進入月球世界
 */
</script>

<style scoped>
/* 月球雙擊提示容器（右上角月亮附近） */
.moon-hint-container {
  position: fixed;
  top: 50px;
  right: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 999;
  pointer-events: none; /* 純視覺提示，不攔截點擊事件 */
  animation: moonHintFade 3s ease-in-out infinite;
}

/* 箭頭 emoji */
.moon-hint-arrow {
  font-size: 32px;
  animation: moonHintBounce 1.5s ease-in-out infinite;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* 提示文字 */
.moon-hint-text {
  background: linear-gradient(135deg, rgba(255, 248, 220, 0.95), rgba(240, 230, 140, 0.95));
  color: #6b4423;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(255, 248, 220, 0.6);
  border: 2px solid rgba(255, 248, 220, 0.8);
}

/* 箭頭彈跳動畫 */
@keyframes moonHintBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 整體閃爍動畫 */
@keyframes moonHintFade {
  0%, 10% {
    opacity: 1;
  }
  50%, 90% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
</style>

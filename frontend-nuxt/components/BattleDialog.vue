<!--
  戰鬥確認對話框組件
  參考：frontend/assets/js/script.js:1073-1129
  參考：frontend/assets/css/style.css:1697-1935
  功能：點擊星星發射器時（首次），顯示確認對話框
  確認後開始 Boss 戰鬥
-->

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="battle-dialog"
      :class="{ 'show': isVisible }"
      @click="handleBackgroundClick"
    >
      <div class="battle-dialog-content" @click.stop>
        <!-- 戰鬥圖標 -->
        <div class="battle-icon">⚔️</div>

        <!-- 標題 -->
        <h2 class="battle-title">確定開始戰鬥嗎？</h2>

        <!-- 圖標列表 -->
        <div class="battle-icons">
          <span class="icon-item">✨</span>
          <span class="icon-item">💫</span>
          <span class="icon-item">🌟</span>
          <span class="icon-item">⭐</span>
          <span class="icon-item">🎯</span>
        </div>

        <!-- 按鈕 -->
        <div class="battle-buttons">
          <button class="battle-btn battle-yes" @click="handleConfirm">
            <span class="btn-icon">⚡</span>
            <span>開始戰鬥！</span>
          </button>
          <button class="battle-btn battle-no" @click="handleCancel">
            <span class="btn-icon">🛡️</span>
            <span>取消</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * Props
 */
interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

/**
 * Emits
 */
interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const emit = defineEmits<Emits>()

// 控制顯示動畫（延遲添加 show class）
const isVisible = ref(false)

/**
 * 監聽 modelValue 變化，觸發動畫
 */
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // 打開對話框：延遲 10ms 添加 show class（觸發 CSS 動畫）
    nextTick(() => {
      setTimeout(() => {
        isVisible.value = true
      }, 10)
    })
  } else {
    // 關閉對話框：立即移除 show class
    isVisible.value = false
  }
})

/**
 * 處理確認按鈕點擊
 */
const handleConfirm = () => {
  emit('confirm')
  closeDialog()
}

/**
 * 處理取消按鈕點擊
 */
const handleCancel = () => {
  emit('cancel')
  closeDialog()
}

/**
 * 處理背景點擊（點擊背景關閉對話框）
 */
const handleBackgroundClick = () => {
  emit('cancel')
  closeDialog()
}

/**
 * 關閉對話框
 */
const closeDialog = () => {
  isVisible.value = false
  // 等待動畫結束後才真正關閉
  setTimeout(() => {
    emit('update:modelValue', false)
  }, 300)
}
</script>

<style scoped>
/* ===== 戰鬥確認對話框 ===== */
/* 參考：frontend/assets/css/style.css:1697-1935 */

.battle-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: flex-end; /* 戰鬥對話框在底部 */
  justify-content: center;
  padding-bottom: 120px; /* 在發射器上方留出空間 */
  opacity: 0;
  transition: opacity 0.3s ease;
}

.battle-dialog.show {
  opacity: 1;
}

.battle-dialog-content {
  background: linear-gradient(135deg, rgba(255, 107, 157, 0.95), rgba(196, 77, 255, 0.95));
  padding: 40px 50px;
  border-radius: 30px;
  box-shadow:
    0 20px 60px rgba(255, 107, 157, 0.5),
    0 0 40px rgba(196, 77, 255, 0.3);
  text-align: center;
  transform: scale(0.8);
  transition: transform 0.3s ease;
  border: 3px solid rgba(255, 255, 255, 0.3);
  max-width: 90%;
}

.battle-dialog.show .battle-dialog-content {
  transform: scale(1);
}

.battle-icon {
  font-size: 60px;
  margin-bottom: 20px;
  animation: battleIconPulse 1s ease-in-out infinite;
  filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.8));
}

@keyframes battleIconPulse {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.15) rotate(5deg);
  }
}

.battle-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin-bottom: 25px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: 2px;
}

.battle-icons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 30px;
}

.icon-item {
  font-size: 28px;
  animation: iconFloat 2s ease-in-out infinite;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.6));
}

.icon-item:nth-child(1) {
  animation-delay: 0s;
}

.icon-item:nth-child(2) {
  animation-delay: 0.2s;
}

.icon-item:nth-child(3) {
  animation-delay: 0.4s;
}

.icon-item:nth-child(4) {
  animation-delay: 0.6s;
}

.icon-item:nth-child(5) {
  animation-delay: 0.8s;
}

@keyframes iconFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
}

.battle-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.battle-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.battle-btn:hover {
  transform: translateY(-3px) scale(1.05);
}

.battle-btn:active {
  transform: translateY(-1px) scale(1);
}

.battle-yes {
  background: linear-gradient(135deg, #ff6b9d, #c44dff);
  color: white;
}

.battle-yes:hover {
  box-shadow: 0 12px 30px rgba(255, 107, 157, 0.6);
}

.battle-no {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  color: white;
}

.battle-no:hover {
  box-shadow: 0 12px 30px rgba(127, 140, 141, 0.5);
}

.btn-icon {
  font-size: 24px;
  animation: btnIconBounce 1s ease-in-out infinite;
}

@keyframes btnIconBounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
</style>

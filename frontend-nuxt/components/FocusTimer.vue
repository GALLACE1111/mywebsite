<template>
  <div v-if="isOpen" class="focus-timer-modal">
    <div class="modal-overlay" @click="close"></div>

    <div class="modal-content">
      <button class="close-btn" @click="close">✕</button>

      <h2 class="title">⏰ 專注鬧鐘</h2>
      <p class="subtitle">設定專注時間，提升效率！</p>

      <!-- 時間顯示 -->
      <div class="timer-display">
        <div class="time">{{ displayTime }}</div>
        <div class="status">{{ timerStatus }}</div>
      </div>

      <!-- 控制按鈕 -->
      <div v-if="!isRunning" class="time-presets">
        <button @click="setTime(25)" class="preset-btn">25 分鐘</button>
        <button @click="setTime(45)" class="preset-btn">45 分鐘</button>
        <button @click="setTime(60)" class="preset-btn">60 分鐘</button>
      </div>

      <div class="controls">
        <button v-if="!isRunning" @click="start" class="control-btn start-btn" :disabled="timeLeft === 0">
          ▶️ 開始
        </button>
        <button v-else @click="pause" class="control-btn pause-btn">
          ⏸️ 暫停
        </button>
        <button @click="reset" class="control-btn reset-btn">
          🔄 重置
        </button>
      </div>

      <!-- 進度條 -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { playSound } = useAudio()

const isOpen = ref(false)
const isRunning = ref(false)
const timeLeft = ref(0)
const totalTime = ref(0)

let timerInterval: NodeJS.Timeout | null = null

const displayTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60)
  const seconds = timeLeft.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const timerStatus = computed(() => {
  if (isRunning.value) return '專注中...'
  if (timeLeft.value === 0) return '選擇時間開始專注'
  return '已暫停'
})

const progressPercent = computed(() => {
  if (totalTime.value === 0) return 0
  return ((totalTime.value - timeLeft.value) / totalTime.value) * 100
})

const open = () => {
  isOpen.value = true
}

const close = () => {
  if (isRunning.value && !confirm('計時器正在運行，確定要關閉嗎？')) {
    return
  }
  isOpen.value = false
  reset()
}

const setTime = (minutes: number) => {
  if (isRunning.value) return
  timeLeft.value = minutes * 60
  totalTime.value = minutes * 60
}

const start = () => {
  if (timeLeft.value === 0) return

  isRunning.value = true
  playSound('timer-start')

  timerInterval = setInterval(() => {
    timeLeft.value--

    if (timeLeft.value <= 0) {
      finish()
    }
  }, 1000)
}

const pause = () => {
  isRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  playSound('timer-pause')
}

const reset = () => {
  isRunning.value = false
  timeLeft.value = 0
  totalTime.value = 0
  if (timerInterval) {
    clearInterval(timerInterval)
  }
}

const finish = () => {
  isRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
  }

  playSound('timer-finish')
  alert('🎉 專注時間結束！做得好！')

  reset()
}

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})

defineExpose({
  open,
  close
})
</script>

<style scoped>
.focus-timer-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 400px;
  background: #fff;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
  z-index: 1;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: rotate(90deg);
}

.title {
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 0.5rem;
  color: #333;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.timer-display {
  text-align: center;
  margin-bottom: 2rem;
}

.time {
  font-size: 4rem;
  font-weight: bold;
  color: #667eea;
  font-variant-numeric: tabular-nums;
  font-family: 'Courier New', monospace;
}

.status {
  margin-top: 0.5rem;
  color: #999;
  font-size: 1rem;
}

.time-presets {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.preset-btn {
  flex: 1;
  padding: 0.75rem;
  background: rgba(102, 126, 234, 0.1);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn:hover {
  background: rgba(102, 126, 234, 0.2);
  border-color: #667eea;
}

.controls {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.control-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.start-btn {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: #fff;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pause-btn {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: #fff;
}

.pause-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.4);
}

.reset-btn {
  background: rgba(0, 0, 0, 0.1);
  color: #666;
}

.reset-btn:hover {
  background: rgba(0, 0, 0, 0.15);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s linear;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

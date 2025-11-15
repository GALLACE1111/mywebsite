<template>
  <div v-if="isOpen" class="focus-timer-modal">
    <div class="modal-overlay" @click="close"></div>

    <div class="modal-content">
      <button class="close-btn" @click="close">✕</button>

      <h2 class="title">⏰ 專注鬧鐘 ⏰</h2>
      <p class="subtitle">設定專注時間，讓鬧鐘在時間到時提醒你休息 📚</p>

      <!-- 設定表單 -->
      <div v-show="!isRunning" class="alarm-form">
        <div class="input-group">
          <label class="label">專注時間：</label>
          <select v-model="selectedDuration" class="select">
            <option value="5">5 分鐘</option>
            <option value="10">10 分鐘</option>
            <option value="15">15 分鐘</option>
            <option value="20">20 分鐘</option>
            <option value="25">25 分鐘（番茄鐘）</option>
            <option value="30">30 分鐘</option>
            <option value="45">45 分鐘</option>
            <option value="60">60 分鐘</option>
          </select>
        </div>

        <div class="input-group">
          <label class="label">任務名稱：</label>
          <input
            v-model="taskName"
            type="text"
            class="task-input"
            placeholder="例如：閱讀、寫作業、複習..."
            maxlength="30"
          />
        </div>

        <button @click="start" class="start-btn">開始專注 🎯</button>
      </div>

      <!-- 計時顯示 -->
      <div v-show="isRunning" class="alarm-display">
        <div class="timer">{{ displayTime }}</div>
        <div class="task-display">任務：{{ displayTask }}</div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <button @click="stop" class="stop-btn">停止鬧鐘 ⏹️</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { playSound } = useAudio()

const isOpen = ref(false)
const isRunning = ref(false)
const selectedDuration = ref(25) // 預設 25 分鐘（番茄鐘）
const taskName = ref('')
const timeRemaining = ref(0) // 剩餘時間（秒）
const totalTime = ref(0) // 總時間（秒）
const displayTask = ref('') // 顯示的任務名稱

let timerInterval: NodeJS.Timeout | null = null

// 格式化顯示時間
const displayTime = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60)
  const seconds = timeRemaining.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

// 進度百分比
const progressPercent = computed(() => {
  if (totalTime.value === 0) return 0
  return ((totalTime.value - timeRemaining.value) / totalTime.value) * 100
})

// 打開專注鬧鐘
const open = () => {
  isOpen.value = true
}

// 關閉專注鬧鐘
const close = () => {
  if (isRunning.value && !confirm('計時器正在運行，確定要關閉嗎？')) {
    return
  }
  isOpen.value = false
  if (isRunning.value) {
    stop()
  }
}

// 開始專注
const start = () => {
  const duration = selectedDuration.value
  const task = taskName.value.trim() || '專注學習'

  totalTime.value = duration * 60 // 轉換為秒
  timeRemaining.value = totalTime.value
  displayTask.value = task
  isRunning.value = true

  playSound('timer-start')

  // 開始計時
  startTimer()
}

// 停止鬧鐘
const stop = () => {
  isRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  playSound('timer-stop')
}

// 計時器邏輯
const startTimer = () => {
  timerInterval = setInterval(() => {
    timeRemaining.value--

    if (timeRemaining.value <= 0) {
      complete()
    }
  }, 1000)
}

// 計時完成
const complete = () => {
  isRunning.value = false
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }

  // 震動提醒
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200, 100, 200])
  }

  // 播放提示音
  playSound('timer-finish')

  // 提示訊息
  alert('⏰ 時間到！休息一下吧！')

  // 重置狀態
  timeRemaining.value = 0
  totalTime.value = 0
}

// 組件卸載時清理計時器
onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})

// 暴露給父組件
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
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 500px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: rotate(90deg);
}

.title {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

/* 設定表單 */
.alarm-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.select {
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.3s;
}

.select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.task-input {
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

.task-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.start-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

/* 計時顯示 */
.alarm-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.timer {
  font-size: 4rem;
  font-weight: bold;
  color: #667eea;
  font-variant-numeric: tabular-nums;
  font-family: 'Courier New', monospace;
  text-align: center;
}

.task-display {
  font-size: 1.2rem;
  color: #333;
  font-weight: 600;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 1s linear;
  border-radius: 6px;
}

.stop-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.stop-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

/* 注意：手機版響應式設計已永久關閉 */
/* 不要添加任何 @media 查詢，手機用戶會自動重定向到維護頁面 */
</style>

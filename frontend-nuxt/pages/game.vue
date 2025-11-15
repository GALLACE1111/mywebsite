<template>
  <div class="game-page">
    <!-- Canvas 動畫背景 (z-index: 0) - 最底層 -->
    <CanvasBackground ref="canvasBackgroundRef" />

    <!-- 月球世界 -->
    <MoonWorld />

    <!-- Boss 戰鬥 -->
    <BossBattle />

    <!-- 像素風角色 (z-index: 5) - 左下角 -->
    <CharacterAnimation v-if="!gameStore.inMoonWorld && !gameStore.inBossBattle" />

    <!-- 歡迎卡片 (z-index: 10) - 正中央 -->
    <WelcomeCard
      v-if="!gameStore.inMoonWorld && !gameStore.inBossBattle"
      @enter-moon="showMoonDialog"
    />

    <!-- 排行榜組件 -->
    <Leaderboard v-if="!gameStore.inMoonWorld && !gameStore.inBossBattle" />

    <!-- 許願池 -->
    <WishingWell ref="wishingWellRef" />

    <!-- 專注鬧鐘 -->
    <FocusTimer ref="focusTimerRef" />

    <!-- 意見回饋 -->
    <Feedback ref="feedbackRef" />

    <!-- 功能面板 -->
    <div class="function-panel-right" v-if="!gameStore.inMoonWorld && !gameStore.inBossBattle">
      <button @click="openWishingWell" class="function-btn">
        🌟 許願池
      </button>

      <button @click="openFocusTimer" class="function-btn">
        ⏰ 專注鬧鐘
      </button>

      <button @click="openFeedback" class="function-btn">
        ⚙️ 意見回饋
      </button>
    </div>

    <!-- 時段顯示器 (z-index: 999) - 左上角 -->
    <TimeDisplay />

    <!-- 月球雙擊提示 (z-index: 999) - 右上角月亮附近 -->
    <MoonHint />

    <!-- 音量控制器 (z-index: 1000) - 右下角 -->
    <VolumeControl />

    <!-- 社交媒體面板 (z-index: 1000) - 左側中央 -->
    <SocialLinks v-if="!gameStore.inMoonWorld && !gameStore.inBossBattle" />

    <!-- 星星發射器提示 (z-index: 1000) - 下方中央 -->
    <StarHint />

    <!-- 月亮時鐘 + 愛心計數器 (z-index: 9999) - 右上角 -->
    <MoonClock @enter-moon="showMoonDialog" />

    <!-- 進入月球確認對話框 (z-index: 10000) - 最上層 -->
    <MoonDialog
      :show="isMoonDialogVisible"
      @confirm="confirmEnterMoon"
      @cancel="cancelEnterMoon"
    />

    <!-- 提示訊息 -->
    <div v-if="showMessage" class="message-toast" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
const gameStore = useGameStore()
const leaderboardStore = useLeaderboardStore()
const { playMusic, stopMusic } = useAudio()

// 愛心點擊系統：全局點擊監聽，在點擊位置創建浮動愛心特效
// 參考：frontend/assets/js/script.js:2664-2693
useHeartClick()

// 組件 refs
const canvasBackgroundRef = ref()
const wishingWellRef = ref()
const focusTimerRef = ref()
const feedbackRef = ref()

// Provide shootStars 方法給子組件（StarHint）
provide('shootStars', () => {
  if (canvasBackgroundRef.value?.shootStars) {
    canvasBackgroundRef.value.shootStars()
  }
})

const showMessage = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error' | 'info'>('info')

// 月球對話框控制
const isMoonDialogVisible = ref(false)

// 頁面初始化：當遊戲頁面載入時執行
onMounted(() => {
  // 1. 初始化玩家資料（從 LocalStorage 讀取或創建新玩家）
  gameStore.initPlayer()

  // 2. 更新當前時段顯示（早晨/下午/晚上/深夜）
  gameStore.updateTimeOfDay()

  // 3. 自動播放背景音樂（如果玩家已啟用音樂）
  // 預設音量：30%（0.3）
  if (gameStore.musicEnabled) {
    playMusic('background', true, 0.3)
  }
})

// 顯示提示訊息
const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
  message.value = msg
  messageType.value = type
  showMessage.value = true

  setTimeout(() => {
    showMessage.value = false
  }, 3000)
}

// 打開許願池
const openWishingWell = () => {
  wishingWellRef.value?.open()
}

// 打開專注鬧鐘
const openFocusTimer = () => {
  focusTimerRef.value?.open()
}

// 打開意見回饋
const openFeedback = () => {
  feedbackRef.value?.open()
}

// 顯示月球對話框：有兩種觸發方式
// 1. 點擊「WelcomeCard 中的進入月球按鈕」
// 2. 雙擊「MoonClock（右上角的圓形時鐘）」
const showMoonDialog = () => {
  isMoonDialogVisible.value = true
}

// 確認進入月球世界
// 進入後會播放下雨聲 BGM
const confirmEnterMoon = () => {
  isMoonDialogVisible.value = false
  gameStore.enterMoonWorld()
}

// 取消進入月球世界
const cancelEnterMoon = () => {
  isMoonDialogVisible.value = false
}

// 設置頁面 SEO
useHead({
  title: '阿賢的小窩 - 愛心互動遊戲',
  meta: [
    { name: 'description', content: '點擊滑鼠冒出愛心，挑戰血月守護者 Boss，在許願池許願，使用專注鬧鐘，查看排行榜與全球玩家競爭！' },
    { name: 'keywords', content: '愛心遊戲,Boss戰鬥,月球世界,排行榜,許願池,專注鬧鐘,物理引擎' },
    { property: 'og:title', content: '阿賢的小窩 | 愛心互動遊戲' },
    { property: 'og:description', content: '點擊滑鼠冒出愛心，挑戰血月守護者 Boss，在許願池許願！' },
    { name: 'twitter:title', content: '阿賢的小窩 | 愛心互動遊戲' }
  ]
})
</script>

<style scoped>
.game-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.message-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 1.5rem 2.5rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  font-size: 1.2rem;
  font-weight: 600;
  z-index: 999;
  animation: toast-in 0.3s ease-out;
  pointer-events: none;
}

.message-toast.success {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: #fff;
}

.message-toast.error {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
  color: #fff;
}

.message-toast.info {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: #fff;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* 功能按鈕面板：右側置中（垂直排列，貼平網頁右側）*/
.function-panel-right {
  position: fixed;
  right: 1rem; /* 貼平右側 */
  top: 50%; /* 垂直置中 */
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 100;
}

.function-btn {
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 140px;
}

.function-btn:hover {
  background: rgba(255, 255, 255, 1);
  border-color: #667eea;
  transform: translateX(-5px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.moon-btn {
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  color: #fff;
  border-color: transparent;
}

.moon-btn:hover {
  transform: translateX(-5px) scale(1.05);
  box-shadow: 0 4px 12px rgba(74, 85, 104, 0.4);
}

/* 注意：手機版響應式設計已永久關閉 */
/* 不要添加任何 @media 查詢，手機用戶會自動重定向到維護頁面 */
</style>

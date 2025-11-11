<template>
  <div class="game-page">
    <!-- 月球世界 -->
    <MoonWorld />

    <!-- Boss 戰鬥 -->
    <BossBattle />

    <!-- 滑鼠點擊互動區域:點擊滑鼠會冒出愛心,使用物理引擎 (Matter.js) -->
    <!-- 滑鼠游標有可愛 icon -->
    <HeartInteraction v-if="!gameStore.inMoonWorld" />

    <!-- 排行榜組件 -->
    <Leaderboard v-if="!gameStore.inMoonWorld && !gameStore.inBossBattle" />

    <!-- 許願池 -->
    <WishingWell ref="wishingWellRef" />

    <!-- 專注鬧鐘 -->
    <FocusTimer ref="focusTimerRef" />

    <!-- 個人資料 -->
    <PlayerProfile ref="playerProfileRef" />

    <!-- 意見回饋 -->
    <Feedback ref="feedbackRef" />

    <!-- 功能面板 -->
    <div class="function-panel-right" v-if="!gameStore.inMoonWorld && !gameStore.inBossBattle">
      <button @click="openProfile" class="function-btn">
        👤 個人資料
      </button>

      <button @click="openWishingWell" class="function-btn">
        🌟 許願池
      </button>

      <button @click="openFocusTimer" class="function-btn">
        ⏰ 專注鬧鐘
      </button>

      <button @click="openFeedback" class="function-btn">
        ⚙️ 意見回饋
      </button>

      <button @click="enterMoonWorld" class="function-btn moon-btn">
        🌙 月球世界
      </button>
    </div>

    <!-- 玩家資訊卡片 -->
    <div class="player-info-card">
      <div class="player-avatar">
        <img :src="playerAvatar" alt="玩家頭像" @error="handleAvatarError" />
      </div>
      <div class="player-details">
        <div class="player-name">{{ gameStore.displayName }}</div>
        <div class="player-stats">
          <span class="stat">
            <span class="label">當前:</span>
            <span class="value">{{ gameStore.heartCount }} ❤️</span>
          </span>
          <span class="stat">
            <span class="label">總計:</span>
            <span class="value">{{ gameStore.totalHearts }} ❤️</span>
          </span>
        </div>
        <div v-if="gameStore.currentTitle" class="player-title">
          {{ gameStore.currentTitle }}
        </div>
      </div>
    </div>

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

// 組件 refs
const wishingWellRef = ref()
const focusTimerRef = ref()
const playerProfileRef = ref()
const feedbackRef = ref()

const showMessage = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error' | 'info'>('info')

// 玩家頭像：從 LocalStorage 或後端獲取玩家上傳的頭像
// 如果玩家沒有上傳頭像，使用預設頭像
const playerAvatar = computed(() => {
  // TODO: 實作從後端獲取玩家頭像的邏輯
  // 目前 gameStore 尚未實作 playerAvatar 屬性，暫時使用預設頭像
  return '/images/default-avatar.png'
})

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

// 自動提交分數：當玩家獲得愛心時，由 HeartInteraction 組件自動調用 leaderboardStore.submitScore()
// 不需要手動提交按鈕，分數會即時同步到排行榜

// 顯示提示訊息
const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
  message.value = msg
  messageType.value = type
  showMessage.value = true

  setTimeout(() => {
    showMessage.value = false
  }, 3000)
}

// 處理頭像錯誤
const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/default-avatar.png'
}

// 打開個人資料
const openProfile = () => {
  playerProfileRef.value?.open()
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

// 進入月球世界：有兩種方式
// 1. 點擊「網頁中間上方的進入月球按鈕」
// 2. 雙擊「右上角的圓形時鐘」
// 進入後會播放下雨聲 BGM
const enterMoonWorld = () => {
  gameStore.enterMoonWorld()
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

.player-info-card {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 280px;
}

.player-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #667eea;
  flex-shrink: 0;
}

.player-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-details {
  flex: 1;
}

.player-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
}

.player-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat .label {
  color: #666;
}

.stat .value {
  font-weight: 600;
  color: #e91e63;
}

.player-title {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 0.75rem;
  border-radius: 12px;
  margin-top: 0.5rem;
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

/* 響應式設計 */
@media (max-width: 768px) {
  .player-info-card {
    left: 50%;
    transform: translateX(-50%);
    bottom: 0.5rem;
    width: calc(100% - 2rem);
    max-width: 400px;
    min-width: auto;
  }

  .player-avatar {
    width: 50px;
    height: 50px;
  }

  .player-name {
    font-size: 1rem;
  }

  .player-stats {
    font-size: 0.85rem;
  }

  .function-panel-right {
    bottom: auto;
    top: 1rem;
    right: 1rem;
    left: auto;
    transform: none;
    flex-direction: column;
    gap: 0.5rem;
  }

  .function-btn {
    min-width: 120px;
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .message-toast {
    width: calc(100% - 2rem);
    left: 1rem;
    transform: translateX(0) translateY(-50%);
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
}
</style>

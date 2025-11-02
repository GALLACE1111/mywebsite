<template>
  <div class="game-page">
    <!-- 月球世界 -->
    <MoonWorld />

    <!-- Boss 戰鬥 -->
    <BossBattle />

    <!-- 愛心互動組件 -->
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

    <!-- 控制面板 -->
    <div class="control-panel" v-if="!gameStore.inMoonWorld && !gameStore.inBossBattle">
      <!-- 音效控制 -->
      <button @click="toggleMusic" class="control-btn" :class="{ active: gameStore.musicEnabled }">
        {{ gameStore.musicEnabled ? '🔊' : '🔇' }} 音樂
      </button>

      <button @click="toggleSound" class="control-btn" :class="{ active: gameStore.soundEnabled }">
        {{ gameStore.soundEnabled ? '🔔' : '🔕' }} 音效
      </button>

      <!-- 提交分數 -->
      <button @click="submitScore" class="control-btn submit-btn" :disabled="submitting || gameStore.heartCount === 0">
        {{ submitting ? '提交中...' : '💾 提交分數' }}
      </button>
    </div>

    <!-- 功能面板 -->
    <div class="function-panel" v-if="!gameStore.inMoonWorld && !gameStore.inBossBattle">
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

const submitting = ref(false)
const showMessage = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error' | 'info'>('info')

// 玩家頭像
const playerAvatar = computed(() => {
  // 可以從後端獲取，暫時使用預設
  return '/images/default-avatar.png'
})

// 初始化
onMounted(() => {
  // 初始化玩家
  gameStore.initPlayer()

  // 更新時段
  gameStore.updateTimeOfDay()

  // 如果啟用音樂，播放背景音樂
  if (gameStore.musicEnabled) {
    playMusic('background', true, 0.3)
  }
})

// 切換音樂
const toggleMusic = () => {
  gameStore.toggleMusic()

  if (gameStore.musicEnabled) {
    playMusic('background', true, 0.3)
  } else {
    stopMusic()
  }
}

// 切換音效
const toggleSound = () => {
  gameStore.toggleSound()
}

// 提交分數
const submitScore = async () => {
  if (submitting.value || gameStore.heartCount === 0) return

  submitting.value = true

  try {
    await leaderboardStore.submitScore(
      gameStore.playerId,
      gameStore.username,
      gameStore.heartCount
    )

    showToast('分數提交成功！🎉', 'success')

    // 重置當前愛心數（但保留總數）
    gameStore.heartCount = 0
    gameStore.saveToStorage()
  } catch (error: any) {
    showToast(error.message || '分數提交失敗', 'error')
  } finally {
    submitting.value = false
  }
}

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

// 進入月球世界
const enterMoonWorld = () => {
  gameStore.enterMoonWorld()
}

// 設置頁面 SEO
useHead({
  title: '開始遊戲',
  meta: [
    { name: 'description', content: '開始你的愛心收集之旅！點擊愛心、探索月球世界、挑戰血月 Boss、使用專注鬧鐘、在許願池許願，還能查看全球排行榜與其他玩家競爭。' },
    { name: 'keywords', content: '開始遊戲,愛心收集,Boss戰鬥,月球探索,排行榜,許願池,專注鬧鐘' },
    { property: 'og:title', content: '開始遊戲 | 愛心互動遊戲' },
    { property: 'og:description', content: '開始你的愛心收集之旅！點擊愛心、探索月球世界、挑戰血月 Boss。' },
    { name: 'twitter:title', content: '開始遊戲 | 愛心互動遊戲' }
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

.control-panel {
  position: fixed;
  top: 1rem;
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 100;
}

.control-btn {
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
  min-width: 120px;
}

.control-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 1);
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.control-btn:active:not(:disabled) {
  transform: translateY(0);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-color: transparent;
}

.submit-btn {
  background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);
  color: #fff;
  border-color: transparent;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(233, 30, 99, 0.4);
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

.function-panel {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
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
  .control-panel {
    top: auto;
    bottom: 5rem;
    left: 50%;
    transform: translateX(-50%);
    flex-direction: row;
    width: calc(100% - 2rem);
    max-width: 400px;
  }

  .control-btn {
    flex: 1;
    min-width: auto;
    padding: 0.75rem;
    font-size: 0.85rem;
  }

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

  .function-panel {
    bottom: auto;
    top: 1rem;
    right: 1rem;
    left: auto;
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

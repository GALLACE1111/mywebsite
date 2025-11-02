<template>
  <div class="leaderboard" :class="{ collapsed: !isExpanded }">
    <!-- 標題欄 -->
    <div class="header" @click="toggleExpand">
      <h3 class="title">
        <span class="icon">🏆</span>
        排行榜
      </h3>
      <button class="toggle-btn" :aria-label="isExpanded ? '收起' : '展開'">
        {{ isExpanded ? '▼' : '▲' }}
      </button>
    </div>

    <!-- 內容區 -->
    <div v-if="isExpanded" class="content">
      <!-- 載入中 -->
      <div v-if="leaderboardStore.loading" class="loading">
        <div class="spinner"></div>
        <p>載入中...</p>
      </div>

      <!-- 錯誤訊息 -->
      <div v-else-if="leaderboardStore.error" class="error">
        <span class="icon">⚠️</span>
        <p>{{ leaderboardStore.error }}</p>
        <button @click="refresh" class="retry-btn">重試</button>
      </div>

      <!-- 排行榜內容 -->
      <div v-else-if="leaderboardStore.hasPlayers" class="players-container">
        <!-- 前三名特殊展示 -->
        <div v-if="leaderboardStore.topThreePlayers.length > 0" class="top-three">
          <div
            v-for="(player, index) in leaderboardStore.topThreePlayers"
            :key="player.id"
            class="top-player"
            :class="`rank-${index + 1}`"
          >
            <div class="rank-badge">{{ getRankIcon(index + 1) }}</div>
            <div class="avatar">
              <img
                :src="player.avatar_url || '/images/default-avatar.png'"
                :alt="player.username"
                @error="handleImageError"
              />
            </div>
            <div class="player-info">
              <div class="username" :title="player.username">
                {{ player.username }}
              </div>
              <div class="score">{{ formatScore(player.score) }} ❤️</div>
              <div v-if="player.title" class="title-badge">
                {{ player.title }}
              </div>
            </div>
          </div>
        </div>

        <!-- 其他玩家列表 -->
        <div class="player-list" ref="listContainer">
          <div
            v-for="(player, index) in otherPlayers"
            :key="player.id"
            class="player-item"
            :class="{
              'is-me': player.id === gameStore.playerId,
              'even': index % 2 === 0
            }"
          >
            <span class="rank">#{{ index + 4 }}</span>
            <div class="avatar-small">
              <img
                :src="player.avatar_url || '/images/default-avatar.png'"
                :alt="player.username"
                @error="handleImageError"
              />
            </div>
            <span class="username" :title="player.username">
              {{ truncate(player.username, 12) }}
            </span>
            <span class="score">{{ formatScore(player.score) }}</span>
          </div>
        </div>

        <!-- 我的排名 -->
        <div v-if="leaderboardStore.myRank" class="my-rank">
          <span class="label">我的排名:</span>
          <span class="rank-value">{{ leaderboardStore.myRankText }}</span>
        </div>
      </div>

      <!-- 無數據 -->
      <div v-else class="no-data">
        <span class="icon">📊</span>
        <p>還沒有排行榜數據</p>
        <p class="hint">成為第一個上榜的玩家吧！</p>
      </div>

      <!-- 自動刷新指示器 -->
      <div v-if="leaderboardStore.autoRefresh" class="auto-refresh">
        <span class="pulse"></span>
        自動刷新中...
      </div>

      <!-- 控制按鈕 -->
      <div class="controls">
        <button @click="refresh" class="control-btn" :disabled="leaderboardStore.loading">
          🔄 刷新
        </button>
        <button @click="toggleAutoRefresh" class="control-btn">
          {{ leaderboardStore.autoRefresh ? '⏸️ 暫停' : '▶️ 自動' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const gameStore = useGameStore()
const leaderboardStore = useLeaderboardStore()

const isExpanded = ref(true)
const listContainer = ref<HTMLElement>()

// 其他玩家（排除前三名）
const otherPlayers = computed(() => {
  return leaderboardStore.players.slice(3)
})

// 切換展開/收起
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// 刷新排行榜
const refresh = async () => {
  await leaderboardStore.fetchLeaderboard()
}

// 切換自動刷新
const toggleAutoRefresh = () => {
  if (leaderboardStore.autoRefresh) {
    leaderboardStore.stopAutoRefresh()
  } else {
    leaderboardStore.startAutoRefresh()
  }
}

// 獲取排名圖標
const getRankIcon = (rank: number): string => {
  const icons: Record<number, string> = {
    1: '🥇',
    2: '🥈',
    3: '🥉'
  }
  return icons[rank] || `#${rank}`
}

// 格式化分數
const formatScore = (score: number): string => {
  if (score >= 1000000) {
    return (score / 1000000).toFixed(1) + 'M'
  } else if (score >= 1000) {
    return (score / 1000).toFixed(1) + 'K'
  }
  return score.toString()
}

// 截斷文字
const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

// 處理圖片錯誤
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/default-avatar.png'
}

// 自動刷新計時器
let refreshTimer: NodeJS.Timeout | null = null

const startAutoRefreshTimer = () => {
  if (!leaderboardStore.autoRefresh) return

  refreshTimer = setInterval(() => {
    leaderboardStore.fetchLeaderboard()
  }, leaderboardStore.refreshInterval)
}

const stopAutoRefreshTimer = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 初始化
onMounted(async () => {
  // 獲取排行榜
  await leaderboardStore.fetchLeaderboard()

  // 啟動自動刷新
  if (leaderboardStore.autoRefresh) {
    startAutoRefreshTimer()
  }

  // 如果有玩家 ID，獲取個人排名
  if (gameStore.playerId) {
    await leaderboardStore.fetchMyRank(gameStore.playerId)
  }
})

// 監聽自動刷新狀態變化
watch(() => leaderboardStore.autoRefresh, (newValue) => {
  if (newValue) {
    startAutoRefreshTimer()
  } else {
    stopAutoRefreshTimer()
  }
})

// 清理
onUnmounted(() => {
  stopAutoRefreshTimer()
})
</script>

<style scoped>
.leaderboard {
  position: fixed;
  top: 1rem;
  right: 1rem;
  width: 350px;
  max-height: 90vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
}

.leaderboard.collapsed {
  width: 200px;
  max-height: 60px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  user-select: none;
}

.title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
  font-size: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.content {
  max-height: calc(90vh - 80px);
  overflow-y: auto;
  padding: 1rem;
}

/* 自定義滾動條 */
.content::-webkit-scrollbar {
  width: 6px;
}

.content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

.content::-webkit-scrollbar-thumb {
  background: rgba(102, 126, 234, 0.5);
  border-radius: 3px;
}

.content::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 126, 234, 0.7);
}

.loading,
.error,
.no-data {
  text-align: center;
  padding: 2rem 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error {
  color: #f44336;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: #f44336;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #d32f2f;
}

.top-three {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(102, 126, 234, 0.2);
}

.top-player {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 12px;
  transition: all 0.2s;
}

.top-player.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.top-player.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  box-shadow: 0 4px 12px rgba(192, 192, 192, 0.3);
}

.top-player.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #e5a569 100%);
  box-shadow: 0 4px 12px rgba(205, 127, 50, 0.3);
}

.rank-badge {
  font-size: 2rem;
  flex-shrink: 0;
}

.avatar,
.avatar-small {
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 50px;
  height: 50px;
}

.avatar-small {
  width: 30px;
  height: 30px;
}

.avatar img,
.avatar-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-info {
  flex: 1;
  min-width: 0;
}

.username {
  font-weight: 600;
  font-size: 0.95rem;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score {
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.25rem;
}

.title-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  font-size: 0.75rem;
  border-radius: 4px;
  margin-top: 0.25rem;
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.player-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.player-item.even {
  background: rgba(0, 0, 0, 0.02);
}

.player-item.is-me {
  background: rgba(102, 126, 234, 0.1);
  border: 2px solid #667eea;
}

.player-item .rank {
  font-weight: 600;
  color: #667eea;
  min-width: 35px;
}

.player-item .username {
  flex: 1;
  font-size: 0.9rem;
}

.player-item .score {
  font-weight: 600;
  color: #e91e63;
}

.my-rank {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  margin-top: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
}

.auto-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  padding: 0.5rem;
  font-size: 0.85rem;
  color: #666;
}

.pulse {
  width: 8px;
  height: 8px;
  background: #4caf50;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.controls {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.control-btn {
  flex: 1;
  padding: 0.75rem;
  background: #667eea;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-data {
  color: #999;
}

.no-data .icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.hint {
  font-size: 0.85rem;
  color: #bbb;
  margin-top: 0.5rem;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .leaderboard {
    top: auto;
    bottom: 0;
    right: 0;
    left: 0;
    width: 100%;
    max-height: 50vh;
    border-radius: 16px 16px 0 0;
  }

  .leaderboard.collapsed {
    width: 100%;
    max-height: 60px;
  }
}
</style>

<template>
  <div v-if="isOpen" class="leaderboard-modal">
    <div class="modal-overlay" @click="close"></div>

    <div class="modal-content">
      <button class="close-btn" @click="close">✕</button>

      <h2 class="title">🏆 愛心排行榜 🏆</h2>
      <p class="description">展示最有愛心的前 10 名玩家 💖</p>

      <!-- 排行榜列表 -->
      <div class="leaderboard-list">
        <!-- 載入中 -->
        <div v-if="loading" class="loading">載入中...</div>

        <!-- 錯誤訊息 -->
        <div v-else-if="error" class="error">
          {{ error }}
        </div>

        <!-- 排行榜內容 -->
        <div v-else-if="players.length > 0" class="players">
          <div
            v-for="(player, index) in players"
            :key="player.id"
            class="player-item"
            :class="{ 'top-three': index < 3 }"
          >
            <span class="rank">{{ getRankDisplay(index + 1) }}</span>
            <span class="username">{{ player.username }}</span>
            <span class="score">{{ player.score }} 💖</span>
          </div>
        </div>

        <!-- 無數據 -->
        <div v-else class="no-data">
          還沒有排行榜數據
        </div>
      </div>

      <!-- 你的排名 -->
      <div v-if="myRank && myRank.rank" class="user-rank">
        <h3>你的排名</h3>
        <div class="rank-info">
          <span class="rank-number">#{{ myRank.rank }}</span>
          <span class="rank-username">{{ myRank.username }}</span>
          <span class="rank-loves">{{ myRank.score }} 💖</span>
        </div>
      </div>
    </div>
  </div>
</template>

<!--
  ⚠️ 未來功能備註（待實現）：

  1. 前三名特殊展示（金銀銅牌背景）
     - 第1名：金色漸變背景
     - 第2名：銀色漸變背景
     - 第3名：銅色漸變背景

  2. 頭像顯示
     - 在玩家名稱旁邊顯示頭像
     - avatar（大頭像，50px）用於前三名
     - avatar-small（小頭像，30px）用於其他玩家

  3. 稱號徽章
     - 顯示玩家的特殊稱號
     - 例如：「愛心大使」、「月球探險家」等

  4. 自動刷新功能
     - 每 30 秒自動刷新排行榜
     - 可暫停/恢復自動刷新

  5. 展開/收起功能
     - 改為固定側邊欄模式
     - 可點擊標題展開/收起
-->

<script setup lang="ts">
const gameStore = useGameStore()
const leaderboardStore = useLeaderboardStore()

interface Player {
  id: string
  username: string
  score: number
}

interface MyRank {
  rank: number
  username: string
  score: number
}

const isOpen = ref(false)
const loading = ref(false)
const error = ref('')
const players = ref<Player[]>([])
const myRank = ref<MyRank | null>(null)

// 獲取排名顯示（前三名顯示獎盃）
const getRankDisplay = (rank: number): string => {
  const icons: Record<number, string> = {
    1: '🥇',
    2: '🥈',
    3: '🥉'
  }
  return icons[rank] || `#${rank}`
}

// 打開排行榜
const open = async () => {
  isOpen.value = true
  await loadLeaderboard()
}

// 關閉排行榜
const close = () => {
  isOpen.value = false
}

// 載入排行榜數據
const loadLeaderboard = async () => {
  loading.value = true
  error.value = ''

  try {
    // 獲取前 10 名
    await leaderboardStore.fetchLeaderboard()

    if (leaderboardStore.players) {
      players.value = leaderboardStore.players.slice(0, 10)
    }

    // 獲取我的排名
    if (gameStore.playerId) {
      await leaderboardStore.fetchMyRank(gameStore.playerId)

      if (leaderboardStore.myRank) {
        myRank.value = {
          rank: leaderboardStore.myRank,
          username: gameStore.username,
          score: gameStore.heartCount
        }
      }
    }
  } catch (err: any) {
    console.error('載入排行榜失敗:', err)
    error.value = '載入失敗，請稍後再試'
  } finally {
    loading.value = false
  }
}

// 暴露給父組件
defineExpose({
  open,
  close
})
</script>

<style scoped>
.leaderboard-modal {
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
  max-height: 80vh;
  background: #fff;
  border-radius: 20px;
  padding: 2rem;
  overflow-y: auto;
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

.description {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.leaderboard-list {
  margin-bottom: 2rem;
}

.loading,
.error,
.no-data {
  text-align: center;
  padding: 2rem 1rem;
  color: #999;
}

.error {
  color: #f44336;
}

.players {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.player-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.2s;
}

.player-item:hover {
  background: #f0f1f3;
  transform: translateX(5px);
}

/* 前三名樣式（未來可改為金銀銅漸變背景） */
.player-item.top-three {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2px solid rgba(102, 126, 234, 0.3);
}

.rank {
  font-size: 1.5rem;
  font-weight: bold;
  min-width: 50px;
}

.username {
  flex: 1;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 1rem;
}

.score {
  font-weight: bold;
  color: #e91e63;
  white-space: nowrap;
}

/* 你的排名 */
.user-rank {
  border-top: 2px solid #f0f0f0;
  padding-top: 1.5rem;
}

.user-rank h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
}

.rank-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 12px;
}

.rank-number {
  font-size: 1.5rem;
  font-weight: bold;
}

.rank-username {
  flex: 1;
  font-weight: 600;
  text-align: center;
  margin: 0 1rem;
}

.rank-loves {
  font-weight: bold;
  white-space: nowrap;
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

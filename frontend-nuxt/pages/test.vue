<template>
  <div class="landing-page">
    <div class="hero">
      <h1 class="title">
        <span class="heart-icon">❤️</span>
        愛心互動遊戲
        <span class="heart-icon">❤️</span>
      </h1>

      <p class="subtitle">
        點擊愛心，收集分數，與全世界的玩家一起競爭！
      </p>

      <div class="features">
        <div class="feature">
          <div class="feature-icon">🎮</div>
          <h3>互動遊戲</h3>
          <p>點擊愛心，享受物理效果</p>
        </div>
        <div class="feature">
          <div class="feature-icon">🏆</div>
          <h3>全球排行榜</h3>
          <p>與玩家競爭，爭奪榜首</p>
        </div>
        <div class="feature">
          <div class="feature-icon">✨</div>
          <h3>精美動畫</h3>
          <p>流暢的視覺效果體驗</p>
        </div>
      </div>

      <div class="actions">
        <NuxtLink to="/game" class="play-btn">
          🚀 開始遊戲
        </NuxtLink>
        <NuxtLink to="/test" class="test-btn">
          🧪 測試頁面
        </NuxtLink>
      </div>

      <div class="stats">
        <div class="stat-item">
          <div class="stat-value">{{ totalPlayers }}</div>
          <div class="stat-label">總玩家數</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ formatScore(topScore) }}</div>
          <div class="stat-label">最高分數</div>
        </div>
      </div>

      <div class="tech-stack">
        <p class="tech-label">技術棧：</p>
        <div class="tech-badges">
          <span class="tech-badge">Nuxt 3</span>
          <span class="tech-badge">Vue 3</span>
          <span class="tech-badge">TypeScript</span>
          <span class="tech-badge">Pinia</span>
          <span class="tech-badge">Matter.js</span>
          <span class="tech-badge">Firebase</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const leaderboardStore = useLeaderboardStore()

const totalPlayers = ref(0)
const topScore = ref(0)

// 初始化
onMounted(async () => {
  try {
    await leaderboardStore.fetchLeaderboard()

    totalPlayers.value = leaderboardStore.total
    if (leaderboardStore.players.length > 0) {
      topScore.value = leaderboardStore.players[0].score
    }
  } catch (error) {
    console.error('載入統計失敗:', error)
  }
})

// 格式化分數
const formatScore = (score: number): string => {
  if (score >= 1000000) {
    return (score / 1000000).toFixed(1) + 'M'
  } else if (score >= 1000) {
    return (score / 1000).toFixed(1) + 'K'
  }
  return score.toString()
}

// 設置頁面標題
useHead({
  title: '愛心互動遊戲 - 歡迎',
  meta: [
    { name: 'description', content: '一個充滿愛心的互動遊戲，點擊愛心，收集分數，與全世界的玩家一起競爭！' }
  ]
})
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.hero {
  text-align: center;
  color: #fff;
  max-width: 900px;
}

.title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  animation: fadeIn 0.8s ease-out;
}

.heart-icon {
  font-size: 4rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.subtitle {
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: 3rem;
  opacity: 0.95;
  animation: fadeIn 1s ease-out 0.2s both;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  animation: fadeIn 1.2s ease-out 0.4s both;
}

.feature {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 16px;
  transition: all 0.3s;
}

.feature:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.feature p {
  font-size: 1rem;
  opacity: 0.9;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
  animation: fadeIn 1.4s ease-out 0.6s both;
}

.play-btn,
.test-btn {
  padding: 1rem 3rem;
  font-size: 1.2rem;
  font-weight: 700;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s;
  display: inline-block;
}

.play-btn {
  background: #fff;
  color: #667eea;
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.3);
}

.play-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 30px rgba(255, 255, 255, 0.5);
}

.test-btn {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  border: 2px solid #fff;
}

.test-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-3px);
}

.stats {
  display: flex;
  gap: 3rem;
  justify-content: center;
  margin-bottom: 3rem;
  animation: fadeIn 1.6s ease-out 0.8s both;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
  font-weight: 300;
}

.tech-stack {
  animation: fadeIn 1.8s ease-out 1s both;
}

.tech-label {
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 1rem;
}

.tech-badges {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.tech-badge {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .title {
    font-size: 2.5rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .heart-icon {
    font-size: 3rem;
  }

  .subtitle {
    font-size: 1.2rem;
  }

  .features {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .actions {
    flex-direction: column;
    gap: 1rem;
  }

  .play-btn,
  .test-btn {
    width: 100%;
    max-width: 300px;
  }

  .stats {
    gap: 2rem;
  }

  .stat-value {
    font-size: 2rem;
  }
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

h1 {
  color: #e91e63;
  text-align: center;
  margin-bottom: 2rem;
}

h2 {
  color: #333;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.stats {
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.stats p {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

button {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.heart-btn {
  background: #e91e63;
  color: white;
  flex: 1;
}

.heart-btn:hover {
  background: #c2185b;
  transform: scale(1.05);
}

.submit-btn {
  background: #2196f3;
  color: white;
  flex: 1;
}

.submit-btn:hover:not(:disabled) {
  background: #1976d2;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.refresh-btn {
  background: #4caf50;
  color: white;
  width: 100%;
  margin-top: 1rem;
}

.refresh-btn:hover:not(:disabled) {
  background: #45a049;
}

.refresh-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.leaderboard-section {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.loading, .error, .no-data {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #f44336;
}

.players {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.player-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 6px;
  transition: background 0.3s;
}

.player-card:hover {
  background: #f0f0f0;
}

.rank {
  font-weight: bold;
  color: #2196f3;
  min-width: 50px;
}

.username {
  flex: 1;
  font-weight: 500;
}

.score {
  color: #e91e63;
  font-weight: bold;
}

.api-info {
  margin-top: 2rem;
  padding: 1rem;
  background: #e3f2fd;
  border-radius: 6px;
  border-left: 4px solid #2196f3;
}

.api-info h3 {
  margin-top: 0;
  color: #1976d2;
}

.api-info code {
  background: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.tip {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}
</style>

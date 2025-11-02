# 遷移指南 - 從 Vanilla JS 到 Nuxt.js

本文檔說明如何將原有的功能逐步遷移到 Nuxt.js 版本。

## 📋 遷移進度

### ✅ 已完成（階段 1）
- [x] 專案架構設置
- [x] 依賴安裝
- [x] 環境配置
- [x] API 調用層
- [x] 狀態管理（Stores）
- [x] 測試頁面

### ⏳ 進行中（階段 2）
接下來需要遷移的核心功能：

## 🎯 下一步：遷移愛心互動系統

### 原始代碼位置
- `frontend/assets/js/script.js`（第 1-3019 行）
- 主要包含愛心點擊、動畫、分數累加邏輯

### 遷移步驟

#### 1. 創建愛心組件

創建 `components/HeartInteraction.vue`：

```vue
<template>
  <div class="heart-container" @click="handleHeartClick">
    <div class="heart" :class="{ beating: isBeating }">
      ❤️
    </div>
    <div class="counter">{{ gameStore.heartCount }}</div>
  </div>
</template>

<script setup lang="ts">
const gameStore = useGameStore()
const isBeating = ref(false)

const handleHeartClick = () => {
  // 增加愛心計數
  gameStore.clickHeart(1)

  // 播放動畫
  triggerBeatAnimation()

  // 播放音效（如果啟用）
  if (gameStore.soundEnabled) {
    playSound('heart-click')
  }
}

const triggerBeatAnimation = () => {
  isBeating.value = true
  setTimeout(() => {
    isBeating.value = false
  }, 300)
}
</script>

<style scoped>
.heart {
  font-size: 5rem;
  cursor: pointer;
  transition: transform 0.3s;
}

.heart.beating {
  animation: beat 0.3s ease;
}

@keyframes beat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
</style>
```

#### 2. 創建音效管理 Composable

創建 `composables/useAudio.ts`：

```typescript
export const useAudio = () => {
  const gameStore = useGameStore()

  const audioCache = new Map<string, HTMLAudioElement>()

  const playSound = (soundName: string) => {
    if (!gameStore.soundEnabled) return

    let audio = audioCache.get(soundName)

    if (!audio) {
      audio = new Audio(`/audio/${soundName}.mp3`)
      audioCache.set(soundName, audio)
    }

    audio.currentTime = 0
    audio.play().catch(err => console.error('播放音效失敗:', err))
  }

  const playMusic = (musicName: string, loop = true) => {
    if (!gameStore.musicEnabled) return

    const music = new Audio(`/audio/${musicName}.mp3`)
    music.loop = loop
    music.play().catch(err => console.error('播放音樂失敗:', err))

    return music
  }

  return {
    playSound,
    playMusic
  }
}
```

## 🏆 遷移排行榜組件

### 原始代碼位置
- `frontend/assets/js/side-leaderboard.js`（586 行）
- 使用 Clusterize.js 實現虛擬滾動

### 遷移步驟

#### 1. 創建排行榜組件

創建 `components/Leaderboard.vue`：

```vue
<template>
  <div class="leaderboard" :class="{ collapsed: !isExpanded }">
    <div class="header" @click="toggle">
      <h3>排行榜</h3>
      <button class="toggle-btn">
        {{ isExpanded ? '▼' : '▲' }}
      </button>
    </div>

    <div v-if="isExpanded" class="content">
      <!-- 前三名特殊顯示 -->
      <div class="top-three">
        <div
          v-for="(player, index) in leaderboardStore.topThreePlayers"
          :key="player.id"
          class="top-player"
          :class="`rank-${index + 1}`"
        >
          <div class="rank-icon">{{ getRankIcon(index + 1) }}</div>
          <img :src="player.avatar_url || '/default-avatar.png'" class="avatar" />
          <div class="info">
            <div class="username">{{ player.username }}</div>
            <div class="score">{{ player.score }} ❤️</div>
          </div>
        </div>
      </div>

      <!-- 其他玩家（虛擬滾動）-->
      <div class="player-list" ref="listContainer">
        <div
          v-for="(player, index) in visiblePlayers"
          :key="player.id"
          class="player-item"
        >
          <span class="rank">#{{ index + 4 }}</span>
          <span class="username">{{ player.username }}</span>
          <span class="score">{{ player.score }}</span>
        </div>
      </div>

      <!-- 自動刷新指示器 -->
      <div v-if="leaderboardStore.autoRefresh" class="auto-refresh">
        🔄 自動刷新中...
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const leaderboardStore = useLeaderboardStore()

const isExpanded = ref(true)
const listContainer = ref<HTMLElement>()

// 虛擬滾動：只顯示可見的玩家
const visiblePlayers = computed(() => {
  return leaderboardStore.players.slice(3, 100) // 跳過前 3 名
})

const toggle = () => {
  isExpanded.value = !isExpanded.value
}

const getRankIcon = (rank: number) => {
  const icons: Record<number, string> = {
    1: '🥇',
    2: '🥈',
    3: '🥉'
  }
  return icons[rank] || `#${rank}`
}

// 自動刷新
let refreshTimer: NodeJS.Timeout | null = null

onMounted(() => {
  // 開始自動刷新
  if (leaderboardStore.autoRefresh) {
    refreshTimer = setInterval(() => {
      leaderboardStore.fetchLeaderboard()
    }, leaderboardStore.refreshInterval)
  }
})

onUnmounted(() => {
  // 清除定時器
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped>
/* 樣式從原始 leaderboard.css 遷移過來 */
</style>
```

## 🎮 遷移物理引擎

### 原始代碼位置
- `frontend/assets/js/heart-physics.js`（373 行）
- 使用 Matter.js

### 遷移步驟

#### 1. 創建物理引擎 Composable

創建 `composables/useHeartPhysics.ts`：

```typescript
import Matter from 'matter-js'

export const useHeartPhysics = () => {
  const engine = ref<Matter.Engine | null>(null)
  const render = ref<Matter.Render | null>(null)
  const runner = ref<Matter.Runner | null>(null)

  const hearts = ref<Matter.Body[]>([])

  const init = (container: HTMLElement) => {
    // 創建引擎
    engine.value = Matter.Engine.create()
    engine.value.gravity.y = 0.5

    // 創建渲染器
    render.value = Matter.Render.create({
      element: container,
      engine: engine.value,
      options: {
        width: container.clientWidth,
        height: container.clientHeight,
        wireframes: false,
        background: 'transparent'
      }
    })

    // 創建地面
    const ground = Matter.Bodies.rectangle(
      container.clientWidth / 2,
      container.clientHeight,
      container.clientWidth,
      50,
      { isStatic: true }
    )

    Matter.World.add(engine.value.world, [ground])

    // 啟動引擎
    runner.value = Matter.Runner.create()
    Matter.Runner.run(runner.value, engine.value)
    Matter.Render.run(render.value)
  }

  const addHeart = (x: number, y: number) => {
    if (!engine.value) return

    const heart = Matter.Bodies.circle(x, y, 20, {
      render: {
        sprite: {
          texture: '/images/heart.png',
          xScale: 0.5,
          yScale: 0.5
        }
      },
      restitution: 0.8 // 彈性
    })

    hearts.value.push(heart)
    Matter.World.add(engine.value.world, heart)
  }

  const cleanup = () => {
    if (runner.value && engine.value) {
      Matter.Runner.stop(runner.value)
    }
    if (render.value) {
      Matter.Render.stop(render.value)
    }
    if (engine.value) {
      Matter.Engine.clear(engine.value)
    }

    hearts.value = []
  }

  return {
    init,
    addHeart,
    cleanup
  }
}
```

#### 2. 在組件中使用

```vue
<template>
  <div ref="physicsContainer" class="physics-container"></div>
</template>

<script setup lang="ts">
const physicsContainer = ref<HTMLElement>()
const { init, addHeart, cleanup } = useHeartPhysics()

onMounted(() => {
  if (physicsContainer.value) {
    init(physicsContainer.value)
  }
})

onUnmounted(() => {
  cleanup()
})

// 點擊時添加愛心
const handleClick = (event: MouseEvent) => {
  addHeart(event.offsetX, event.offsetY)
}
</script>
```

## 🎨 遷移樣式

### 策略 1：直接複製（快速）

將原有 CSS 文件複製到 `assets/css/`：

```bash
cp ../frontend/assets/css/*.css assets/css/
```

在 `nuxt.config.ts` 中引入：

```typescript
export default defineNuxtConfig({
  css: [
    '~/assets/css/style.css',
    '~/assets/css/leaderboard.css',
    // ... 其他 CSS
  ]
})
```

### 策略 2：組件化（推薦，長期）

將樣式拆分到各個組件的 `<style scoped>` 中：

- 全域樣式 → `assets/css/global.css`
- 組件樣式 → 各組件的 `<style scoped>`

## 📦 資源文件遷移

### 圖片

```bash
cp -r ../frontend/assets/images/* public/images/
```

在組件中使用：

```vue
<img src="/images/heart.png" alt="愛心" />
```

### 音效

```bash
cp -r ../frontend/assets/audio/* public/audio/
```

使用 `useAudio` composable 播放。

## 🧪 測試遷移的功能

每遷移一個功能後，務必測試：

1. **功能測試**：點擊、動畫是否正常
2. **API 測試**：數據是否正確提交到後端
3. **狀態測試**：Store 是否正確更新
4. **視覺測試**：樣式是否與原版一致

## 💡 最佳實踐

### 1. 逐步遷移
不要一次性遷移所有功能，按優先級逐個遷移。

### 2. 保留舊版本
在新版本穩定前，保留舊版本作為備份。

### 3. 代碼審查
遷移後的代碼應該更清晰、更易維護。

### 4. 性能優化
利用 Vue 3 的響應式系統和 Nuxt 的優化特性。

## 🔍 常見問題

### Q: 如何在 Vue 組件中使用原有的全域變數？
A: 將全域變數遷移到 Pinia Store 中管理。

### Q: Matter.js 在 SSR 中報錯怎麼辦？
A: 使用 `onMounted` 確保只在客戶端執行：

```typescript
onMounted(() => {
  if (process.client) {
    // Matter.js 代碼
  }
})
```

### Q: 如何處理原有的 jQuery 代碼？
A: 用 Vue 的 `ref` 和原生 DOM API 替代 jQuery。

## 🎯 下一個里程碑

完成核心功能遷移後，可以考慮：

1. **性能優化**：使用 Vue 3 的 `<Suspense>`、懶加載等
2. **新功能**：添加原版沒有的功能（如離線支持、PWA）
3. **測試**：添加單元測試和 E2E 測試
4. **部署**：部署到 Vercel 並與用戶測試

## 📞 需要幫助？

遇到問題時，可以：
- 查看 [Nuxt 3 文檔](https://nuxt.com)
- 查看 [Vue 3 文檔](https://vuejs.org)
- 查看原始代碼的註解和文檔

祝遷移順利！🚀

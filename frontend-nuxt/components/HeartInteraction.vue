<template>
  <div class="heart-interaction-container">
    <!-- 主愛心 -->
    <div class="main-heart-wrapper">
      <div
        class="main-heart"
        :class="{
          beating: isBeating,
          glowing: gameStore.heartCount > 0
        }"
        @click="handleHeartClick"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
      >
        <div class="heart-icon">❤️</div>
        <div class="heart-particles" v-if="showParticles">
          <span v-for="i in 5" :key="i" class="particle">+1</span>
        </div>
      </div>

      <!-- 愛心計數器 -->
      <div class="heart-counter">
        <span class="count">{{ gameStore.heartCount }}</span>
        <span class="label">愛心</span>
      </div>
    </div>

    <!-- 物理引擎容器 -->
    <div
      ref="physicsContainer"
      class="physics-container"
      @click="handlePhysicsClick"
    ></div>

    <!-- 時段問候 -->
    <div class="greeting">
      {{ getGreeting() }}
    </div>
  </div>
</template>

<script setup lang="ts">
const gameStore = useGameStore()
const { playSound } = useAudio()
const { init: initPhysics, addHeart, cleanup, isInitialized } = useHeartPhysics()

const physicsContainer = ref<HTMLElement>()
const isBeating = ref(false)
const showParticles = ref(false)
const isHovering = ref(false)

// 初始化物理引擎
onMounted(() => {
  if (physicsContainer.value) {
    initPhysics(physicsContainer.value, {
      wireframes: false,
      gravity: 0.8
    })
  }

  // 更新時段
  gameStore.updateTimeOfDay()
})

// 處理愛心點擊
const handleHeartClick = () => {
  // 增加愛心計數
  gameStore.clickHeart(1)

  // 播放音效
  playSound('heart-click')

  // 觸發跳動動畫
  triggerBeat()

  // 顯示粒子效果
  showParticleEffect()

  // 添加掉落的愛心
  if (physicsContainer.value && isInitialized.value) {
    const rect = physicsContainer.value.getBoundingClientRect()
    const x = rect.width / 2 + (Math.random() - 0.5) * 100
    const y = 50

    addHeart(x, y, {
      size: 15 + Math.random() * 10,
      color: getRandomHeartColor(),
      velocity: {
        x: (Math.random() - 0.5) * 5,
        y: Math.random() * 2
      }
    })
  }

  // 震動反饋（如果支援）
  if (navigator.vibrate) {
    navigator.vibrate(50)
  }
}

// 處理物理容器點擊
const handlePhysicsClick = (event: MouseEvent) => {
  if (!physicsContainer.value || !isInitialized.value) return

  const rect = physicsContainer.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // 添加多個愛心
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      addHeart(x, y, {
        size: 10 + Math.random() * 15,
        color: getRandomHeartColor(),
        velocity: {
          x: (Math.random() - 0.5) * 8,
          y: -Math.random() * 5
        }
      })
    }, i * 50)
  }

  playSound('pop')
}

// 觸發跳動動畫
const triggerBeat = () => {
  isBeating.value = true
  setTimeout(() => {
    isBeating.value = false
  }, 300)
}

// 顯示粒子效果
const showParticleEffect = () => {
  showParticles.value = true
  setTimeout(() => {
    showParticles.value = false
  }, 600)
}

// 獲取隨機愛心顏色
const getRandomHeartColor = () => {
  const colors = [
    '#e91e63', // 粉紅
    '#f44336', // 紅色
    '#ff5722', // 深橙
    '#ff4081', // 粉紅A200
    '#ec407a'  // 粉紅400
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// 獲取時段問候
const getGreeting = () => {
  const greetings = {
    morning: ['早安！', '美好的早晨！', '新的一天開始了！', '早安，充滿活力！'],
    afternoon: ['午安！', '下午好！', '午後時光！', '下午愉快！'],
    evening: ['晚安！', '傍晚好！', '夕陽西下！', '夜幕降臨！'],
    night: ['晚上好！', '夜深了！', '星空閃耀！', '夜晚寧靜！']
  }

  const timeGreetings = greetings[gameStore.timeOfDay]
  return timeGreetings[Math.floor(Math.random() * timeGreetings.length)]
}

// 滑鼠進入
const onMouseEnter = () => {
  isHovering.value = true
}

// 滑鼠離開
const onMouseLeave = () => {
  isHovering.value = false
}

// 監聽視窗大小變化
const handleResize = () => {
  // 物理引擎會自動處理
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  cleanup()
})
</script>

<style scoped>
.heart-interaction-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-heart-wrapper {
  position: relative;
  z-index: 10;
  text-align: center;
  margin-bottom: 2rem;
}

.main-heart {
  position: relative;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.main-heart:hover {
  transform: scale(1.1);
}

.main-heart:active {
  transform: scale(0.95);
}

.heart-icon {
  font-size: 8rem;
  filter: drop-shadow(0 10px 30px rgba(233, 30, 99, 0.5));
  transition: filter 0.3s;
}

.main-heart.glowing .heart-icon {
  filter: drop-shadow(0 10px 50px rgba(233, 30, 99, 0.8));
  animation: glow 2s ease-in-out infinite;
}

.main-heart.beating .heart-icon {
  animation: beat 0.3s ease;
}

@keyframes beat {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.2);
  }
  50% {
    transform: scale(1.1);
  }
  75% {
    transform: scale(1.15);
  }
}

@keyframes glow {
  0%, 100% {
    filter: drop-shadow(0 10px 30px rgba(233, 30, 99, 0.5));
  }
  50% {
    filter: drop-shadow(0 10px 60px rgba(233, 30, 99, 1));
  }
}

.heart-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.particle {
  position: absolute;
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  animation: particle-rise 0.6s ease-out forwards;
}

.particle:nth-child(1) {
  animation-delay: 0s;
  left: -40px;
}

.particle:nth-child(2) {
  animation-delay: 0.1s;
  left: -20px;
}

.particle:nth-child(3) {
  animation-delay: 0.2s;
  left: 0;
}

.particle:nth-child(4) {
  animation-delay: 0.1s;
  left: 20px;
}

.particle:nth-child(5) {
  animation-delay: 0s;
  left: 40px;
}

@keyframes particle-rise {
  0% {
    opacity: 1;
    transform: translateY(0) scale(0.5);
  }
  100% {
    opacity: 0;
    transform: translateY(-100px) scale(1.2);
  }
}

.heart-counter {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.count {
  font-size: 3rem;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.label {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 2px;
}

.physics-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.greeting {
  position: absolute;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2rem;
  font-weight: 300;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 5;
  animation: fade-in 1s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .heart-icon {
    font-size: 6rem;
  }

  .count {
    font-size: 2rem;
  }

  .greeting {
    font-size: 1.5rem;
  }
}
</style>

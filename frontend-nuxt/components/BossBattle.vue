<template>
  <div v-if="gameStore.inBossBattle" class="boss-battle-container">
    <!-- Boss（月球） -->
    <div
      ref="bossElement"
      class="boss-moon"
      :class="{
        'berserk-mode': isBerserkMode,
        'frozen': isFrozen
      }"
      :style="bossStyle"
      @click="attackBoss"
    >
      <!-- Boss 血條 -->
      <div class="boss-hp-bar">
        <div class="hp-fill" :style="{ width: gameStore.bossHealthPercent + '%' }"></div>
        <div class="hp-text">
          {{ Math.ceil(gameStore.bossHealth) }} / {{ gameStore.maxBossHealth }}
        </div>
      </div>

      <!-- Boss 裂痕效果 -->
      <div class="boss-cracks" :style="cracksStyle"></div>
    </div>

    <!-- 軌跡粒子容器 -->
    <div ref="trailContainer" class="trail-container"></div>

    <!-- 血液粒子容器 -->
    <div ref="bloodContainer" class="blood-container"></div>

    <!-- Boss 狀態提示 -->
    <div class="boss-status">
      <div v-if="isBerserkMode" class="status-badge berserk">
        🔥 狂暴模式
      </div>
      <div v-if="isFrozen" class="status-badge frozen">
        ❄️ 停格中
      </div>
    </div>

    <!-- 勝利提示 -->
    <div v-if="isVictory" class="victory-overlay">
      <div class="victory-content">
        <h1 class="victory-title">🎉 勝利！</h1>
        <p class="victory-message">你擊敗了血月 Boss！</p>
        <p class="victory-reward">獲得 50 個愛心！</p>
        <button @click="closeBossBattle" class="victory-btn">
          返回主世界
        </button>
      </div>
    </div>
    <!-- 血月橫向閃過效果 -->
    <div
      v-if="isBloodMoonFlashing"
      class="blood-moon-flash"
      :class="{ 'second-wave': bloodMoonWave === 2 }"
    >
      <div class="blood-moon-image"></div>
    </div>

    <!-- 固定紅色軌跡（尖角處） -->
    <div class="sharp-corner-trail corner-top-left"></div>
    <div class="sharp-corner-trail corner-bottom-right"></div>
  </div>
</template>

<script setup lang="ts">
const gameStore = useGameStore()
const { playSound, playMusic, stopMusic } = useAudio()

const bossElement = ref<HTMLElement>()
const trailContainer = ref<HTMLElement>()
const bloodContainer = ref<HTMLElement>()

// Boss 狀態
const bossPosition = ref({ x: 0, y: 0 })
const targetPosition = ref({ x: 0, y: 0 })
const isBerserkMode = ref(false)
const isFrozen = ref(false)
const isVictory = ref(false)

// 血月閃過效果狀態
const isBloodMoonFlashing = ref(false)
const bloodMoonWave = ref(1)
let bloodMoonTimer: NodeJS.Timeout | null = null

// Boss 移動配置
const bossMovement = {
  speed: 2,
  berserkSpeed: 4,
  changeTargetInterval: 2000,
  berserkThreshold: 30 // 血量低於30%進入狂暴
}

let moveAnimationId: number | null = null
let targetChangeTimer: NodeJS.Timeout | null = null

// Boss 樣式
const bossStyle = computed(() => {
  const hpPercent = gameStore.bossHealthPercent

  // 顏色漸變（金黃 → 深紅）
  const hue = 45 - (45 - 0) * (1 - hpPercent / 100)
  const saturation = 50 + 50 * (1 - hpPercent / 100)
  const lightness = 80 - 30 * (1 - hpPercent / 100)

  // 震動效果
  const shakeIntensity = (1 - hpPercent / 100) * 5
  const shakeX = (Math.random() - 0.5) * shakeIntensity
  const shakeY = (Math.random() - 0.5) * shakeIntensity

  return {
    left: `${bossPosition.value.x}px`,
    top: `${bossPosition.value.y}px`,
    background: `radial-gradient(circle at 35% 35%,
      hsl(${hue}, ${saturation}%, ${lightness}%) 0%,
      hsl(${hue}, ${saturation - 10}%, ${lightness - 10}%) 30%,
      hsl(${hue}, ${saturation - 20}%, ${lightness - 20}%) 60%,
      hsl(${hue}, ${saturation - 30}%, ${lightness - 30}%) 100%)`,
    transform: `translate(${shakeX}px, ${shakeY}px)`
  }
})

// 裂痕樣式
const cracksStyle = computed(() => {
  const damage = 100 - gameStore.bossHealthPercent
  const crackOpacity = damage / 200 // 最多0.5透明度

  return {
    opacity: crackOpacity,
    boxShadow: `
      inset 0 0 ${damage}px rgba(0, 0, 0, 0.5),
      inset ${damage / 2}px 0 ${damage / 4}px rgba(139, 0, 0, 0.3),
      inset -${damage / 2}px 0 ${damage / 4}px rgba(139, 0, 0, 0.3)
    `
  }
})

// 初始化 Boss 位置
const initBossPosition = () => {
  const centerX = window.innerWidth / 2 - 75 // Boss 寬度150px的一半
  const centerY = window.innerHeight / 2 - 75

  bossPosition.value = { x: centerX, y: centerY }
  targetPosition.value = { x: centerX, y: centerY }

  // 播放月球背景音樂
  playMusic('moon-background-sound', true, 0.7)

  // 延遲一點觸發第一波血月閃過
  setTimeout(() => {
    triggerBloodMoonFlash()
  }, 3000)

  startMovement()
}

// 觸發血月閃過效果
const triggerBloodMoonFlash = () => {
  // 第一波
  bloodMoonWave.value = 1
  isBloodMoonFlashing.value = true
  playSound('scary-1')

  setTimeout(() => {
    isBloodMoonFlashing.value = false

    // 第二波
    setTimeout(() => {
      bloodMoonWave.value = 2
      isBloodMoonFlashing.value = true
      playSound('scary-2')

      setTimeout(() => {
        isBloodMoonFlashing.value = false

        // 定期觸發血月閃過（隨機間隔）
        const randomDelay = 15000 + Math.random() * 20000 // 15-35秒
        bloodMoonTimer = setTimeout(() => {
          triggerBloodMoonFlash()
        }, randomDelay)
      }, 800)
    }, 1500)
  }, 800)
}

// 開始移動
const startMovement = () => {
  changeTarget()
  targetChangeTimer = setInterval(() => {
    if (!isFrozen.value) {
      changeTarget()
    }
  }, bossMovement.changeTargetInterval)

  animateMovement()
}

// 改變目標位置
const changeTarget = () => {
  const padding = 150
  const maxX = window.innerWidth - padding
  const maxY = window.innerHeight - padding

  targetPosition.value = {
    x: padding + Math.random() * (maxX - padding),
    y: padding + Math.random() * (maxY - padding)
  }
}

// 動畫移動
const animateMovement = () => {
  if (isFrozen.value) {
    moveAnimationId = requestAnimationFrame(animateMovement)
    return
  }

  const dx = targetPosition.value.x - bossPosition.value.x
  const dy = targetPosition.value.y - bossPosition.value.y
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance > 5) {
    const speed = isBerserkMode.value ? bossMovement.berserkSpeed : bossMovement.speed
    const moveX = (dx / distance) * speed
    const moveY = (dy / distance) * speed

    bossPosition.value.x += moveX
    bossPosition.value.y += moveY

    // 生成軌跡
    createTrailParticle(bossPosition.value.x + 75, bossPosition.value.y + 75)
  }

  moveAnimationId = requestAnimationFrame(animateMovement)
}

// 創建軌跡粒子
const createTrailParticle = (x: number, y: number) => {
  if (!trailContainer.value) return

  const trail = document.createElement('div')
  trail.className = 'boss-trail-particle'
  trail.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: 20px;
    height: 20px;
    background: radial-gradient(circle, rgba(220, 0, 0, 0.8) 0%, rgba(139, 0, 0, 0.4) 50%, transparent 100%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    animation: trailFade 0.5s ease-out forwards;
  `

  trailContainer.value.appendChild(trail)

  setTimeout(() => {
    trail.remove()
  }, 500)
}

// 創建血液粒子
const createBloodParticles = (x: number, y: number, count = 20) => {
  if (!bloodContainer.value) return

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div')
    const angle = (Math.PI * 2 * i) / count
    const speed = 2 + Math.random() * 3
    const size = 4 + Math.random() * 8

    particle.className = 'blood-particle'
    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, #8b0000 0%, #dc0000 50%, #8b0000 100%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
    `

    bloodContainer.value.appendChild(particle)

    // 動畫
    let posX = x
    let posY = y
    let velocityX = Math.cos(angle) * speed
    let velocityY = Math.sin(angle) * speed
    let opacity = 1
    let life = 60 // 幀數

    const animate = () => {
      life--
      if (life <= 0) {
        particle.remove()
        return
      }

      velocityY += 0.2 // 重力
      posX += velocityX
      posY += velocityY
      opacity = life / 60

      particle.style.left = `${posX}px`
      particle.style.top = `${posY}px`
      particle.style.opacity = opacity.toString()

      requestAnimationFrame(animate)
    }

    animate()
  }
}

// 攻擊 Boss
const attackBoss = (event: MouseEvent) => {
  const damage = 5 + Math.floor(Math.random() * 5) // 5-10 傷害

  gameStore.attackBoss(damage)

  // 音效
  playSound('boss-hit')

  // 血液粒子
  createBloodParticles(event.clientX, event.clientY, 15)

  // 停格效果
  if (Math.random() < 0.3) { // 30% 機率
    freeze(200)
  }

  // 檢查狂暴模式
  if (gameStore.bossHealthPercent < bossMovement.berserkThreshold && !isBerserkMode.value) {
    enterBerserkMode()
  }

  // 檢查勝利
  if (gameStore.bossHealth <= 0) {
    victory()
  }
}

// 停格效果
const freeze = (duration: number) => {
  isFrozen.value = true
  setTimeout(() => {
    isFrozen.value = false
  }, duration)
}

// 進入狂暴模式
const enterBerserkMode = () => {
  isBerserkMode.value = true
  playSound('boss-berserk')

  // 視覺提示
  if (bossElement.value) {
    bossElement.value.style.animation = 'berserkPulse 0.5s ease-in-out 3'
  }
}

// 勝利
const victory = () => {
  isVictory.value = true
  playSound('victory')
  stopMusic() // 停止戰鬥音樂

  // 停止移動
  if (moveAnimationId) {
    cancelAnimationFrame(moveAnimationId)
  }
  if (targetChangeTimer) {
    clearInterval(targetChangeTimer)
  }
  if (bloodMoonTimer) {
    clearTimeout(bloodMoonTimer)
  }

  // 獎勵已在 gameStore.onBossDefeated() 中處理
}

// 關閉 Boss 戰鬥
const closeBossBattle = () => {
  isVictory.value = false
  stopMusic() // 確保停止音樂
  gameStore.exitMoonWorld()
}

// 初始化
onMounted(() => {
  if (gameStore.inBossBattle) {
    initBossPosition()
  }
})

// 監聽進入 Boss 戰鬥
watch(() => gameStore.inBossBattle, (newValue) => {
  if (newValue) {
    initBossPosition()
  } else {
    // 清理
    if (moveAnimationId) {
      cancelAnimationFrame(moveAnimationId)
    }
    if (targetChangeTimer) {
      clearInterval(targetChangeTimer)
    }
  }
})

// 清理
onUnmounted(() => {
  if (moveAnimationId) {
    cancelAnimationFrame(moveAnimationId)
  }
  if (targetChangeTimer) {
    clearInterval(targetChangeTimer)
  }
  if (bloodMoonTimer) {
    clearTimeout(bloodMoonTimer)
  }
  stopMusic()
})
</script>

<style scoped>
.boss-battle-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a0000 0%, #4a0000 50%, #1a0000 100%);
  z-index: 1000;
  overflow: hidden;
}

.boss-moon {
  position: fixed;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  cursor: crosshair;
  transition: filter 0.3s;
  box-shadow: 0 0 50px rgba(220, 0, 0, 0.8),
              0 0 100px rgba(139, 0, 0, 0.4);
  user-select: none;
}

.boss-moon:hover {
  filter: brightness(1.2);
}

.boss-moon.frozen {
  filter: grayscale(0.5) brightness(0.8);
}

.boss-moon.berserk-mode {
  animation: berserkPulse 1s ease-in-out infinite;
}

@keyframes berserkPulse {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.1);
    filter: brightness(1.5) saturate(2);
  }
}

.boss-hp-bar {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 20px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid #8b0000;
  border-radius: 10px;
  overflow: hidden;
}

.hp-fill {
  height: 100%;
  background: linear-gradient(90deg, #dc0000 0%, #8b0000 100%);
  transition: width 0.3s ease-out;
}

.hp-text {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.boss-cracks {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  pointer-events: none;
}

.trail-container,
.blood-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 999;
}

.boss-status {
  position: fixed;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  z-index: 1001;
}

.status-badge {
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: badgePulse 2s ease-in-out infinite;
}

.status-badge.berserk {
  background: linear-gradient(135deg, #ff4500 0%, #dc0000 100%);
}

.status-badge.frozen {
  background: linear-gradient(135deg, #4682b4 0%, #1e90ff 100%);
}

@keyframes badgePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.victory-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.5s ease-out;
}

.victory-content {
  text-align: center;
  color: #fff;
  animation: slideUp 0.5s ease-out;
}

.victory-title {
  font-size: 4rem;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px #ffd700;
  animation: victoryGlow 2s ease-in-out infinite;
}

.victory-message {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.victory-reward {
  font-size: 2rem;
  color: #ffd700;
  margin-bottom: 2rem;
}

.victory-btn {
  padding: 1rem 3rem;
  font-size: 1.2rem;
  font-weight: bold;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.5);
}

.victory-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 30px rgba(255, 215, 0, 0.7);
}

@keyframes victoryGlow {
  0%, 100% {
    text-shadow: 0 0 20px #ffd700;
  }
  50% {
    text-shadow: 0 0 40px #ffd700, 0 0 60px #ffd700;
  }
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

@keyframes trailFade {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.5);
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .boss-moon {
    width: 100px;
    height: 100px;
  }

  .boss-hp-bar {
    width: 150px;
    top: -25px;
  }

  .victory-title {
    font-size: 3rem;
  }

  .victory-message {
    font-size: 1.2rem;
  }

  .victory-reward {
    font-size: 1.5rem;
  }
}

/* 血月閃過效果 */
.blood-moon-flash {
  position: fixed;
  top: 0;
  left: -200%;
  width: 200%;
  height: 100%;
  z-index: 10001;
  pointer-events: none;
  animation: moonFlash 0.8s ease-out forwards;
}

.blood-moon-flash.second-wave {
  animation: moonFlashReverse 0.8s ease-out forwards;
}

.blood-moon-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  background: radial-gradient(circle at 30% 30%,
    rgba(139, 0, 0, 0.9) 0%,
    rgba(220, 0, 0, 0.8) 30%,
    rgba(139, 0, 0, 0.7) 60%,
    rgba(70, 0, 0, 0.6) 100%);
  border-radius: 50%;
  box-shadow: 0 0 100px rgba(220, 0, 0, 0.9),
              0 0 200px rgba(139, 0, 0, 0.7),
              inset 0 0 50px rgba(0, 0, 0, 0.5);
}

@keyframes moonFlash {
  0% {
    left: -200%;
  }
  100% {
    left: 100%;
  }
}

@keyframes moonFlashReverse {
  0% {
    left: 100%;
  }
  100% {
    left: -200%;
  }
}

/* 固定紅色軌跡（尖角處） */
.sharp-corner-trail {
  position: fixed;
  pointer-events: none;
  z-index: 998;
}

.corner-top-left {
  top: 50px;
  left: 50px;
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, transparent 40%, rgba(220, 0, 0, 0.3) 50%, transparent 60%);
  transform: rotate(45deg);
  animation: cornerPulse 3s ease-in-out infinite;
}

.corner-bottom-right {
  bottom: 50px;
  right: 50px;
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, transparent 40%, rgba(220, 0, 0, 0.3) 50%, transparent 60%);
  transform: rotate(45deg);
  animation: cornerPulse 3s ease-in-out infinite 1.5s;
}

@keyframes cornerPulse {
  0%, 100% {
    opacity: 0.3;
    transform: rotate(45deg) scale(1);
  }
  50% {
    opacity: 0.7;
    transform: rotate(45deg) scale(1.2);
  }
}

.corner-top-left::before,
.corner-bottom-right::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, rgba(220, 0, 0, 0.8) 0%, transparent 70%);
  border-radius: 50%;
  animation: trailGlow 2s ease-in-out infinite;
}

@keyframes trailGlow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(220, 0, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 30px rgba(220, 0, 0, 1);
  }
}
</style>

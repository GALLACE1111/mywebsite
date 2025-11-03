<template>
  <div class="character-guide">
    <!-- 動畫箭頭指示器 -->
    <div
      v-if="showArrow && !showGuide"
      class="animated-arrow"
      :style="arrowPosition"
    >
      <div class="arrow-pointer">👆</div>
      <div class="arrow-text">點擊查看操作指南</div>
    </div>

    <!-- 操作指南彈窗 -->
    <Teleport to="body">
      <div v-if="showGuide" class="guide-overlay" @click="closeGuide">
        <div class="guide-modal" @click.stop>
          <button class="close-btn" @click="closeGuide">✕</button>

          <h2 class="guide-title">🎮 遊戲操作指南</h2>

          <div class="guide-sections">
            <!-- 基本操作 -->
            <div class="guide-section">
              <h3>❤️ 基本操作</h3>
              <ul>
                <li>點擊中央愛心：收集愛心點數</li>
                <li>連續點擊：觸發連擊效果</li>
                <li>點擊掉落愛心：額外加分</li>
              </ul>
            </div>

            <!-- 月球世界 -->
            <div class="guide-section">
              <h3>🌙 月球世界</h3>
              <ul>
                <li>點擊月球圖標進入月球世界</li>
                <li>與血月Boss戰鬥</li>
                <li>擊敗Boss獲得豐厚獎勵</li>
                <li>注意躲避紅色月亮攻擊！</li>
              </ul>
            </div>

            <!-- 特殊功能 -->
            <div class="guide-section">
              <h3>⭐ 特殊功能</h3>
              <ul>
                <li>排行榜：查看全球玩家排名</li>
                <li>許願池：發表願望與互動</li>
                <li>個人資料：自定義頭像和名稱</li>
              </ul>
            </div>

            <!-- 戰鬥技巧 -->
            <div class="guide-section">
              <h3>⚔️ 戰鬥技巧</h3>
              <ul>
                <li>快速點擊Boss造成傷害</li>
                <li>Boss血量低於30%會進入狂暴</li>
                <li>留意紅色軌跡和血月閃過</li>
                <li>善用停格效果規劃攻擊</li>
              </ul>
            </div>

            <!-- 萬聖節彩蛋 -->
            <div class="guide-section halloween-section">
              <h3>🎃 萬聖節特別活動</h3>
              <ul>
                <li>限定南瓜裝飾</li>
                <li>特殊音效和視覺效果</li>
                <li>節日期間額外獎勵</li>
              </ul>
            </div>
          </div>

          <div class="guide-footer">
            <p>💡 提示：享受遊戲，祝你好運！</p>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 萬聖節南瓜圖標 -->
    <div
      v-if="isHalloween"
      class="halloween-pumpkin"
      @click="triggerHalloweenEffect"
    >
      🎃
    </div>
  </div>
</template>

<script setup lang="ts">
const { playSound } = useAudio()

const props = defineProps<{
  targetElement?: HTMLElement
}>()

const emit = defineEmits<{
  open: []
  close: []
}>()

const showGuide = ref(false)
const showArrow = ref(true)
const arrowPosition = ref({ top: '0px', left: '0px' })

// 檢查是否為萬聖節期間（10月25日到11月5日）
const isHalloween = computed(() => {
  const today = new Date()
  const month = today.getMonth() + 1
  const day = today.getDate()
  return (month === 10 && day >= 25) || (month === 11 && day <= 5)
})

// 計算箭頭位置
const updateArrowPosition = () => {
  if (props.targetElement) {
    const rect = props.targetElement.getBoundingClientRect()
    arrowPosition.value = {
      top: `${rect.top - 60}px`,
      left: `${rect.left + rect.width / 2 - 30}px`
    }
  }
}

// 打開操作指南
const openGuide = () => {
  showGuide.value = true
  showArrow.value = false
  playSound('dialogue')
  emit('open')
}

// 關閉操作指南
const closeGuide = () => {
  showGuide.value = false
  setTimeout(() => {
    showArrow.value = true
  }, 2000)
  emit('close')
}

// 萬聖節效果
const triggerHalloweenEffect = () => {
  playSound('scary-1')

  // 創建南瓜粒子效果
  for (let i = 0; i < 10; i++) {
    createPumpkinParticle()
  }
}

// 創建南瓜粒子
const createPumpkinParticle = () => {
  const particle = document.createElement('div')
  particle.className = 'pumpkin-particle'
  particle.textContent = '🎃'
  particle.style.cssText = `
    position: fixed;
    left: ${Math.random() * window.innerWidth}px;
    top: ${window.innerHeight}px;
    font-size: ${20 + Math.random() * 20}px;
    z-index: 9999;
    pointer-events: none;
    animation: pumpkinFloat 3s ease-out forwards;
  `
  document.body.appendChild(particle)

  setTimeout(() => {
    particle.remove()
  }, 3000)
}

// 監聽目標元素變化
watch(() => props.targetElement, () => {
  updateArrowPosition()
})

// 初始化
onMounted(() => {
  updateArrowPosition()

  // 定期更新箭頭位置（防止視窗調整）
  const interval = setInterval(() => {
    if (showArrow.value) {
      updateArrowPosition()
    }
  }, 1000)

  // 自動顯示箭頭（首次進入）
  const hasSeenGuide = localStorage.getItem('hasSeenGuide')
  if (!hasSeenGuide) {
    setTimeout(() => {
      showArrow.value = true
    }, 3000)
  }

  onUnmounted(() => {
    clearInterval(interval)
  })
})

// 暴露方法給父組件
defineExpose({
  openGuide,
  closeGuide
})
</script>

<style scoped>
.character-guide {
  position: relative;
}

/* 動畫箭頭指示器 */
.animated-arrow {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
  animation: arrowBounce 2s ease-in-out infinite;
}

.arrow-pointer {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  animation: arrowPulse 1s ease-in-out infinite;
}

.arrow-text {
  margin-top: -10px;
  padding: 0.25rem 0.5rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  text-align: center;
}

@keyframes arrowBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes arrowPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

/* 操作指南彈窗 */
.guide-overlay {
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
  animation: fadeIn 0.3s ease-out;
}

.guide-modal {
  position: relative;
  max-width: 800px;
  max-height: 90vh;
  width: 90%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 2rem;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease-out;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.guide-title {
  color: white;
  text-align: center;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.guide-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.guide-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  backdrop-filter: blur(10px);
}

.guide-section h3 {
  color: white;
  font-size: 1.2rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.guide-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.guide-section li {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;
}

.guide-section li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #ffd700;
}

.halloween-section {
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  border: 2px solid #ff6b35;
  animation: halloweenGlow 2s ease-in-out infinite;
}

@keyframes halloweenGlow {
  0%, 100% {
    box-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 107, 53, 0.8);
  }
}

.guide-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.guide-footer p {
  color: white;
  font-size: 1.1rem;
}

/* 萬聖節南瓜圖標 */
.halloween-pumpkin {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  font-size: 3rem;
  cursor: pointer;
  animation: pumpkinBounce 2s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(255, 107, 53, 0.5));
  z-index: 100;
  transition: transform 0.3s;
}

.halloween-pumpkin:hover {
  transform: scale(1.2) rotate(10deg);
}

@keyframes pumpkinBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pumpkinFloat {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(-200px) rotate(360deg);
    opacity: 0;
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

/* 響應式設計 */
@media (max-width: 768px) {
  .guide-modal {
    padding: 1.5rem;
  }

  .guide-title {
    font-size: 1.5rem;
  }

  .guide-sections {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .halloween-pumpkin {
    bottom: 1rem;
    right: 1rem;
    font-size: 2.5rem;
  }
}
</style>
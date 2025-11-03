<template>
  <Teleport to="body">
    <div v-if="gameStore.inMoonWorld && !gameStore.inBossBattle" class="moon-world-overlay">
      <!-- 月球背景 -->
      <div class="moon-world-bg"></div>

      <!-- 月球表面 -->
      <div class="moon-surface">
        <!-- 對話框 -->
        <div class="dialogue-box" :class="{ show: showDialogue }">
          <div class="dialogue-content">
            <p class="dialogue-text">{{ currentDialogue }}</p>
            <button @click="handleDialogueAction" class="dialogue-btn">
              {{ dialogueButtonText }}
            </button>
          </div>
        </div>

        <!-- 月球裝飾元素 -->
        <div class="moon-crater crater-1"></div>
        <div class="moon-crater crater-2"></div>
        <div class="moon-crater crater-3"></div>

        <!-- 星星 -->
        <div v-for="i in 50" :key="i" class="star" :style="getStarStyle(i)"></div>
      </div>

      <!-- 關閉按鈕 -->
      <button @click="exitMoonWorld" class="exit-btn">
        ✕ 返回地球
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const gameStore = useGameStore()
const { playSound, playMusic, stopMusic } = useAudio()

const showDialogue = ref(false)
const currentDialogue = ref('')
const dialogueIndex = ref(0)

// 對話內容（從舊代碼遷移）
const dialogues = [
  '歡迎來到月球世界！這裡充滿了神秘的能量...',
  '傳說中，月球深處藏著一個強大的守護者。',
  '只有勇敢的冒險者才能挑戰它！',
  '你準備好面對血月 Boss 了嗎？',
  '擊敗它，你將獲得豐厚的獎勵！',
  '但要小心，它非常強大...',
  '當它的血量降低時，會進入狂暴狀態！',
  '你確定要開始挑戰嗎？'
]

const dialogueButtonText = computed(() => {
  if (dialogueIndex.value < dialogues.length - 1) {
    return '繼續'
  } else {
    return '開始挑戰！'
  }
})

// 初始化對話
const initDialogue = () => {
  dialogueIndex.value = 0
  currentDialogue.value = dialogues[0]
  showDialogue.value = true
  playSound('dialogue')
}

// 處理對話動作
const handleDialogueAction = () => {
  if (dialogueIndex.value < dialogues.length - 1) {
    // 下一段對話
    dialogueIndex.value++
    currentDialogue.value = dialogues[dialogueIndex.value]
    playSound('dialogue')
  } else {
    // 開始 Boss 戰鬥
    startBossBattle()
  }
}

// 開始 Boss 戰鬥
const startBossBattle = () => {
  showDialogue.value = false
  stopMusic() // 停止月球背景音樂
  gameStore.initBoss()
  // Boss戰鬥音效會在BossBattle組件中播放
}

// 退出月球世界
const exitMoonWorld = () => {
  stopMusic() // 停止月球背景音樂
  gameStore.exitMoonWorld()
  playSound('teleport')
}

// 生成星星樣式
const getStarStyle = (index: number) => {
  const x = Math.random() * 100
  const y = Math.random() * 100
  const size = 1 + Math.random() * 3
  const duration = 2 + Math.random() * 3
  const delay = Math.random() * 5

  return {
    left: `${x}%`,
    top: `${y}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`
  }
}

// 監聽進入月球世界
watch(() => gameStore.inMoonWorld, (newValue) => {
  if (newValue && !gameStore.inBossBattle) {
    // 播放進入月球的開場音效
    playSound('moon-start')

    // 延遲播放月球背景音樂（讓開場音效先播放）
    setTimeout(() => {
      playMusic('moon-background-sound', true, 0.5) // 循環播放，音量50%
    }, 2000)

    setTimeout(() => {
      initDialogue()
    }, 500)
  } else if (!newValue) {
    // 離開月球世界時停止音樂
    stopMusic()
  }
})

// 初始化
onMounted(() => {
  if (gameStore.inMoonWorld && !gameStore.inBossBattle) {
    // 播放進入月球的開場音效
    playSound('moon-start')

    // 延遲播放月球背景音樂（讓開場音效先播放）
    setTimeout(() => {
      playMusic('moon-background-sound', true, 0.5) // 循環播放，音量50%
    }, 2000)

    setTimeout(() => {
      initDialogue()
    }, 500)
  }
})

// 清理
onUnmounted(() => {
  stopMusic()
})
</script>

<style scoped>
.moon-world-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  overflow: hidden;
}

.moon-world-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #000428 0%, #004e92 100%);
  animation: bgPulse 10s ease-in-out infinite;
}

@keyframes bgPulse {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.2);
  }
}

.moon-surface {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialogue-box {
  position: relative;
  max-width: 600px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
  opacity: 0;
  transform: translateY(50px) scale(0.9);
  transition: all 0.5s ease-out;
  z-index: 10;
}

.dialogue-box.show {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.dialogue-content {
  text-align: center;
}

.dialogue-text {
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  animation: textFadeIn 0.5s ease-out;
}

@keyframes textFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dialogue-btn {
  padding: 1rem 3rem;
  font-size: 1.1rem;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.dialogue-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
}

.moon-crater {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(100, 100, 100, 0.3), rgba(50, 50, 50, 0.5));
  box-shadow: inset -5px -5px 20px rgba(0, 0, 0, 0.4);
}

.crater-1 {
  width: 150px;
  height: 150px;
  top: 20%;
  left: 15%;
  animation: craterFloat 8s ease-in-out infinite;
}

.crater-2 {
  width: 100px;
  height: 100px;
  top: 60%;
  right: 20%;
  animation: craterFloat 6s ease-in-out infinite 1s;
}

.crater-3 {
  width: 80px;
  height: 80px;
  bottom: 25%;
  left: 30%;
  animation: craterFloat 7s ease-in-out infinite 2s;
}

@keyframes craterFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  animation: starTwinkle 3s ease-in-out infinite;
}

@keyframes starTwinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.exit-btn {
  position: absolute;
  top: 2rem;
  right: 2rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 100;
}

.exit-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .dialogue-box {
    max-width: 90%;
    padding: 1.5rem;
  }

  .dialogue-text {
    font-size: 1.1rem;
  }

  .dialogue-btn {
    padding: 0.75rem 2rem;
    font-size: 1rem;
  }

  .exit-btn {
    top: 1rem;
    right: 1rem;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .moon-crater {
    display: none;
  }
}
</style>

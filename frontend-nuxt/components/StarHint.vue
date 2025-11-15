<!--
  星星發射器提示組件
  參考：frontend/index.html:63, frontend/assets/css/style.css:508-557
  參考：frontend/assets/js/script.js:1047-1070
  位置：下方中央（bottom: 40px; left: 50%）
  功能：顯示星星發射器提示，點擊後觸發戰鬥系統
  隱藏條件：進入月球世界時
-->

<template>
  <div>
    <!-- 星星發射器提示 -->
    <div
      v-if="!gameStore.inMoonWorld"
      class="hint-text"
      @click="handleClick"
    >
      星星發射器 ✨
    </div>

    <!-- 戰鬥確認對話框 -->
    <BattleDialog
      v-model="showBattleDialog"
      @confirm="handleBattleConfirm"
      @cancel="handleBattleCancel"
    />
  </div>
</template>

<script setup lang="ts">
const gameStore = useGameStore()
const { playSound } = useAudio()

// Inject shootStars 方法（由 game.vue provide）
const shootStars = inject<() => void>('shootStars')

// 戰鬥確認對話框顯示狀態
const showBattleDialog = ref(false)

/**
 * 處理點擊事件
 * 參考：frontend/assets/js/script.js:1048-1070
 * 邏輯：
 * - 如果已經開始過 Boss 戰 → 直接發射星星
 * - 如果未開始過 Boss 戰 → 顯示確認對話框
 */
const handleClick = (e: MouseEvent) => {
  e.stopPropagation() // 防止事件冒泡（避免觸發愛心系統）

  // 視覺反饋：放大動畫
  const target = e.currentTarget as HTMLElement
  if (target) {
    target.style.transform = 'translate3d(-50%, 0, 0) scale(1.15)'
    setTimeout(() => {
      target.style.transform = 'translate3d(-50%, 0, 0)'
    }, 200)
  }

  // 如果已經開始過 Boss 戰，直接發射星星
  if (gameStore.bossBattleStarted) {
    // 播放發射音效
    playSound('shoot')

    // 發射星星
    if (shootStars) {
      shootStars()
    } else {
      console.error('❌ shootStars 方法未找到！')
    }
  } else {
    // 第一次點擊，播放按鈕音效並顯示確認對話框
    playSound('button-click')
    showBattleDialog.value = true
  }
}

/**
 * 處理戰鬥確認
 * 參考：frontend/assets/js/script.js:1112-1116
 */
const handleBattleConfirm = () => {
  // 開始 Boss 戰鬥
  gameStore.startBossBattle()

  // 播放發射音效
  playSound('shoot')

  // 發射星星
  if (shootStars) {
    shootStars()
  } else {
    console.error('❌ shootStars 方法未找到！')
  }

  console.log('⚔️ Boss 戰鬥開始！')
}

/**
 * 處理戰鬥取消
 */
const handleBattleCancel = () => {
  console.log('🛡️ 取消戰鬥')
}
</script>

<style scoped>
/* 星星發射器提示（下方中央） */
/* 參考：frontend/assets/css/style.css:508-557 */

.hint-text {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translate3d(-50%, 0, 0); /* 使用 translate3d 觸發硬體加速 */
  background: rgba(205, 170, 125, 0.9); /* 土色 #CDAA7D */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 20px 40px;
  border-radius: 30px;
  font-size: 22px;
  color: #2c2416; /* 深棕色文字 */
  font-weight: 700;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  z-index: 1000;
  border: 3px solid rgba(139, 115, 85, 0.6);
  transition: all 0.3s ease;
  user-select: none;
  /* 文字渲染優化 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  will-change: transform;
  backface-visibility: hidden;
  transform-style: preserve-3d;
}

.hint-text:hover {
  transform: translate3d(-50%, 0, 0) scale(1.05);
  background: rgba(205, 170, 125, 1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  border-color: rgba(139, 115, 85, 0.8);
}

.hint-text:active {
  transform: translate3d(-50%, 0, 0) scale(0.98);
}
</style>

<!--
  ⚠️ 手機版響應式：永久關閉
  - 不要添加 @media 查詢
  - 不要添加 body.mobile-mode 樣式
  - 手機用戶會看到維護中頁面
-->
<template>
  <!-- 進入月球確認對話框 -->
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="isVisible" class="battle-dialog moon-confirm-dialog mystery-theme show">
        <div class="battle-dialog-content">
          <!-- 標題 -->
          <h2 class="battle-title">{{ currentVariant.title }}</h2>

          <!-- 訊息 -->
          <p class="dialog-message">{{ currentVariant.message1 }}</p>
          <p class="dialog-message">{{ currentVariant.message2 }}</p>

          <!-- 按鈕組 -->
          <div class="battle-buttons">
            <!-- 取消按鈕 -->
            <button class="battle-btn battle-cancel" @click="handleCancel">
              <span>{{ currentVariant.cancelText }}</span>
            </button>

            <!-- 確認按鈕 -->
            <button class="battle-btn battle-confirm" @click="handleConfirm">
              <span>{{ currentVariant.confirmText }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

/**
 * MoonDialog 組件 - 進入月球確認對話框
 *
 * 功能說明：
 * - 8 種隨機文案變體
 * - 藍色未知風格主題
 * - 確認/取消按鈕
 * - 淡入淡出動畫
 *
 * 文案風格：
 * - 虛空裂痕、星際迴廊、次元門扉、意識之海
 * - 靈魂共鳴、宇宙裂隙、靜謐星域、晶體共振
 *
 * 互動功能：
 * - 點擊確認：進入月球世界
 * - 點擊取消：關閉對話框
 * - 淡入淡出過渡動畫
 *
 * 參考來源：
 * - JS 文案: frontend/assets/js/script.js 第 38-95 行
 * - JS 對話框: frontend/assets/js/script.js showMoonConfirmDialog() 函數（第 98-147 行）
 * - CSS: frontend/assets/css/style.css（第 1697-1803 行）
 */

// 定義文案變體類型
interface MoonDialogVariant {
  title: string
  message1: string
  message2: string
  cancelText: string
  confirmText: string
}

// 定義 Emits
const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm'): void
}>()

// 8 種文案變體（完全參照 frontend/assets/js/script.js 第 38-95 行）
const moonDialogVariants: MoonDialogVariant[] = [
  {
    title: '🌀 虛空裂痕',
    message1: '時空在此處扭曲',
    message2: '前方是寂靜的深淵',
    cancelText: '駐足觀望',
    confirmText: '踏入虛無'
  },
  {
    title: '💫 星際迴廊',
    message1: '銀河的盡頭在呼喚',
    message2: '無盡的星海在等待',
    cancelText: '留在此岸',
    confirmText: '跨越星河'
  },
  {
    title: '🔮 次元門扉',
    message1: '另一個世界的碎片浮現',
    message2: '真實與幻象的交界處',
    cancelText: '保持清醒',
    confirmText: '擁抱幻夢'
  },
  {
    title: '🌊 意識之海',
    message1: '思緒化作漣漪擴散',
    message2: '潛入更深的自我',
    cancelText: '浮於表面',
    confirmText: '深入潛行'
  },
  {
    title: '✨ 靈魂共鳴',
    message1: '聽見來自遠方的低語',
    message2: '靈魂在此處產生迴響',
    cancelText: '閉上耳朵',
    confirmText: '傾聽呼喚'
  },
  {
    title: '🌌 宇宙裂隙',
    message1: '現實的邊界正在消融',
    message2: '未知的維度向你敞開',
    cancelText: '守護現實',
    confirmText: '擁抱未知'
  },
  {
    title: '🪐 靜謐星域',
    message1: '時間在這裡失去意義',
    message2: '永恆與瞬間交織',
    cancelText: '回到時間',
    confirmText: '超越時間'
  },
  {
    title: '🔷 晶體共振',
    message1: '能量在空氣中震動',
    message2: '頻率逐漸同調',
    cancelText: '斷開連結',
    confirmText: '融入頻率'
  }
]

// 對話框顯示狀態
const isVisible = ref<boolean>(false)

// 當前使用的文案變體
const currentVariant = ref<MoonDialogVariant>(moonDialogVariants[0])

/**
 * 顯示對話框
 * 隨機選擇一個文案變體
 */
function show(): void {
  // 隨機選擇文案（參照 script.js 第 100 行）
  const randomIndex = Math.floor(Math.random() * moonDialogVariants.length)
  currentVariant.value = moonDialogVariants[randomIndex]

  console.log('🌙 顯示月球對話框，文案:', currentVariant.value.title)

  // 顯示對話框
  isVisible.value = true
}

/**
 * 隱藏對話框
 */
function hide(): void {
  isVisible.value = false
}

/**
 * 處理取消按鈕點擊
 * 參照 frontend/assets/js/script.js 第 127-134 行
 */
function handleCancel(): void {
  console.log('🚫 取消進入月球世界')

  // TODO: 播放按鈕音效
  // triggerButtonFeedback()

  // 隱藏對話框
  hide()

  // 觸發取消事件
  emit('cancel')
}

/**
 * 處理確認按鈕點擊
 * 參照 frontend/assets/js/script.js 第 137-146 行
 */
function handleConfirm(): void {
  console.log('✅ 確認進入月球世界')

  // TODO: 播放按鈕音效
  // triggerButtonFeedback()

  // 隱藏對話框
  hide()

  // 觸發確認事件
  emit('confirm')

  // TODO: 執行進入月球的實際邏輯
  // proceedToMoonWorld()
}

// 暴露方法給父組件調用
defineExpose({
  show,
  hide
})
</script>

<style scoped>
/**
 * 月球對話框樣式
 * 完全參照 frontend/assets/css/style.css 第 1697-1803 行
 * ⚠️ 已移除所有手機版響應式設計
 */

/* ===== 對話框背景遮罩 ===== */
.battle-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 10, 30, 0.85); /* 藍色未知風格 */
  backdrop-filter: blur(12px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 10vh; /* 往下偏移一點點 */
}

/* ===== 對話框內容區域 ===== */
.battle-dialog-content {
  background: linear-gradient(135deg, rgba(13, 71, 161, 0.95), rgba(21, 101, 192, 0.95), rgba(25, 118, 210, 0.9));
  padding: 40px 50px;
  border-radius: 30px;
  box-shadow:
    0 20px 60px rgba(33, 150, 243, 0.4),
    0 0 40px rgba(21, 101, 192, 0.3),
    inset 0 0 60px rgba(100, 181, 246, 0.1);
  text-align: center;
  border: 3px solid rgba(100, 181, 246, 0.4);
  max-width: 90%;
  animation: mysteryGlow 3s ease-in-out infinite;
}

/* 神秘發光動畫 */
@keyframes mysteryGlow {
  0%, 100% {
    box-shadow:
      0 20px 60px rgba(33, 150, 243, 0.4),
      0 0 40px rgba(21, 101, 192, 0.3),
      inset 0 0 60px rgba(100, 181, 246, 0.1);
  }
  50% {
    box-shadow:
      0 25px 70px rgba(33, 150, 243, 0.6),
      0 0 50px rgba(21, 101, 192, 0.5),
      inset 0 0 80px rgba(100, 181, 246, 0.2);
  }
}

/* ===== 標題 ===== */
.battle-title {
  font-size: 32px;
  font-weight: 700;
  color: #e3f2fd;
  margin-bottom: 25px;
  text-shadow:
    0 0 10px rgba(100, 181, 246, 0.8),
    0 0 20px rgba(33, 150, 243, 0.6),
    0 4px 8px rgba(0, 0, 0, 0.5);
  letter-spacing: 2px;
  animation: mysteryTitlePulse 2s ease-in-out infinite;
}

/* 標題脈動動畫 */
@keyframes mysteryTitlePulse {
  0%, 100% {
    text-shadow:
      0 0 10px rgba(100, 181, 246, 0.8),
      0 0 20px rgba(33, 150, 243, 0.6),
      0 4px 8px rgba(0, 0, 0, 0.5);
  }
  50% {
    text-shadow:
      0 0 15px rgba(100, 181, 246, 1),
      0 0 30px rgba(33, 150, 243, 0.8),
      0 4px 8px rgba(0, 0, 0, 0.5);
  }
}

/* ===== 訊息文字 ===== */
.dialog-message {
  font-size: 20px;
  font-weight: 600;
  color: #bbdefb;
  margin: 15px 0;
  line-height: 1.6;
  text-shadow:
    0 2px 4px rgba(0, 0, 0, 0.5),
    0 0 10px rgba(100, 181, 246, 0.3);
  letter-spacing: 1px;
}

/* ===== 按鈕組 ===== */
.battle-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 30px;
}

/* ===== 按鈕基礎樣式 ===== */
.battle-btn {
  padding: 16px 40px;
  font-size: 20px;
  font-weight: 700;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
  user-select: none;
  color: white;
}

/* 取消按鈕 - 灰藍色 */
.battle-cancel {
  background: linear-gradient(135deg, #607d8b, #455a64);
}

.battle-cancel:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 12px 30px rgba(96, 125, 139, 0.5);
}

/* 確認按鈕 - 亮藍色 */
.battle-confirm {
  background: linear-gradient(135deg, #2196f3, #1976d2);
}

.battle-confirm:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 12px 30px rgba(33, 150, 243, 0.5);
}

/* 按鈕按下效果 */
.battle-btn:active {
  transform: translateY(-1px) scale(1);
}

/* ===== 對話框淡入淡出動畫 ===== */
.dialog-fade-enter-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-to,
.dialog-fade-leave-from {
  opacity: 1;
}
</style>

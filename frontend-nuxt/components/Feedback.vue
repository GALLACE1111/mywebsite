<template>
  <div v-if="isOpen" class="feedback-modal">
    <div class="modal-overlay" @click="close"></div>

    <div class="modal-content">
      <button class="close-btn" @click="close">✕</button>

      <h2 class="title">📝 意見回饋 📝</h2>
      <p class="subtitle">分享你的想法，幫助我們變得更好！</p>

      <!-- 回饋表單 -->
      <div class="feedback-form">
        <!-- 類型選擇 -->
        <div class="form-group">
          <label for="feedback-category" class="label">回饋類型</label>
          <select id="feedback-category" v-model="feedbackCategory" class="category-select">
            <option value="bug">🐛 Bug 回報</option>
            <option value="feature">💡 功能建議</option>
            <option value="combat">⚔️ 戰鬥相關</option>
            <option value="other">📌 其他意見</option>
          </select>
        </div>

        <!-- 訊息輸入 -->
        <div class="form-group">
          <label for="feedback-message" class="label">你的意見</label>
          <textarea
            id="feedback-message"
            v-model="feedbackMessage"
            class="message-textarea"
            placeholder="請分享你的想法、建議或遇到的問題...

例如：
- 發現了什麼 Bug
- 希望新增的功能
- 戰鬥平衡性建議
- 任何讓網站更好的想法"
            maxlength="500"
            rows="6"
          ></textarea>
          <div class="char-count">
            {{ feedbackMessage.length }} / 500 字
          </div>
        </div>

        <!-- 提交按鈕 -->
        <button
          @click="submitFeedback"
          class="submit-btn"
          :disabled="!canSubmit || submitting"
        >
          {{ submitting ? '送出中...' : '送出回饋 ✨' }}
        </button>
      </div>

      <!-- 回饋記錄 -->
      <div class="history-section">
        <h3 class="history-title">📋 你的回饋記錄</h3>

        <div v-if="loadingHistory" class="loading">
          <div class="spinner"></div>
          <p>載入中...</p>
        </div>

        <div v-else-if="feedbackHistory.length === 0" class="no-history">
          <p>你還沒有提交過任何回饋！</p>
        </div>

        <div v-else class="history-list">
          <div
            v-for="item in feedbackHistory.slice(0, 10)"
            :key="item.id"
            class="history-item"
          >
            <div class="item-header">
              <span class="item-category">{{ getCategoryName(item.category) }}</span>
              <span class="item-date">{{ formatDate(item.created_at) }}</span>
            </div>
            <div class="item-message">{{ item.message }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const gameStore = useGameStore()
const { playSound } = useAudio()
const { submitFeedback: submitFeedbackAPI, getMyFeedback } = useAPI()

interface FeedbackItem {
  id: string
  category: string
  message: string
  created_at: string
  status?: string
}

const isOpen = ref(false)
const feedbackCategory = ref('bug')
const feedbackMessage = ref('')
const submitting = ref(false)
const loadingHistory = ref(false)
const feedbackHistory = ref<FeedbackItem[]>([])

const canSubmit = computed(() => {
  return feedbackMessage.value.trim().length >= 10
})

// 打開回饋面板
const open = () => {
  isOpen.value = true
  loadHistory()
  playSound('open-modal')
}

// 關閉回饋面板
const close = () => {
  isOpen.value = false
  feedbackMessage.value = ''
  feedbackCategory.value = 'bug'
}

// 提交回饋
const submitFeedback = async () => {
  if (!canSubmit.value || submitting.value) return

  submitting.value = true

  try {
    const response = await submitFeedbackAPI({
      player_id: gameStore.playerId,
      username: gameStore.username,
      category: feedbackCategory.value as 'bug' | 'feature' | 'combat' | 'other',
      message: feedbackMessage.value.trim()
    })

    if (response.success) {
      playSound('success')
      alert('感謝你的回饋！我們會仔細閱讀並努力改進！💝')

      // 重置表單
      feedbackMessage.value = ''
      feedbackCategory.value = 'bug'

      // 重新載入歷史記錄
      await loadHistory()
    } else {
      alert('提交失敗，請稍後再試')
    }
  } catch (error: any) {
    console.error('提交回饋失敗:', error)
    alert(error.data?.error || '提交失敗，請稍後再試')
  } finally {
    submitting.value = false
  }
}

// 載入回饋記錄
const loadHistory = async () => {
  loadingHistory.value = true

  try {
    const response = await getMyFeedback(gameStore.playerId, 10)

    if (response.success) {
      feedbackHistory.value = response.feedback
    } else {
      feedbackHistory.value = []
    }
  } catch (error) {
    console.error('載入回饋記錄失敗:', error)
    // 如果 API 失敗，顯示空列表
    feedbackHistory.value = []
  } finally {
    loadingHistory.value = false
  }
}

// 取得類型名稱
const getCategoryName = (category: string): string => {
  const names: Record<string, string> = {
    bug: '🐛 Bug 回報',
    feature: '💡 功能建議',
    combat: '⚔️ 戰鬥相關',
    other: '📌 其他意見'
  }
  return names[category] || category
}

// 格式化日期
const formatDate = (isoString: string): string => {
  const date = new Date(isoString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '剛剛'
  if (minutes < 60) return `${minutes} 分鐘前`
  if (hours < 24) return `${hours} 小時前`
  if (days < 7) return `${days} 天前`

  return date.toLocaleDateString('zh-TW')
}

// 暴露給父組件
defineExpose({
  open,
  close
})
</script>

<style scoped>
.feedback-modal {
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
}

.modal-content {
  position: relative;
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
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

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.feedback-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.category-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #ddd;
  border-radius: 12px;
  font-size: 1rem;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.category-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.message-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.3s;
}

.message-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.char-count {
  text-align: right;
  color: #999;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.history-section {
  border-top: 2px solid #f0f0f0;
  padding-top: 2rem;
}

.history-title {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #333;
}

.loading,
.no-history {
  text-align: center;
  padding: 2rem;
  color: #999;
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

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 12px;
  border-left: 4px solid #667eea;
  transition: all 0.2s;
}

.history-item:hover {
  background: #f0f1f3;
  transform: translateX(5px);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.item-category {
  font-weight: 600;
  color: #667eea;
  font-size: 0.9rem;
}

.item-date {
  font-size: 0.85rem;
  color: #999;
}

.item-message {
  color: #555;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    padding: 1.5rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.85rem;
  }

  .history-list {
    max-height: 250px;
  }
}
</style>

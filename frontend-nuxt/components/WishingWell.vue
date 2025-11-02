<template>
  <div v-if="isOpen" class="wishing-well-modal">
    <div class="modal-overlay" @click="close"></div>

    <div class="modal-content">
      <button class="close-btn" @click="close">✕</button>

      <h2 class="title">🌟 許願池 🌟</h2>
      <p class="subtitle">在這裡許下你的願望，或許會實現哦！</p>

      <!-- 許願表單 -->
      <div class="wish-form">
        <textarea
          v-model="wishText"
          class="wish-input"
          placeholder="寫下你的願望..."
          maxlength="200"
          rows="4"
        ></textarea>
        <div class="char-count">{{ wishText.length }} / 200</div>

        <button
          @click="makeWish"
          class="wish-btn"
          :disabled="!canMakeWish || submitting"
        >
          {{ submitting ? '許願中...' : '投入許願池' }}
        </button>
      </div>

      <!-- 願望列表 -->
      <div class="wishes-section">
        <h3 class="section-title">最近的願望</h3>

        <div v-if="loadingWishes" class="loading">
          <div class="spinner"></div>
          <p>載入中...</p>
        </div>

        <div v-else-if="wishes.length === 0" class="no-wishes">
          <p>還沒有人許願，成為第一個吧！</p>
        </div>

        <div v-else class="wishes-list">
          <div
            v-for="wish in wishes"
            :key="wish.id"
            class="wish-card"
          >
            <div class="wish-header">
              <span class="wish-author">{{ wish.username }}</span>
              <span class="wish-time">{{ formatTime(wish.created_at) }}</span>
            </div>
            <p class="wish-content">{{ wish.content }}</p>
            <button
              @click="handleLikeWish(wish.id)"
              class="like-btn"
              :class="{ liked: wish.liked }"
            >
              ❤️ {{ wish.likes || 0 }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const gameStore = useGameStore()
const { playSound } = useAudio()
const { getWishes, createWish, likeWish } = useAPI()

interface Wish {
  id: string
  username: string
  player_id?: string
  content: string
  likes: number
  liked?: boolean
  created_at: string
}

const isOpen = ref(false)
const wishText = ref('')
const submitting = ref(false)
const loadingWishes = ref(false)
const wishes = ref<Wish[]>([])
const likedWishes = ref<Set<string>>(new Set())

const canMakeWish = computed(() => {
  return wishText.value.trim().length >= 5 && wishText.value.trim().length <= 200
})

// 打開許願池
const open = () => {
  isOpen.value = true
  loadLikedWishes() // 先載入點讚記錄
  loadWishes()
  playSound('open-modal')
}

// 關閉許願池
const close = () => {
  isOpen.value = false
  wishText.value = ''
}

// 許願
const makeWish = async () => {
  if (!canMakeWish.value || submitting.value) return

  submitting.value = true

  try {
    const response = await createWish({
      player_id: gameStore.playerId,
      username: gameStore.username,
      content: wishText.value.trim()
    })

    if (response.success) {
      // 將新許願添加到列表頂部
      wishes.value.unshift(response.wish)
      wishText.value = ''

      playSound('wish-success')
      showToast('願望已投入許願池！✨')
    } else {
      showToast('許願失敗，請稍後再試')
    }
  } catch (error: any) {
    console.error('許願失敗:', error)
    showToast(error.data?.error || '許願失敗，請稍後再試')
  } finally {
    submitting.value = false
  }
}

// 載入願望列表
const loadWishes = async () => {
  loadingWishes.value = true

  try {
    const response = await getWishes(1, 20)

    if (response.success) {
      wishes.value = response.wishes.map((wish: Wish) => ({
        ...wish,
        liked: likedWishes.value.has(wish.id)
      }))
    }
  } catch (error) {
    console.error('載入願望失敗:', error)
    // 如果 API 失敗，顯示空列表
    wishes.value = []
  } finally {
    loadingWishes.value = false
  }
}

// 點讚
const handleLikeWish = async (wishId: string) => {
  const wish = wishes.value.find(w => w.id === wishId)
  if (!wish) return

  const action = wish.liked ? 'unlike' : 'like'

  try {
    const response = await likeWish(wishId, gameStore.playerId, action)

    if (response.success) {
      // 更新本地狀態
      wish.likes = response.likes
      wish.liked = !wish.liked

      // 更新 likedWishes Set
      if (wish.liked) {
        likedWishes.value.add(wishId)
        playSound('like')
      } else {
        likedWishes.value.delete(wishId)
      }

      // 保存到 localStorage
      localStorage.setItem('likedWishes', JSON.stringify(Array.from(likedWishes.value)))
    }
  } catch (error) {
    console.error('點讚失敗:', error)
  }
}

// 載入已點讚的許願
const loadLikedWishes = () => {
  try {
    const saved = localStorage.getItem('likedWishes')
    if (saved) {
      likedWishes.value = new Set(JSON.parse(saved))
    }
  } catch (error) {
    console.error('載入點讚記錄失敗:', error)
  }
}

// 格式化時間
const formatTime = (isoString: string): string => {
  const date = new Date(isoString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '剛剛'
  if (minutes < 60) return `${minutes} 分鐘前`
  if (hours < 24) return `${hours} 小時前`
  return `${days} 天前`
}

// 顯示提示
const showToast = (message: string) => {
  // 這裡可以使用全域的 toast 組件
  alert(message)
}

// 暴露給父組件
defineExpose({
  open,
  close
})
</script>

<style scoped>
.wishing-well-modal {
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
  max-width: 600px;
  max-height: 80vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
  background: rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: rotate(90deg);
}

.title {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.wish-form {
  margin-bottom: 2rem;
}

.wish-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.3s;
}

.wish-input:focus {
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

.wish-btn {
  width: 100%;
  padding: 1rem;
  margin-top: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.wish-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.wish-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.wishes-section {
  border-top: 2px solid rgba(0, 0, 0, 0.1);
  padding-top: 2rem;
}

.section-title {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #333;
}

.loading,
.no-wishes {
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

.wishes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wish-card {
  background: #fff;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.wish-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.wish-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.wish-author {
  font-weight: 600;
  color: #667eea;
}

.wish-time {
  font-size: 0.85rem;
  color: #999;
}

.wish-content {
  color: #333;
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

.like-btn {
  padding: 0.5rem 1rem;
  background: rgba(233, 30, 99, 0.1);
  border: 1px solid rgba(233, 30, 99, 0.3);
  border-radius: 20px;
  color: #e91e63;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.like-btn:hover {
  background: rgba(233, 30, 99, 0.2);
}

.like-btn.liked {
  background: #e91e63;
  color: #fff;
  border-color: #e91e63;
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
    font-size: 0.9rem;
  }
}
</style>

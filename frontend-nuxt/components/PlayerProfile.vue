<template>
  <div v-if="isOpen" class="player-profile-modal">
    <div class="modal-overlay" @click="close"></div>

    <div class="modal-content">
      <button class="close-btn" @click="close">✕</button>

      <h2 class="title">👤 個人資料</h2>

      <!-- 大頭貼區域 -->
      <div class="avatar-section">
        <div class="avatar-preview">
          <img :src="avatarUrl || '/images/default-avatar.png'" alt="頭像" @error="handleImageError" />
          <label for="avatar-upload" class="upload-overlay">
            <span class="upload-icon">📷</span>
            <span class="upload-text">更換頭像</span>
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            @change="handleAvatarChange"
            style="display: none"
          />
        </div>
        <p class="avatar-hint">支援 JPG、PNG 格式，建議尺寸 200x200</p>
      </div>

      <!-- 用戶名編輯 -->
      <div class="username-section">
        <label class="label">用戶名</label>
        <div class="input-group">
          <input
            v-model="newUsername"
            type="text"
            class="username-input"
            maxlength="20"
            placeholder="輸入你的用戶名"
          />
          <span class="char-count">{{ newUsername.length }}/20</span>
        </div>
      </div>

      <!-- 統計信息 -->
      <div class="stats-section">
        <div class="stat-item">
          <div class="stat-label">當前愛心</div>
          <div class="stat-value">{{ gameStore.heartCount }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">總愛心</div>
          <div class="stat-value">{{ gameStore.totalHearts }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">我的排名</div>
          <div class="stat-value">{{ leaderboardStore.myRankText }}</div>
        </div>
      </div>

      <!-- 稱號選擇 -->
      <div v-if="gameStore.unlockedTitles.length > 0" class="titles-section">
        <label class="label">稱號</label>
        <div class="titles-grid">
          <button
            v-for="title in gameStore.unlockedTitles"
            :key="title"
            @click="selectTitle(title)"
            class="title-btn"
            :class="{ active: gameStore.currentTitle === title }"
          >
            {{ title }}
          </button>
          <button
            @click="selectTitle('')"
            class="title-btn"
            :class="{ active: gameStore.currentTitle === '' }"
          >
            無稱號
          </button>
        </div>
      </div>

      <!-- 保存按鈕 -->
      <button @click="saveProfile" class="save-btn" :disabled="saving">
        {{ saving ? '保存中...' : '保存資料' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const gameStore = useGameStore()
const leaderboardStore = useLeaderboardStore()
const { playSound } = useAudio()
const { uploadAvatar, updateUsername } = useAPI()

const isOpen = ref(false)
const avatarUrl = ref('')
const newUsername = ref('')
const avatarFile = ref<File | null>(null)
const saving = ref(false)

const open = () => {
  isOpen.value = true
  newUsername.value = gameStore.username
  avatarUrl.value = '' // 實際應從 API 獲取
  playSound('open-modal')
}

const close = () => {
  isOpen.value = false
  avatarFile.value = null
}

const handleAvatarChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  // 檢查文件大小（限制 2MB）
  if (file.size > 2 * 1024 * 1024) {
    alert('圖片大小不能超過 2MB')
    return
  }

  // 檢查文件類型
  if (!file.type.startsWith('image/')) {
    alert('請上傳圖片文件')
    return
  }

  avatarFile.value = file

  // 預覽圖片
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  playSound('upload')
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/default-avatar.png'
}

const selectTitle = (title: string) => {
  gameStore.setCurrentTitle(title)
  playSound('select')
}

const saveProfile = async () => {
  if (saving.value) return

  // 驗證用戶名
  if (newUsername.value.trim().length < 2) {
    alert('用戶名至少需要 2 個字元')
    return
  }

  saving.value = true

  try {
    // 上傳大頭貼
    if (avatarFile.value) {
      const response = await uploadAvatar(gameStore.playerId, avatarFile.value)
      if (response.success) {
        avatarUrl.value = response.avatar_url
      }
    }

    // 更新用戶名
    if (newUsername.value !== gameStore.username) {
      const response = await updateUsername({
        player_id: gameStore.playerId,
        username: newUsername.value
      })

      if (response.success) {
        gameStore.username = newUsername.value
        gameStore.saveToStorage()
      }
    }

    playSound('success')
    alert('資料保存成功！')
    close()
  } catch (error: any) {
    console.error('保存失敗:', error)
    alert('保存失敗: ' + (error.message || '未知錯誤'))
  } finally {
    saving.value = false
  }
}

defineExpose({
  open,
  close
})
</script>

<style scoped>
.player-profile-modal {
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
  max-width: 500px;
  max-height: 80vh;
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
  margin-bottom: 2rem;
  color: #333;
}

.avatar-section {
  text-align: center;
  margin-bottom: 2rem;
}

.avatar-preview {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #667eea;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-overlay:hover {
  background: rgba(0, 0, 0, 0.7);
}

.upload-icon {
  font-size: 2rem;
  opacity: 0;
  transition: all 0.3s;
}

.upload-text {
  font-size: 0.9rem;
  color: #fff;
  margin-top: 0.5rem;
  opacity: 0;
  transition: all 0.3s;
}

.upload-overlay:hover .upload-icon,
.upload-overlay:hover .upload-text {
  opacity: 1;
}

.avatar-hint {
  font-size: 0.85rem;
  color: #999;
}

.username-section,
.titles-section {
  margin-bottom: 2rem;
}

.label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.input-group {
  position: relative;
}

.username-input {
  width: 100%;
  padding: 0.75rem 4rem 0.75rem 1rem;
  border: 2px solid #ddd;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s;
}

.username-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.char-count {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 0.85rem;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}

.titles-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.title-btn {
  padding: 0.75rem;
  background: rgba(102, 126, 234, 0.1);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.title-btn:hover {
  background: rgba(102, 126, 234, 0.2);
  border-color: #667eea;
}

.title-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-color: transparent;
}

.save-btn {
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

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  .modal-content {
    width: 95%;
    padding: 1.5rem;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .titles-grid {
    grid-template-columns: 1fr;
  }
}
</style>

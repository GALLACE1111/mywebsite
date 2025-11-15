<!--
  手機版維護頁面
  - 手機用戶會自動重定向到此頁面
  - 簡單友善的提示
  - 建議使用桌面版瀏覽
-->
<template>
  <div class="maintenance-container">
    <div class="maintenance-card">
      <!-- 圖示 -->
      <div class="icon">🌙✨</div>

      <!-- 標題 -->
      <h1 class="title">手機版開發中</h1>

      <!-- 說明 -->
      <p class="description">
        「阿賢的小窩」目前專注於桌面版體驗開發
      </p>

      <p class="description-sub">
        手機版需要特別設計以適應小螢幕，<br>
        將在桌面版完成後推出
      </p>

      <!-- 建議 -->
      <div class="suggestion">
        <div class="suggestion-icon">💡</div>
        <div class="suggestion-text">
          建議使用<strong>桌面電腦</strong>或<strong>筆記型電腦</strong>瀏覽，<br>
          以獲得最佳體驗！
        </div>
      </div>

      <!-- 專案資訊 -->
      <div class="project-info">
        <p>🎮 愛心互動遊戲</p>
        <p>🌟 月球世界探索</p>
        <p>⏰ 專注鬧鐘功能</p>
        <p>🌠 許願池系統</p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>感謝你的理解與支持 💕</p>
        <p class="version">桌面版開發進度：{{ progress }}%</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

/**
 * 手機版維護頁面
 *
 * 功能：
 * - 顯示手機版開發中提示
 * - 建議使用桌面版瀏覽
 * - 顯示專案特色功能
 */

// 桌面版開發進度（手動更新）
const progress = ref<number>(10)

// 設定頁面標題
useHead({
  title: '手機版開發中 - 阿賢的小窩',
  meta: [
    { name: 'description', content: '手機版開發中，建議使用桌面版瀏覽' }
  ]
})
</script>

<style scoped>
/**
 * 手機版維護頁面樣式
 *
 * 特點：
 * - 簡單乾淨的設計
 * - 適合小螢幕顯示
 * - 可愛友善的風格
 */

.maintenance-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.maintenance-card {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: #2d3436;
  margin-bottom: 20px;
}

.description {
  font-size: 18px;
  color: #636e72;
  margin-bottom: 10px;
  line-height: 1.6;
}

.description-sub {
  font-size: 16px;
  color: #b2bec3;
  margin-bottom: 30px;
  line-height: 1.6;
}

.suggestion {
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.suggestion-icon {
  font-size: 36px;
  flex-shrink: 0;
}

.suggestion-text {
  font-size: 16px;
  color: #2d3436;
  text-align: left;
  line-height: 1.6;
}

.suggestion-text strong {
  color: #d63031;
  font-weight: 700;
}

.project-info {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
}

.project-info p {
  font-size: 16px;
  color: #2d3436;
  margin: 8px 0;
}

.footer {
  border-top: 2px solid #e9ecef;
  padding-top: 20px;
}

.footer p {
  font-size: 16px;
  color: #636e72;
  margin: 8px 0;
}

.version {
  font-size: 14px;
  color: #b2bec3;
  font-weight: 600;
}
</style>

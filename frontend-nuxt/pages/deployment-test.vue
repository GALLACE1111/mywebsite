<template>
  <div class="deployment-test">
    <h1>🚀 部署測試頁面</h1>

    <div class="info-card">
      <h2>📊 部署資訊</h2>
      <p><strong>部署時間:</strong> {{ deployTime }}</p>
      <p><strong>環境:</strong> {{ environment }}</p>
      <p><strong>版本:</strong> v1.0.0</p>
    </div>

    <div class="platform-info">
      <h2>🌐 訪問平台</h2>
      <div class="platforms">
        <div class="platform firebase">
          <h3>🔥 Firebase (SSR)</h3>
          <p>URL: <a href="https://side-project-663de.web.app" target="_blank">
            side-project-663de.web.app
          </a></p>
          <p>特性: 伺服器端渲染、完整功能</p>
        </div>

        <div class="platform github">
          <h3>📄 GitHub Pages (SSG)</h3>
          <p>URL: <a href="https://gallace1111.github.io/mywebsite/" target="_blank">
            gallace1111.github.io/mywebsite
          </a></p>
          <p>特性: 靜態生成、快速載入</p>
        </div>
      </div>
    </div>

    <div class="test-results">
      <h2>✅ 測試項目</h2>
      <ul>
        <li>✅ 頁面成功載入</li>
        <li>✅ 路由正常工作</li>
        <li>✅ 樣式正確顯示</li>
        <li>✅ {{ isSSR ? 'SSR 渲染' : 'CSR 渲染' }}</li>
      </ul>
    </div>

    <div class="actions">
      <button @click="goHome">返回首頁</button>
    </div>
  </div>
</template>

<script setup>
const deployTime = new Date().toLocaleString('zh-TW')
const isSSR = typeof window === 'undefined'
const environment = process.env.NODE_ENV

const goHome = () => {
  navigateTo('/')
}
</script>

<style scoped>
.deployment-test {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  text-align: center;
  color: #667eea;
  margin-bottom: 2rem;
}

.info-card,
.platform-info,
.test-results {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #333;
  margin-bottom: 1rem;
}

.platforms {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.platform {
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
}

.platform.firebase {
  border-color: #ff9800;
  background: #fff8f0;
}

.platform.github {
  border-color: #333;
  background: #f5f5f5;
}

.platform h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.platform p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.platform a {
  color: #667eea;
  text-decoration: none;
}

.platform a:hover {
  text-decoration: underline;
}

.test-results ul {
  list-style: none;
  padding: 0;
}

.test-results li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.test-results li:last-child {
  border-bottom: none;
}

.actions {
  text-align: center;
  margin-top: 2rem;
}

button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background: #5568d3;
}
</style>

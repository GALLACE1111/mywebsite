<!--
  ⚠️ 手機版響應式：永久關閉
  - 不要添加 @media 查詢
  - 不要添加 body.mobile-mode 樣式
  - 手機用戶會看到維護中頁面
-->
<template>
  <!-- 左下角像素風角色（Spritesheet 動畫） -->
  <div class="character-animation"></div>
</template>

<script setup lang="ts">
/**
 * CharacterAnimation 組件 - 左下角像素風角色
 *
 * 功能說明：
 * - 顯示像素風格角色動畫
 * - 使用 GIF 圖片（character_running.gif）
 * - 固定在左下角位置
 * - Hover 時放大效果
 *
 * 技術細節：
 * - 使用 background-image 而非 <img> 標籤
 * - image-rendering: pixelated 保持像素風格
 * - GIF 自帶動畫，不需要 CSS 動畫控制
 *
 * 參考來源：
 * - HTML: frontend/index.html 第 16 行
 * - CSS: frontend/assets/css/style.css .character-animation（第 50-75 行）
 * - 圖片: public/images/character_running.gif
 */

// 這個組件不需要任何 JavaScript 邏輯
// 所有動畫都由 GIF 和 CSS 處理
</script>

<style scoped>
/**
 * 像素風角色樣式
 * 完全參照 frontend/assets/css/style.css 第 50-75 行
 * ⚠️ 已移除所有手機版響應式設計
 */

.character-animation {
  position: fixed;
  bottom: 0;
  left: 50px;
  width: 33vw;
  max-width: 500px;
  height: 33vw;
  max-height: 500px;
  z-index: 5;
  pointer-events: auto;
  cursor: pointer;
  transition: transform 0.2s ease;
  background-image: url('/images/character_running.gif?v=7');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center bottom;

  /* 保持像素風格（跨瀏覽器兼容） */
  image-rendering: pixelated; /* Chrome, Edge */
  image-rendering: -moz-crisp-edges; /* Firefox */
  image-rendering: -webkit-optimize-contrast; /* Safari */
  image-rendering: crisp-edges; /* 標準屬性 */
}

/* GIF 自帶動畫，不需要 CSS 動畫控制 */
/* Hover 效果：放大 1.05 倍 */
.character-animation:hover {
  transform: scale(1.05);
}
</style>

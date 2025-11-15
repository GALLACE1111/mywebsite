<!--
  ⚠️ 手機版響應式：永久關閉
  - 不要添加 @media 查詢
  - 不要添加 body.mobile-mode 樣式
  - 手機用戶會看到維護中頁面
-->
<template>
  <!-- Canvas 動畫背景層 -->
  <canvas ref="canvasRef" id="mainCanvas"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 星星發射系統
const { shootStars, updateParticles, drawParticles } = useStarShooter()

/**
 * CanvasBackground 組件 - Canvas 動畫背景層
 *
 * 功能說明：
 * - 全螢幕 Canvas 背景
 * - 背景圖片循環切換（早晨 → 下午 → 晚上 → 深夜）
 * - 雪花粒子系統（可選）
 * - 支援月球世界背景（GALAXY）
 *
 * 背景循環順序：
 * - 早晨 (30s) → 下午 (30s) → 晚上 (30s) → 深夜 (60s)
 * - 總循環時間：150 秒
 *
 * 技術細節：
 * - 使用 Canvas 2D Context
 * - requestAnimationFrame 動畫循環
 * - 響應視窗尺寸變化
 *
 * 參考來源：
 * - HTML: frontend/index.html 第 13 行
 * - JS Canvas: frontend/assets/js/script.js 第 276-278 行
 * - JS 繪製: frontend/assets/js/script.js drawSky() 函數（第 775-798 行）
 * - JS 動畫: frontend/assets/js/script.js animate() 函數（第 1831-1852 行）
 * - CSS: frontend/assets/css/style.css 第 39-47 行
 */

// Canvas 元素引用
const canvasRef = ref<HTMLCanvasElement | null>(null)

// Canvas 2D Context
let ctx: CanvasRenderingContext2D | null = null

// 動畫 ID（用於清理）
let animationId: number | null = null

// 背景圖片載入狀態
const backgroundImages = {
  morning: null as HTMLImageElement | null,
  afternoon: null as HTMLImageElement | null,
  night: null as HTMLImageElement | null,
  lateNight: null as HTMLImageElement | null,
}

const backgroundImagesLoaded = {
  morning: false,
  afternoon: false,
  night: false,
  lateNight: false,
}

// 背景循環開始時間
let cycleStartTime = Date.now()

/**
 * 設定 Canvas 尺寸為視窗大小
 * 參照 frontend/assets/js/script.js 第 630-633 行
 */
function resizeCanvas(): void {
  if (!canvasRef.value) return

  canvasRef.value.width = window.innerWidth
  canvasRef.value.height = window.innerHeight
}

/**
 * 載入背景圖片
 * 參照 frontend/assets/js/script.js 第 638-683 行
 */
function loadBackgroundImages(): void {
  // 早晨背景
  backgroundImages.morning = new Image()
  backgroundImages.morning.src = '/images/morning.png'
  backgroundImages.morning.onload = () => {
    backgroundImagesLoaded.morning = true
    console.log('早晨背景載入成功！')
  }
  backgroundImages.morning.onerror = () => {
    console.log('早晨背景載入失敗: /images/morning.png')
  }

  // 下午背景
  backgroundImages.afternoon = new Image()
  backgroundImages.afternoon.src = '/images/1219.png'
  backgroundImages.afternoon.onload = () => {
    backgroundImagesLoaded.afternoon = true
    console.log('下午背景載入成功！')
  }
  backgroundImages.afternoon.onerror = () => {
    console.log('下午背景載入失敗: /images/1219.png')
  }

  // 晚上背景
  backgroundImages.night = new Image()
  backgroundImages.night.src = '/images/1922.png'
  backgroundImages.night.onload = () => {
    backgroundImagesLoaded.night = true
    console.log('晚上背景載入成功！')
  }
  backgroundImages.night.onerror = () => {
    console.log('晚上背景載入失敗: /images/1922.png')
  }

  // 深夜背景
  backgroundImages.lateNight = new Image()
  backgroundImages.lateNight.src = '/images/2206.png'
  backgroundImages.lateNight.onload = () => {
    backgroundImagesLoaded.lateNight = true
    console.log('深夜背景載入成功！')
  }
  backgroundImages.lateNight.onerror = () => {
    console.log('深夜背景載入失敗: /images/2206.png')
  }
}

/**
 * 獲取當前背景圖片索引
 * 循環順序：早晨(30s) → 下午(30s) → 晚上(30s) → 深夜(60s)
 */
function getCurrentBackgroundIndex(): number {
  const elapsed = (Date.now() - cycleStartTime) / 1000 // 秒
  const cycleTime = 150 // 總循環時間 150 秒

  const progress = (elapsed % cycleTime) / cycleTime

  if (progress < 0.2) return 0 // 早晨 (0-30s)
  if (progress < 0.4) return 1 // 下午 (30-60s)
  if (progress < 0.6) return 2 // 晚上 (60-90s)
  return 3 // 深夜 (90-150s)
}

/**
 * 獲取當前背景圖片
 * 參照 frontend/assets/js/script.js 第 713-732 行
 */
function getCurrentBackgroundImage(): HTMLImageElement | null {
  const index = getCurrentBackgroundIndex()

  switch (index) {
    case 0:
      return backgroundImagesLoaded.morning ? backgroundImages.morning : null
    case 1:
      return backgroundImagesLoaded.afternoon ? backgroundImages.afternoon : null
    case 2:
      return backgroundImagesLoaded.night ? backgroundImages.night : null
    case 3:
      return backgroundImagesLoaded.lateNight ? backgroundImages.lateNight : null
    default:
      return null
  }
}

/**
 * 獲取天空顏色（備用）
 * 當背景圖片載入失敗時使用
 * 參照 frontend/assets/js/script.js 第 737-773 行
 */
function getSkyColor(): string {
  const index = getCurrentBackgroundIndex()
  let hue: number, saturation: number, lightness: number

  switch (index) {
    case 0:
      // 早晨 - 淺藍天空
      hue = 200
      saturation = 70
      lightness = 70
      break
    case 1:
      // 下午 - 明亮天空
      hue = 210
      saturation = 60
      lightness = 65
      break
    case 2:
      // 晚上 - 深紫色
      hue = 280
      saturation = 60
      lightness = 30
      break
    case 3:
      // 深夜 - 深紫藍色
      hue = 260
      saturation = 55
      lightness = 18
      break
    default:
      hue = 200
      saturation = 50
      lightness = 50
  }

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

/**
 * 調整顏色亮度
 * 參照 frontend/assets/js/script.js 第 801-810 行
 */
function adjustBrightness(hsl: string, adjustment: number): string {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
  if (match) {
    const h = match[1]
    const s = match[2]
    const l = Math.max(0, Math.min(100, parseInt(match[3]) + adjustment))
    return `hsl(${h}, ${s}%, ${l}%)`
  }
  return hsl
}

/**
 * 繪製天空背景
 * 參照 frontend/assets/js/script.js 第 775-798 行
 */
function drawSky(): void {
  if (!ctx || !canvasRef.value) return

  // 獲取當前背景圖片
  const bgImage = getCurrentBackgroundImage()

  if (bgImage) {
    // 繪製背景圖片（覆蓋整個 Canvas）
    ctx.drawImage(bgImage, 0, 0, canvasRef.value.width, canvasRef.value.height)
  } else {
    // 如果圖片未載入，使用純色背景
    const skyColor = getSkyColor()
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasRef.value.height)
    gradient.addColorStop(0, skyColor)
    gradient.addColorStop(1, adjustBrightness(skyColor, -15))

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  }
}

/**
 * 主動畫循環
 * 參照 frontend/assets/js/script.js 第 1831-1852 行
 */
function animate(): void {
  if (!ctx) return

  // 繪製天空背景
  drawSky()

  // 更新和繪製星星粒子
  updateParticles()
  drawParticles(ctx)

  // TODO: 未來可添加
  // - 雪花粒子系統
  // - 其他粒子效果

  // 繼續動畫循環
  animationId = requestAnimationFrame(animate)
}

// 組件掛載時初始化
onMounted(() => {
  if (!canvasRef.value) return

  // 獲取 Canvas Context
  ctx = canvasRef.value.getContext('2d')

  if (!ctx) {
    console.error('無法獲取 Canvas 2D Context')
    return
  }

  // 設定 Canvas 尺寸
  resizeCanvas()

  // 監聽視窗尺寸變化
  window.addEventListener('resize', resizeCanvas)

  // 載入背景圖片
  loadBackgroundImages()

  // 啟動動畫循環
  animate()

  console.log('✅ Canvas 背景系統已初始化')
})

// 組件卸載時清理
onUnmounted(() => {
  // 停止動畫循環
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
    animationId = null
  }

  // 移除事件監聽器
  window.removeEventListener('resize', resizeCanvas)

  console.log('🛑 Canvas 背景系統已清理')
})

/**
 * 暴露方法給父組件
 * shootStars - 發射星星（用於戰鬥系統）
 */
defineExpose({
  shootStars
})
</script>

<style scoped>
/**
 * Canvas 背景樣式
 * 完全參照 frontend/assets/css/style.css 第 39-47 行
 */

#mainCanvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>

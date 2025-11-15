/**
 * 裝置檢測 Middleware（全域）
 *
 * 功能：
 * - 自動檢測訪問裝置類型
 * - 手機/平板用戶重定向到維護頁面
 * - 只允許桌面版用戶訪問
 *
 * 檔名說明：
 * - *.global.ts 表示這是全域 middleware
 * - 會在每個頁面路由前自動執行
 *
 * ⚠️ 手機版響應式：永久關閉
 * - 這個 middleware 確保手機用戶看不到桌面版
 * - 手機用戶會被重定向到 /maintenance-mobile
 */

export default defineNuxtRouteMiddleware((to, from) => {
  // 只在客戶端執行（避免 SSR 時出錯）
  if (process.client) {
    // 如果已經在維護頁面，不需要再次檢查
    if (to.path === '/maintenance-mobile') {
      return
    }

    // 檢測是否為手機或平板裝置
    const isMobileDevice = checkIfMobileDevice()

    if (isMobileDevice) {
      console.log('🚫 偵測到手機/平板裝置，重定向到維護頁面')
      return navigateTo('/maintenance-mobile')
    }

    console.log('✅ 桌面版裝置，允許訪問')
  }
})

/**
 * 檢測是否為手機或平板裝置
 *
 * 檢測方式：
 * 1. User Agent 字串檢測
 * 2. 螢幕寬度檢測（< 1024px）
 * 3. 觸控支援檢測
 *
 * @returns {boolean} true = 手機/平板，false = 桌面
 */
function checkIfMobileDevice(): boolean {
  // 方法 1：User Agent 檢測
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i

  if (mobileRegex.test(userAgent)) {
    console.log('  - User Agent 檢測：手機/平板')
    return true
  }

  // 方法 2：螢幕寬度檢測（< 1024px 視為手機/平板）
  const screenWidth = window.innerWidth || document.documentElement.clientWidth

  if (screenWidth < 1024) {
    console.log(`  - 螢幕寬度檢測：${screenWidth}px < 1024px（手機/平板）`)
    return true
  }

  // 方法 3：觸控支援 + 小螢幕（雙重驗證）
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isSmallScreen = screenWidth < 1280

  if (isTouchDevice && isSmallScreen) {
    console.log('  - 觸控裝置 + 小螢幕：可能是平板')
    return true
  }

  // 都不符合，判定為桌面裝置
  console.log('  - 判定為桌面裝置')
  return false
}

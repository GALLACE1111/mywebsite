/**
 * 愛心點擊系統 - 全局點擊監聽和浮動愛心特效
 * 參考：frontend/assets/js/script.js:2664-2693
 * 功能：
 * 1. 監聽全局點擊事件
 * 2. 在點擊位置創建 💖 emoji
 * 3. 愛心向上浮動並消失（3秒）
 * 4. 排除按鈕等互動元素的點擊
 */

export const useHeartClick = () => {
  // 是否啟用愛心放置
  const heartPlacementEnabled = ref(true)

  /**
   * 創建愛心元素
   * @param x - 點擊的 X 座標
   * @param y - 點擊的 Y 座標
   */
  const createHeart = (x: number, y: number) => {
    if (!heartPlacementEnabled.value) return

    const heart = document.createElement('div')
    heart.className = 'placed-heart'
    heart.textContent = '💖'
    heart.style.left = `${x}px`
    heart.style.top = `${y}px`

    document.body.appendChild(heart)

    // 3秒後移除愛心
    setTimeout(() => {
      heart.remove()
    }, 3000)
  }

  /**
   * 處理全局點擊事件
   * 排除按鈕、連結、輸入框、Boss 戰容器、對話框等互動元素
   */
  const handleClick = (e: MouseEvent) => {
    // 如果點擊的是按鈕或其他互動元素，不放置愛心
    const target = e.target as HTMLElement
    const isInteractive = target.closest(
      'button, a, input, textarea, select, .info-panel, .character-animation, .boss-battle-container, .dialogue-box'
    )

    if (!isInteractive && heartPlacementEnabled.value) {
      createHeart(e.clientX, e.clientY)
    }
  }

  /**
   * 啟用愛心放置
   */
  const enable = () => {
    heartPlacementEnabled.value = true
  }

  /**
   * 停用愛心放置
   */
  const disable = () => {
    heartPlacementEnabled.value = false
  }

  // 初始化：添加全局點擊監聽器
  onMounted(() => {
    document.addEventListener('click', handleClick)
  })

  // 清理：移除事件監聽器
  onUnmounted(() => {
    document.removeEventListener('click', handleClick)
  })

  return {
    heartPlacementEnabled: readonly(heartPlacementEnabled),
    enable,
    disable
  }
}

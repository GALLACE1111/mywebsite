/**
 * 星星發射系統 Composable
 * 參考：frontend/assets/js/script.js:863-1035
 * 功能：管理星星粒子的創建、更新和繪製
 */

/**
 * 星星粒子類
 * 參考：frontend/assets/js/script.js:863-997
 */
class StarParticle {
  x: number
  y: number
  startX: number
  startY: number
  targetX: number
  targetY: number
  size: number
  hue: number
  progress: number
  speed: number
  rotation: number
  rotationSpeed: number
  active: boolean
  createdAt: number
  trackingStrength: number

  constructor(startX: number, startY: number, targetX: number, targetY: number) {
    this.startX = startX
    this.startY = startY
    this.x = startX
    this.y = startY
    this.targetX = targetX
    this.targetY = targetY
    this.size = 12 + Math.random() * 8 // 12-20px
    this.hue = Math.random() * 60 + 30 // 金黃色系 (30-90)
    this.progress = 0
    this.speed = 0.008 + Math.random() * 0.004 // 0.008-0.012
    this.rotation = Math.random() * Math.PI * 2
    this.rotationSpeed = (Math.random() - 0.5) * 0.2
    this.active = true
    this.createdAt = Date.now()
    this.trackingStrength = 0.05 // 追蹤強度
  }

  /**
   * 更新目標位置（即時追蹤月亮）
   */
  updateTarget() {
    // 獲取右上角月亮的實際位置（MoonClock 組件）
    const moonElement = document.querySelector('.info-panel') as HTMLElement
    if (moonElement) {
      const rect = moonElement.getBoundingClientRect()
      this.targetX = rect.left + rect.width / 2
      this.targetY = rect.top + rect.height / 2
    } else {
      // 備用位置：右上角
      this.targetX = window.innerWidth - 120
      this.targetY = 120
    }
  }

  /**
   * 更新粒子狀態
   */
  update() {
    // 即時更新目標位置（追蹤月亮）
    this.updateTarget()

    this.progress += this.speed

    // 計算生存時間（最多 5 秒）
    const lifetime = (Date.now() - this.createdAt) / 1000
    if (lifetime > 5 || this.progress >= 1) {
      this.active = false
      return
    }

    // 計算到目標的距離
    const dx = this.targetX - this.x
    const dy = this.targetY - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    // 如果非常接近目標（50 像素內），標記為完成
    if (distance < 50) {
      this.active = false
      return
    }

    // 使用追蹤算法：混合貝茲曲線和直接追蹤
    const t = this.progress
    const controlX = (this.startX + this.targetX) / 2
    const controlY = Math.min(this.startY, this.targetY) - 200

    // 貝茲曲線路徑
    const bezierX =
      Math.pow(1 - t, 2) * this.startX +
      2 * (1 - t) * t * controlX +
      Math.pow(t, 2) * this.targetX

    const bezierY =
      Math.pow(1 - t, 2) * this.startY +
      2 * (1 - t) * t * controlY +
      Math.pow(t, 2) * this.targetY

    // 直接追蹤向量
    const trackingX = this.x + dx * this.trackingStrength
    const trackingY = this.y + dy * this.trackingStrength

    // 混合兩種移動方式（後期更偏向追蹤）
    const trackingWeight = Math.min(t * 1.5, 1) // 隨時間增加追蹤權重
    this.x = bezierX * (1 - trackingWeight) + trackingX * trackingWeight
    this.y = bezierY * (1 - trackingWeight) + trackingY * trackingWeight

    // 更新旋轉
    this.rotation += this.rotationSpeed
  }

  /**
   * 繪製粒子
   */
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.rotation)

    // 繪製五角星
    ctx.fillStyle = `hsl(${this.hue}, 100%, 60%)`
    ctx.shadowBlur = 15
    ctx.shadowColor = `hsl(${this.hue}, 100%, 70%)`

    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
      const x = Math.cos(angle) * this.size
      const y = Math.sin(angle) * this.size
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.fill()

    // 添加白色中心
    ctx.fillStyle = `hsl(${this.hue}, 100%, 85%)`
    ctx.shadowBlur = 0
    ctx.beginPath()
    ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }
}

/**
 * 星星發射系統
 */
export const useStarShooter = () => {
  const gameStore = useGameStore()

  // 粒子陣列
  const particles = ref<StarParticle[]>([])

  /**
   * 發射星星
   * 參考：frontend/assets/js/script.js:1003-1035
   */
  const shootStars = () => {
    // 固定發射位置在角色手前方
    const charX = 450 // 固定 X 位置（角色手前方）
    const charY = window.innerHeight - 220 // 固定 Y 位置（角色手的高度）

    // 目標位置：右上角月亮
    let targetX = window.innerWidth - 120
    let targetY = 120

    // 嘗試獲取月亮的實際位置
    const moonElement = document.querySelector('.info-panel') as HTMLElement
    if (moonElement) {
      const rect = moonElement.getBoundingClientRect()
      targetX = rect.left + rect.width / 2
      targetY = rect.top + rect.height / 2
    }

    // 發射 8 顆星星（每隔 150ms 發射一顆）
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        particles.value.push(new StarParticle(charX, charY, targetX, targetY))
      }, i * 150)
    }
  }

  /**
   * 更新所有粒子
   */
  const updateParticles = () => {
    // 更新並移除不活躍的粒子
    for (let i = particles.value.length - 1; i >= 0; i--) {
      particles.value[i].update()
      if (!particles.value[i].active) {
        particles.value.splice(i, 1)

        // Boss 戰中扣血（每顆星星造成 1 點傷害）
        if (gameStore.inBossBattle) {
          gameStore.attackBoss(1)
        }
      }
    }
  }

  /**
   * 繪製所有粒子
   */
  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    particles.value.forEach((particle) => {
      if (particle.active) {
        particle.draw(ctx)
      }
    })
  }

  return {
    particles,
    shootStars,
    updateParticles,
    drawParticles
  }
}

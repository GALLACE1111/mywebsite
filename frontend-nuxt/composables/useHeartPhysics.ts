/**
 * 愛心物理引擎 Composable
 * 使用 Matter.js 實現愛心掉落物理效果
 */
import Matter from 'matter-js'

export const useHeartPhysics = () => {
  const engine = ref<Matter.Engine | null>(null)
  const render = ref<Matter.Render | null>(null)
  const runner = ref<Matter.Runner | null>(null)
  const world = ref<Matter.World | null>(null)

  const hearts = ref<Matter.Body[]>([])
  const isInitialized = ref(false)

  /**
   * 初始化物理引擎
   * @param container HTML 容器元素
   * @param options 配置選項
   */
  const init = (container: HTMLElement, options?: {
    width?: number
    height?: number
    gravity?: number
    wireframes?: boolean
  }) => {
    if (isInitialized.value) {
      console.warn('物理引擎已初始化')
      return
    }

    const width = options?.width || container.clientWidth
    const height = options?.height || container.clientHeight

    // 創建引擎
    engine.value = Matter.Engine.create()
    world.value = engine.value.world

    // 設置重力
    engine.value.gravity.y = options?.gravity || 0.5

    // 創建渲染器
    render.value = Matter.Render.create({
      element: container,
      engine: engine.value,
      options: {
        width,
        height,
        wireframes: options?.wireframes || false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio || 1
      }
    })

    // 創建邊界
    const thickness = 50
    const walls = [
      // 地面
      Matter.Bodies.rectangle(
        width / 2,
        height + thickness / 2,
        width,
        thickness,
        { isStatic: true, label: 'ground' }
      ),
      // 左牆
      Matter.Bodies.rectangle(
        -thickness / 2,
        height / 2,
        thickness,
        height,
        { isStatic: true, label: 'left-wall' }
      ),
      // 右牆
      Matter.Bodies.rectangle(
        width + thickness / 2,
        height / 2,
        thickness,
        height,
        { isStatic: true, label: 'right-wall' }
      )
    ]

    Matter.World.add(world.value, walls)

    // 啟動渲染器
    Matter.Render.run(render.value)

    // 創建運行器
    runner.value = Matter.Runner.create()
    Matter.Runner.run(runner.value, engine.value)

    isInitialized.value = true
  }

  /**
   * 添加愛心
   * @param x X 座標
   * @param y Y 座標
   * @param options 愛心選項
   */
  const addHeart = (x: number, y: number, options?: {
    size?: number
    color?: string
    restitution?: number
    velocity?: { x: number; y: number }
  }) => {
    if (!world.value) {
      console.warn('物理引擎未初始化')
      return null
    }

    const size = options?.size || 20
    const color = options?.color || '#e91e63'
    const restitution = options?.restitution || 0.8

    // 創建圓形愛心（簡化版，可以改用 SVG 形狀）
    const heart = Matter.Bodies.circle(x, y, size, {
      restitution, // 彈性
      friction: 0.1,
      density: 0.001,
      render: {
        fillStyle: color,
        strokeStyle: '#fff',
        lineWidth: 2
      }
    })

    // 設置初始速度
    if (options?.velocity) {
      Matter.Body.setVelocity(heart, options.velocity)
    }

    Matter.World.add(world.value, heart)
    hearts.value.push(heart)

    return heart
  }

  /**
   * 添加愛心圖片
   * @param x X 座標
   * @param y Y 座標
   * @param imagePath 圖片路徑
   * @param size 大小
   */
  const addHeartImage = (x: number, y: number, imagePath: string, size = 40) => {
    if (!world.value) {
      console.warn('物理引擎未初始化')
      return null
    }

    const heart = Matter.Bodies.circle(x, y, size / 2, {
      restitution: 0.8,
      friction: 0.1,
      density: 0.001,
      render: {
        sprite: {
          texture: imagePath,
          xScale: size / 100,
          yScale: size / 100
        }
      }
    })

    Matter.World.add(world.value, heart)
    hearts.value.push(heart)

    return heart
  }

  /**
   * 移除愛心
   * @param heart 要移除的愛心
   */
  const removeHeart = (heart: Matter.Body) => {
    if (!world.value) return

    Matter.World.remove(world.value, heart)
    const index = hearts.value.indexOf(heart)
    if (index > -1) {
      hearts.value.splice(index, 1)
    }
  }

  /**
   * 清除所有愛心
   */
  const clearHearts = () => {
    if (!world.value) return

    hearts.value.forEach(heart => {
      Matter.World.remove(world.value!, heart)
    })
    hearts.value = []
  }

  /**
   * 施加爆炸力
   * @param x 爆炸中心 X
   * @param y 爆炸中心 Y
   * @param force 力度
   */
  const applyExplosion = (x: number, y: number, force = 0.05) => {
    hearts.value.forEach(heart => {
      const dx = heart.position.x - x
      const dy = heart.position.y - y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < 200) {
        const angle = Math.atan2(dy, dx)
        const strength = force * (1 - distance / 200)

        Matter.Body.applyForce(heart, heart.position, {
          x: Math.cos(angle) * strength,
          y: Math.sin(angle) * strength
        })
      }
    })
  }

  /**
   * 更新容器大小
   * @param width 新寬度
   * @param height 新高度
   */
  const resize = (width: number, height: number) => {
    if (!render.value || !world.value) return

    render.value.canvas.width = width
    render.value.canvas.height = height
    render.value.options.width = width
    render.value.options.height = height

    // 更新邊界
    const thickness = 50
    const bodies = Matter.Composite.allBodies(world.value)

    bodies.forEach(body => {
      if (body.label === 'ground') {
        Matter.Body.setPosition(body, { x: width / 2, y: height + thickness / 2 })
        Matter.Body.setVertices(body, Matter.Bodies.rectangle(width / 2, height + thickness / 2, width, thickness).vertices)
      } else if (body.label === 'right-wall') {
        Matter.Body.setPosition(body, { x: width + thickness / 2, y: height / 2 })
      }
    })
  }

  /**
   * 清理物理引擎
   */
  const cleanup = () => {
    if (runner.value && engine.value) {
      Matter.Runner.stop(runner.value)
    }
    if (render.value) {
      Matter.Render.stop(render.value)
      render.value.canvas.remove()
    }
    if (engine.value) {
      Matter.Engine.clear(engine.value)
    }

    hearts.value = []
    engine.value = null
    render.value = null
    runner.value = null
    world.value = null
    isInitialized.value = false
  }

  // 組件卸載時清理
  onUnmounted(() => {
    cleanup()
  })

  return {
    init,
    addHeart,
    addHeartImage,
    removeHeart,
    clearHearts,
    applyExplosion,
    resize,
    cleanup,
    isInitialized,
    hearts: readonly(hearts),
    engine: readonly(engine)
  }
}

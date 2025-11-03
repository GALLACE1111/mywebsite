import { defineStore } from 'pinia'

/**
 * 遊戲狀態管理
 * 管理愛心點擊、分數、遊戲進度等核心狀態
 */
export const useGameStore = defineStore('game', {
  state: () => ({
    // 玩家資訊
    playerId: '' as string,
    username: '訪客' as string,

    // 分數相關
    heartCount: 0 as number,
    totalHearts: 0 as number,

    // 遊戲狀態
    inMoonWorld: false as boolean,
    bossHealth: 0 as number,
    maxBossHealth: 100 as number,

    // UI 狀態
    showLeaderboard: true as boolean,
    musicEnabled: true as boolean,
    soundEnabled: true as boolean,

    // 時段系統
    timeOfDay: 'morning' as 'morning' | 'afternoon' | 'evening' | 'night',

    // 稱號系統
    currentTitle: '' as string,
    unlockedTitles: [] as string[]
  }),

  getters: {
    /**
     * 獲取顯示的用戶名
     */
    displayName(): string {
      return this.username || '訪客'
    },

    /**
     * Boss 血量百分比
     */
    bossHealthPercent(): number {
      return this.maxBossHealth > 0
        ? (this.bossHealth / this.maxBossHealth) * 100
        : 0
    },

    /**
     * 是否在 Boss 戰鬥中
     */
    inBossBattle(): boolean {
      return this.inMoonWorld && this.bossHealth > 0
    }
  },

  actions: {
    /**
     * 初始化玩家資料
     */
    initPlayer(id?: string, username?: string) {
      if (id) {
        this.playerId = id
      } else {
        // 如果沒有 ID，生成一個本地 ID
        this.playerId = this.generatePlayerId()
      }

      if (username) {
        this.username = username
      }

      // 從 localStorage 載入數據
      this.loadFromStorage()
    },

    /**
     * 生成玩家 ID
     */
    generatePlayerId(): string {
      const storedId = localStorage.getItem('playerId')
      if (storedId) return storedId

      const newId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
      localStorage.setItem('playerId', newId)
      return newId
    },

    /**
     * 點擊愛心
     */
    clickHeart(count: number = 1) {
      this.heartCount += count
      this.totalHearts += count

      // 保存到 localStorage
      this.saveToStorage()
    },

    /**
     * 進入月球世界
     */
    enterMoonWorld() {
      this.inMoonWorld = true
      this.initBoss()
    },

    /**
     * 離開月球世界
     */
    exitMoonWorld() {
      this.inMoonWorld = false
      this.bossHealth = 0
    },

    /**
     * 初始化 Boss
     */
    initBoss() {
      this.bossHealth = this.maxBossHealth
    },

    /**
     * 攻擊 Boss
     */
    attackBoss(damage: number) {
      this.bossHealth = Math.max(0, this.bossHealth - damage)

      // Boss 被擊敗
      if (this.bossHealth === 0) {
        this.onBossDefeated()
      }
    },

    /**
     * Boss 被擊敗時的處理
     */
    onBossDefeated() {
      // 給予獎勵
      this.heartCount += 50
      this.totalHearts += 50

      // 保存並離開
      this.saveToStorage()
      setTimeout(() => {
        this.exitMoonWorld()
      }, 2000)
    },

    /**
     * 切換排行榜顯示
     */
    toggleLeaderboard() {
      this.showLeaderboard = !this.showLeaderboard
    },

    /**
     * 切換音樂
     */
    toggleMusic() {
      this.musicEnabled = !this.musicEnabled
      this.saveToStorage()
    },

    /**
     * 切換音效
     */
    toggleSound() {
      this.soundEnabled = !this.soundEnabled
      this.saveToStorage()
    },

    /**
     * 更新時段
     */
    updateTimeOfDay() {
      const hour = new Date().getHours()

      if (hour >= 5 && hour < 12) {
        this.timeOfDay = 'morning'
      } else if (hour >= 12 && hour < 17) {
        this.timeOfDay = 'afternoon'
      } else if (hour >= 17 && hour < 22) {
        this.timeOfDay = 'evening'
      } else {
        this.timeOfDay = 'night'
      }
    },

    /**
     * 解鎖稱號
     */
    unlockTitle(title: string) {
      if (!this.unlockedTitles.includes(title)) {
        this.unlockedTitles.push(title)
        this.saveToStorage()
      }
    },

    /**
     * 設置當前稱號
     */
    setCurrentTitle(title: string) {
      this.currentTitle = title
      this.saveToStorage()
    },

    /**
     * 保存到 localStorage
     */
    saveToStorage() {
      const data = {
        playerId: this.playerId,
        username: this.username,
        heartCount: this.heartCount,
        totalHearts: this.totalHearts,
        musicEnabled: this.musicEnabled,
        soundEnabled: this.soundEnabled,
        currentTitle: this.currentTitle,
        unlockedTitles: this.unlockedTitles
      }

      localStorage.setItem('gameState', JSON.stringify(data))
    },

    /**
     * 從 localStorage 載入
     */
    loadFromStorage() {
      const stored = localStorage.getItem('gameState')
      if (!stored) return

      try {
        const data = JSON.parse(stored)

        if (data.playerId) this.playerId = data.playerId
        if (data.username) this.username = data.username
        if (data.heartCount !== undefined) this.heartCount = data.heartCount
        if (data.totalHearts !== undefined) this.totalHearts = data.totalHearts
        if (data.musicEnabled !== undefined) this.musicEnabled = data.musicEnabled
        if (data.soundEnabled !== undefined) this.soundEnabled = data.soundEnabled
        if (data.currentTitle) this.currentTitle = data.currentTitle
        if (data.unlockedTitles) this.unlockedTitles = data.unlockedTitles
      } catch (error) {
        console.error('載入遊戲狀態失敗:', error)
      }
    },

    /**
     * 重置遊戲狀態
     */
    reset() {
      this.heartCount = 0
      this.totalHearts = 0
      this.inMoonWorld = false
      this.bossHealth = 0
      localStorage.removeItem('gameState')
    }
  }
})

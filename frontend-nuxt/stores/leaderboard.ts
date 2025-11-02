import { defineStore } from 'pinia'
import type { Player } from '~/types/api'

/**
 * 排行榜狀態管理
 */
export const useLeaderboardStore = defineStore('leaderboard', {
  state: () => ({
    // 排行榜數據
    players: [] as Player[],
    total: 0 as number,

    // 分頁
    currentPage: 1 as number,
    limit: 100 as number,

    // 載入狀態
    loading: false as boolean,
    error: null as string | null,

    // 自動刷新
    autoRefresh: true as boolean,
    refreshInterval: 5000 as number, // 5 秒（從原本的 2 秒調整）

    // 個人數據
    myRank: null as number | null,
    myPlayer: null as Player | null
  }),

  getters: {
    /**
     * 獲取前 3 名玩家
     */
    topThreePlayers(): Player[] {
      return this.players.slice(0, 3)
    },

    /**
     * 檢查是否有數據
     */
    hasPlayers(): boolean {
      return this.players.length > 0
    },

    /**
     * 獲取我的排名顯示文字
     */
    myRankText(): string {
      if (this.myRank === null) return '--'
      return `#${this.myRank}`
    }
  },

  actions: {
    /**
     * 獲取排行榜數據
     */
    async fetchLeaderboard(page?: number, limit?: number) {
      this.loading = true
      this.error = null

      try {
        const api = useAPI()
        const response = await api.getLeaderboard(
          page || this.currentPage,
          limit || this.limit
        )

        if (response.success) {
          this.players = response.players
          this.total = response.total

          if (response.page) this.currentPage = response.page
          if (response.limit) this.limit = response.limit
        }
      } catch (err: any) {
        this.error = err.message || '獲取排行榜失敗'
        console.error('獲取排行榜失敗:', err)
      } finally {
        this.loading = false
      }
    },

    /**
     * 獲取個人排名
     */
    async fetchMyRank(playerId: string) {
      try {
        const api = useAPI()
        const response = await api.getMyRank(playerId)

        this.myRank = response.rank
        this.myPlayer = response.player
      } catch (err: any) {
        console.error('獲取個人排名失敗:', err)
      }
    },

    /**
     * 提交分數（樂觀更新）
     */
    async submitScore(playerId: string, username: string, score: number) {
      try {
        const api = useAPI()

        // 樂觀更新：先更新 UI
        const existingPlayerIndex = this.players.findIndex(p => p.id === playerId)
        if (existingPlayerIndex !== -1) {
          this.players[existingPlayerIndex].score = score
          this.players[existingPlayerIndex].username = username
        }

        // 提交到後端
        const response = await api.submitScore({
          player_id: playerId,
          username,
          score
        })

        if (response.success) {
          // 刷新排行榜以獲取正確的排名
          await this.fetchLeaderboard()

          // 刷新個人排名
          await this.fetchMyRank(playerId)
        }

        return response
      } catch (err: any) {
        // 失敗時重新獲取數據（回滾樂觀更新）
        await this.fetchLeaderboard()
        throw err
      }
    },

    /**
     * 更新用戶名
     */
    async updateUsername(playerId: string, username: string) {
      try {
        const api = useAPI()

        // 樂觀更新
        const player = this.players.find(p => p.id === playerId)
        if (player) {
          player.username = username
        }

        // 提交到後端
        const response = await api.updateUsername({ player_id: playerId, username })

        if (response.success && response.player) {
          // 更新本地數據
          const index = this.players.findIndex(p => p.id === playerId)
          if (index !== -1) {
            this.players[index] = response.player
          }

          if (this.myPlayer && this.myPlayer.id === playerId) {
            this.myPlayer = response.player
          }
        }

        return response
      } catch (err: any) {
        // 失敗時重新獲取數據
        await this.fetchLeaderboard()
        throw err
      }
    },

    /**
     * 啟動自動刷新
     */
    startAutoRefresh() {
      this.autoRefresh = true
    },

    /**
     * 停止自動刷新
     */
    stopAutoRefresh() {
      this.autoRefresh = false
    },

    /**
     * 設置刷新間隔
     */
    setRefreshInterval(ms: number) {
      this.refreshInterval = ms
    },

    /**
     * 清空數據
     */
    clear() {
      this.players = []
      this.total = 0
      this.myRank = null
      this.myPlayer = null
      this.error = null
    }
  }
})

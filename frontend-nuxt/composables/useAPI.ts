import type {
  LeaderboardResponse,
  SubmitScoreRequest,
  SubmitScoreResponse,
  UpdateUsernameRequest,
  UploadAvatarResponse,
  TitlesResponse,
  Player
} from '~/types/api'

/**
 * API 調用封裝
 * 統一管理所有後端 API 請求
 */
export const useAPI = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  /**
   * 獲取排行榜
   * @param page 頁碼（可選）
   * @param limit 每頁數量（可選）
   */
  const getLeaderboard = async (page?: number, limit?: number): Promise<LeaderboardResponse> => {
    try {
      const query = new URLSearchParams()
      if (page) query.append('page', page.toString())
      if (limit) query.append('limit', limit.toString())

      const url = `${baseURL}/leaderboard${query.toString() ? '?' + query.toString() : ''}`

      return await $fetch<LeaderboardResponse>(url, {
        method: 'GET'
      })
    } catch (error) {
      console.error('獲取排行榜失敗:', error)
      throw error
    }
  }

  /**
   * 獲取個人排名
   * @param playerId 玩家 ID
   */
  const getMyRank = async (playerId: string): Promise<{ rank: number; player: Player }> => {
    try {
      return await $fetch(`${baseURL}/leaderboard/my-rank/${playerId}`, {
        method: 'GET'
      })
    } catch (error) {
      console.error('獲取個人排名失敗:', error)
      throw error
    }
  }

  /**
   * 提交分數
   * @param data 分數資料
   */
  const submitScore = async (data: SubmitScoreRequest): Promise<SubmitScoreResponse> => {
    try {
      return await $fetch<SubmitScoreResponse>(`${baseURL}/leaderboard/submit`, {
        method: 'POST',
        body: data
      })
    } catch (error) {
      console.error('提交分數失敗:', error)
      throw error
    }
  }

  /**
   * 更新用戶名
   * @param data 用戶名資料
   */
  const updateUsername = async (data: UpdateUsernameRequest): Promise<{ success: boolean; player: Player }> => {
    try {
      return await $fetch(`${baseURL}/leaderboard/username`, {
        method: 'PUT',
        body: data
      })
    } catch (error) {
      console.error('更新用戶名失敗:', error)
      throw error
    }
  }

  /**
   * 上傳大頭貼
   * @param playerId 玩家 ID
   * @param file 圖片文件
   */
  const uploadAvatar = async (playerId: string, file: File): Promise<UploadAvatarResponse> => {
    try {
      const formData = new FormData()
      formData.append('player_id', playerId)
      formData.append('avatar', file)

      return await $fetch<UploadAvatarResponse>(`${baseURL}/leaderboard/avatar`, {
        method: 'POST',
        body: formData
      })
    } catch (error) {
      console.error('上傳大頭貼失敗:', error)
      throw error
    }
  }

  /**
   * 獲取玩家稱號
   * @param playerId 玩家 ID
   */
  const getTitles = async (playerId: string): Promise<TitlesResponse> => {
    try {
      return await $fetch<TitlesResponse>(`${baseURL}/leaderboard/titles/${playerId}`, {
        method: 'GET'
      })
    } catch (error) {
      console.error('獲取稱號失敗:', error)
      throw error
    }
  }

  /**
   * 檢查是否為第一名
   * @param playerId 玩家 ID
   */
  const checkFirstPlace = async (playerId: string): Promise<{ isFirst: boolean; reward?: any }> => {
    try {
      return await $fetch(`${baseURL}/leaderboard/check-first?player_id=${playerId}`, {
        method: 'GET'
      })
    } catch (error) {
      console.error('檢查第一名失敗:', error)
      throw error
    }
  }

  /**
   * ============================================
   * 許願池 API
   * ============================================
   */

  /**
   * 獲取許願列表
   * @param page 頁碼
   * @param limit 每頁數量
   */
  const getWishes = async (page = 1, limit = 10) => {
    try {
      return await $fetch(`${baseURL}/wishes?page=${page}&limit=${limit}`, {
        method: 'GET'
      })
    } catch (error) {
      console.error('獲取許願列表失敗:', error)
      throw error
    }
  }

  /**
   * 提交許願
   * @param data 許願資料 { player_id, username, content }
   */
  const createWish = async (data: { player_id: string; username: string; content: string }) => {
    try {
      return await $fetch(`${baseURL}/wishes`, {
        method: 'POST',
        body: data
      })
    } catch (error) {
      console.error('提交許願失敗:', error)
      throw error
    }
  }

  /**
   * 點讚/取消點讚
   * @param wishId 許願 ID
   * @param playerId 玩家 ID
   * @param action 'like' | 'unlike'
   */
  const likeWish = async (wishId: string, playerId: string, action: 'like' | 'unlike') => {
    try {
      return await $fetch(`${baseURL}/wishes/${wishId}/like`, {
        method: 'POST',
        body: { player_id: playerId, action }
      })
    } catch (error) {
      console.error('點讚失敗:', error)
      throw error
    }
  }

  /**
   * 獲取我的許願歷史
   * @param playerId 玩家 ID
   */
  const getMyWishes = async (playerId: string) => {
    try {
      return await $fetch(`${baseURL}/wishes/my/${playerId}`, {
        method: 'GET'
      })
    } catch (error) {
      console.error('獲取我的許願失敗:', error)
      throw error
    }
  }

  /**
   * 刪除許願
   * @param wishId 許願 ID
   * @param playerId 玩家 ID
   */
  const deleteWish = async (wishId: string, playerId: string) => {
    try {
      return await $fetch(`${baseURL}/wishes/${wishId}?player_id=${playerId}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('刪除許願失敗:', error)
      throw error
    }
  }

  /**
   * ============================================
   * 意見回饋 API
   * ============================================
   */

  /**
   * 提交意見回饋
   * @param data 回饋資料 { player_id, username, category, message }
   */
  const submitFeedback = async (data: {
    player_id: string
    username: string
    category: 'bug' | 'feature' | 'combat' | 'other'
    message: string
  }) => {
    try {
      return await $fetch(`${baseURL}/feedback`, {
        method: 'POST',
        body: data
      })
    } catch (error) {
      console.error('提交回饋失敗:', error)
      throw error
    }
  }

  /**
   * 獲取我的回饋歷史
   * @param playerId 玩家 ID
   * @param limit 數量限制
   */
  const getMyFeedback = async (playerId: string, limit = 10) => {
    try {
      return await $fetch(`${baseURL}/feedback/my/${playerId}?limit=${limit}`, {
        method: 'GET'
      })
    } catch (error) {
      console.error('獲取回饋歷史失敗:', error)
      throw error
    }
  }

  /**
   * 獲取所有回饋（管理員）
   * @param page 頁碼
   * @param limit 每頁數量
   * @param status 狀態篩選
   * @param category 類型篩選
   */
  const getAllFeedback = async (page = 1, limit = 20, status?: string, category?: string) => {
    try {
      const query = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
      if (status) query.append('status', status)
      if (category) query.append('category', category)

      return await $fetch(`${baseURL}/feedback?${query.toString()}`, {
        method: 'GET'
      })
    } catch (error) {
      console.error('獲取回饋列表失敗:', error)
      throw error
    }
  }

  /**
   * 更新回饋狀態（管理員）
   * @param feedbackId 回饋 ID
   * @param status 新狀態
   */
  const updateFeedbackStatus = async (feedbackId: string, status: 'pending' | 'reviewed' | 'resolved') => {
    try {
      return await $fetch(`${baseURL}/feedback/${feedbackId}/status`, {
        method: 'PUT',
        body: { status }
      })
    } catch (error) {
      console.error('更新回饋狀態失敗:', error)
      throw error
    }
  }

  /**
   * 獲取回饋統計（管理員）
   */
  const getFeedbackStats = async () => {
    try {
      return await $fetch(`${baseURL}/feedback/stats`, {
        method: 'GET'
      })
    } catch (error) {
      console.error('獲取回饋統計失敗:', error)
      throw error
    }
  }

  return {
    // 排行榜
    getLeaderboard,
    getMyRank,
    submitScore,
    updateUsername,
    uploadAvatar,
    getTitles,
    checkFirstPlace,

    // 許願池
    getWishes,
    createWish,
    likeWish,
    getMyWishes,
    deleteWish,

    // 意見回饋
    submitFeedback,
    getMyFeedback,
    getAllFeedback,
    updateFeedbackStatus,
    getFeedbackStats
  }
}

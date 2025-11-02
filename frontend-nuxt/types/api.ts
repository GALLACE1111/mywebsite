// API 相關的 TypeScript 類型定義

/**
 * 玩家資料
 */
export interface Player {
  id: string
  username: string
  score: number
  avatar_url?: string
  title?: string
  created_at: string
  updated_at: string
  rank?: number
}

/**
 * 排行榜回應
 */
export interface LeaderboardResponse {
  success: boolean
  players: Player[]
  total: number
  page?: number
  limit?: number
}

/**
 * 提交分數請求
 */
export interface SubmitScoreRequest {
  player_id?: string
  username?: string
  score: number
}

/**
 * 提交分數回應
 */
export interface SubmitScoreResponse {
  success: boolean
  player: Player
  message?: string
}

/**
 * 更新用戶名請求
 */
export interface UpdateUsernameRequest {
  player_id: string
  username: string
}

/**
 * 上傳大頭貼回應
 */
export interface UploadAvatarResponse {
  success: boolean
  avatar_url: string
  message?: string
}

/**
 * 稱號資料
 */
export interface Title {
  id: string
  name: string
  description?: string
  icon?: string
  unlocked_at: string
}

/**
 * 稱號回應
 */
export interface TitlesResponse {
  success: boolean
  titles: Title[]
}

/**
 * API 錯誤回應
 */
export interface ApiError {
  success: false
  error: string
  message?: string
}

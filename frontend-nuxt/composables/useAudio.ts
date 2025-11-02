/**
 * 音效和音樂管理 Composable
 * 統一管理所有音效和背景音樂
 */
export const useAudio = () => {
  const gameStore = useGameStore()

  // 音效緩存
  const audioCache = new Map<string, HTMLAudioElement>()

  // 當前播放的背景音樂
  let currentMusic: HTMLAudioElement | null = null

  /**
   * 播放音效
   * @param soundName 音效名稱（不含副檔名）
   */
  const playSound = (soundName: string) => {
    if (!gameStore.soundEnabled) return

    try {
      let audio = audioCache.get(soundName)

      if (!audio) {
        audio = new Audio(`/audio/${soundName}.mp3`)
        audioCache.set(soundName, audio)
      }

      // 重置播放位置並播放
      audio.currentTime = 0
      audio.play().catch(err => {
        console.warn(`播放音效失敗 (${soundName}):`, err.message)
      })
    } catch (error) {
      console.error(`載入音效失敗 (${soundName}):`, error)
    }
  }

  /**
   * 播放背景音樂
   * @param musicName 音樂名稱（不含副檔名）
   * @param loop 是否循環播放
   * @param volume 音量 (0-1)
   */
  const playMusic = (musicName: string, loop = true, volume = 0.5) => {
    if (!gameStore.musicEnabled) return

    try {
      // 停止當前音樂
      if (currentMusic) {
        currentMusic.pause()
        currentMusic = null
      }

      // 創建新音樂
      const music = new Audio(`/audio/${musicName}.mp3`)
      music.loop = loop
      music.volume = volume

      music.play().catch(err => {
        console.warn(`播放音樂失敗 (${musicName}):`, err.message)
      })

      currentMusic = music
      return music
    } catch (error) {
      console.error(`載入音樂失敗 (${musicName}):`, error)
    }
  }

  /**
   * 停止背景音樂
   */
  const stopMusic = () => {
    if (currentMusic) {
      currentMusic.pause()
      currentMusic.currentTime = 0
      currentMusic = null
    }
  }

  /**
   * 暫停背景音樂
   */
  const pauseMusic = () => {
    if (currentMusic) {
      currentMusic.pause()
    }
  }

  /**
   * 恢復背景音樂
   */
  const resumeMusic = () => {
    if (currentMusic && gameStore.musicEnabled) {
      currentMusic.play().catch(err => {
        console.warn('恢復音樂失敗:', err.message)
      })
    }
  }

  /**
   * 設置音樂音量
   * @param volume 音量 (0-1)
   */
  const setMusicVolume = (volume: number) => {
    if (currentMusic) {
      currentMusic.volume = Math.max(0, Math.min(1, volume))
    }
  }

  /**
   * 預載入音效
   * @param soundNames 音效名稱陣列
   */
  const preloadSounds = (soundNames: string[]) => {
    soundNames.forEach(name => {
      if (!audioCache.has(name)) {
        const audio = new Audio(`/audio/${name}.mp3`)
        audio.preload = 'auto'
        audioCache.set(name, audio)
      }
    })
  }

  /**
   * 清除音效緩存
   */
  const clearCache = () => {
    audioCache.forEach(audio => {
      audio.pause()
      audio.src = ''
    })
    audioCache.clear()
  }

  // 組件卸載時清理
  onUnmounted(() => {
    stopMusic()
  })

  return {
    playSound,
    playMusic,
    stopMusic,
    pauseMusic,
    resumeMusic,
    setMusicVolume,
    preloadSounds,
    clearCache
  }
}

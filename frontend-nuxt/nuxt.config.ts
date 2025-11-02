// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Pinia 狀態管理
  modules: ['@pinia/nuxt'],

  // Runtime 配置
  runtimeConfig: {
    public: {
      // API 基礎 URL
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000/api',
      // Firebase 專案 ID
      firebaseProjectId: 'side-project-663de'
    }
  },

  // CSS 配置
  css: [
    '~/assets/css/global.css'
  ],

  // App 配置
  app: {
    head: {
      title: '愛心互動遊戲 - 收集愛心、挑戰 Boss、登上排行榜',
      titleTemplate: '%s | 愛心互動遊戲',
      meta: [
        // 基本 Meta
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },

        // SEO Meta
        { name: 'description', content: '一款充滿愛心的互動網頁遊戲！點擊收集愛心、探索月球世界、挑戰血月守護者、使用專注鬧鐘提升效率。完整的社交功能包括許願池、排行榜競爭，還有個人資料自定義。立即開始你的冒險！' },
        { name: 'keywords', content: '愛心遊戲,網頁遊戲,互動遊戲,Boss戰鬥,排行榜,許願池,專注鬧鐘,番茄鐘,月球世界,血月守護者,社交遊戲,收集遊戲' },
        { name: 'author', content: '愛心互動遊戲團隊' },
        { name: 'robots', content: 'index, follow' },

        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://your-domain.com/' },
        { property: 'og:title', content: '愛心互動遊戲 - 收集愛心、挑戰 Boss、登上排行榜' },
        { property: 'og:description', content: '一款充滿愛心的互動網頁遊戲！點擊收集愛心、探索月球世界、挑戰血月守護者。完整的社交功能包括許願池、排行榜競爭。' },
        { property: 'og:image', content: 'https://your-domain.com/og-image.jpg' },
        { property: 'og:locale', content: 'zh_TW' },
        { property: 'og:site_name', content: '愛心互動遊戲' },

        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:url', content: 'https://your-domain.com/' },
        { name: 'twitter:title', content: '愛心互動遊戲 - 收集愛心、挑戰 Boss、登上排行榜' },
        { name: 'twitter:description', content: '一款充滿愛心的互動網頁遊戲！點擊收集愛心、探索月球世界、挑戰血月守護者。' },
        { name: 'twitter:image', content: 'https://your-domain.com/og-image.jpg' },

        // Mobile Web App
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: '愛心遊戲' },

        // Theme Color
        { name: 'theme-color', content: '#667eea' },
        { name: 'msapplication-TileColor', content: '#667eea' }
      ],
      link: [
        // Favicon
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' },

        // Canonical URL
        { rel: 'canonical', href: 'https://your-domain.com/' }
      ]
    }
  }
})

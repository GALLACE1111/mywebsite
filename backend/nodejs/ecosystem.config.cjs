/**
 * PM2 配置文件
 * 用於長期運行 Node.js 應用
 *
 * 使用方式：
 * 1. 安裝 PM2: npm install -g pm2
 * 2. 啟動應用: pm2 start ecosystem.config.cjs
 * 3. 查看狀態: pm2 status
 * 4. 查看日誌: pm2 logs leaderboard-api
 * 5. 停止應用: pm2 stop leaderboard-api
 * 6. 重啟應用: pm2 restart leaderboard-api
 * 7. 開機自啟: pm2 startup && pm2 save
 */

module.exports = {
  apps: [{
    // 應用名稱
    name: 'leaderboard-api',

    // 啟動腳本
    script: 'server.js',

    // 工作目錄
    cwd: './',

    // 運行模式: fork（單進程）或 cluster（多進程）
    exec_mode: 'fork',

    // 實例數量（cluster 模式下有效）
    instances: 1,

    // 自動重啟
    autorestart: true,

    // 監聽文件變化（開發環境）
    watch: false,

    // 最大內存限制（超過會自動重啟）
    max_memory_restart: '500M',

    // 環境變數（開發環境）
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },

    // 環境變數（生產環境）
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },

    // 日誌設定
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

    // 合併日誌
    merge_logs: true,

    // 延遲重啟時間（毫秒）
    restart_delay: 4000,

    // 最小運行時間（小於此時間崩潰視為異常）
    min_uptime: '10s',

    // 最大重啟次數（在 min_uptime 內）
    max_restarts: 10,

    // 優雅關閉超時時間
    kill_timeout: 5000,

    // Node.js 參數
    node_args: '--max-old-space-size=512'
  }]
};

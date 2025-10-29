// Firebase 配置文件
// 部署後請更新 API_BASE_URL 為您的 Cloud Functions URL

const CONFIG = {
    // 開發環境
    development: {
        API_BASE_URL: 'http://localhost:3000/api'
    },

    // 生產環境 - 請替換為您的 Firebase Cloud Functions URL
    production: {
        // 格式: https://REGION-PROJECT_ID.cloudfunctions.net/api
        // 例如: https://us-central1-my-project.cloudfunctions.net/api
        API_BASE_URL: 'https://REGION-PROJECT_ID.cloudfunctions.net/api'
    }
};

// 自動檢測環境
const isProduction = window.location.hostname !== 'localhost' &&
                     window.location.hostname !== '127.0.0.1' &&
                     !window.location.hostname.includes('192.168');

// 導出當前環境配置
const currentConfig = isProduction ? CONFIG.production : CONFIG.development;

// 如果在全局作用域,導出到 window
if (typeof window !== 'undefined') {
    window.APP_CONFIG = currentConfig;
}

// 使用說明:
// 在其他 JS 文件中,使用 window.APP_CONFIG.API_BASE_URL 來獲取 API 基礎 URL

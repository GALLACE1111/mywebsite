-- ===================================
-- 簡化版愛心分數排行榜資料庫結構
-- ===================================

-- 建立資料庫
CREATE DATABASE IF NOT EXISTS leaderboard_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE leaderboard_db;

-- ===================================
-- 用戶表（簡化版：只需要ID和名稱）
-- ===================================
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 愛心分數記錄表
-- ===================================
CREATE TABLE IF NOT EXISTS love_scores (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    love_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '愛心數量',
    action_type VARCHAR(50) DEFAULT 'default' COMMENT '遊戲類型',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 外鍵
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- 索引優化
    INDEX idx_user_id (user_id),
    INDEX idx_love_count (love_count DESC),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_user_action (user_id, action_type, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 用戶總愛心數快取表（優化查詢）
-- ===================================
CREATE TABLE IF NOT EXISTS user_total_loves (
    user_id INT UNSIGNED NOT NULL PRIMARY KEY,
    total_loves INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '總愛心數',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_total_loves (total_loves DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 插入測試資料
-- ===================================

-- 插入測試用戶（簡化版：只有用戶名）
INSERT INTO users (id, username) VALUES
(1, 'Alice'),
(2, 'Bob'),
(3, 'Charlie')
ON DUPLICATE KEY UPDATE username=username;

-- 插入測試愛心記錄
INSERT INTO love_scores (user_id, love_count, action_type, created_at) VALUES
-- Alice 的愛心記錄
(1, 150, 'default', DATE_SUB(NOW(), INTERVAL 0 DAY)),
(1, 120, 'default', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 80, 'default', DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Bob 的愛心記錄
(2, 200, 'default', DATE_SUB(NOW(), INTERVAL 0 DAY)),
(2, 95, 'default', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Charlie 的愛心記錄
(3, 175, 'default', DATE_SUB(NOW(), INTERVAL 0 DAY)),
(3, 100, 'default', DATE_SUB(NOW(), INTERVAL 3 DAY));

-- 更新總愛心數表
INSERT INTO user_total_loves (user_id, total_loves)
SELECT
    user_id,
    SUM(love_count) as total_loves
FROM love_scores
GROUP BY user_id
ON DUPLICATE KEY UPDATE
    total_loves = VALUES(total_loves);

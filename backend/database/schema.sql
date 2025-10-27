-- ===================================
-- 愛心分數排行榜資料庫結構
-- ===================================

-- 建立資料庫（如果需要）
-- CREATE DATABASE IF NOT EXISTS leaderboard_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE leaderboard_db;

-- ===================================
-- 用戶表
-- ===================================
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 愛心分數記錄表
-- ===================================
CREATE TABLE IF NOT EXISTS love_scores (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    love_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '愛心數量',
    action_type VARCHAR(50) DEFAULT 'click' COMMENT '行為類型（點擊、戰鬥勝利等）',
    metadata JSON DEFAULT NULL COMMENT '額外資料（位置、時間等）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 外鍵
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- 索引優化
    INDEX idx_user_id (user_id),
    INDEX idx_love_count (love_count DESC),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_action_type (action_type),
    INDEX idx_composite (action_type, love_count DESC, created_at DESC),
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

-- 插入測試用戶
INSERT INTO users (username, email, password_hash, avatar_url) VALUES
('Alice', 'alice@example.com', '$2y$10$examplehash1', 'https://i.pravatar.cc/150?img=1'),
('Bob', 'bob@example.com', '$2y$10$examplehash2', 'https://i.pravatar.cc/150?img=2'),
('Charlie', 'charlie@example.com', '$2y$10$examplehash3', 'https://i.pravatar.cc/150?img=3'),
('Diana', 'diana@example.com', '$2y$10$examplehash4', 'https://i.pravatar.cc/150?img=4'),
('Eve', 'eve@example.com', '$2y$10$examplehash5', 'https://i.pravatar.cc/150?img=5'),
('Frank', 'frank@example.com', '$2y$10$examplehash6', 'https://i.pravatar.cc/150?img=6'),
('Grace', 'grace@example.com', '$2y$10$examplehash7', 'https://i.pravatar.cc/150?img=7'),
('Henry', 'henry@example.com', '$2y$10$examplehash8', 'https://i.pravatar.cc/150?img=8'),
('Ivy', 'ivy@example.com', '$2y$10$examplehash9', 'https://i.pravatar.cc/150?img=9'),
('Jack', 'jack@example.com', '$2y$10$examplehash10', 'https://i.pravatar.cc/150?img=10')
ON DUPLICATE KEY UPDATE username=username;

-- 插入測試愛心記錄（最近 7 天）
INSERT INTO love_scores (user_id, love_count, action_type, created_at) VALUES
-- Alice 的愛心記錄
(1, 150, 'click', DATE_SUB(NOW(), INTERVAL 0 DAY)),
(1, 120, 'click', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 80, 'boss_victory', DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Bob 的愛心記錄
(2, 200, 'click', DATE_SUB(NOW(), INTERVAL 0 DAY)),
(2, 95, 'click', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Charlie 的愛心記錄
(3, 175, 'click', DATE_SUB(NOW(), INTERVAL 0 DAY)),
(3, 100, 'boss_victory', DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- Diana 的愛心記錄
(4, 130, 'click', DATE_SUB(NOW(), INTERVAL 0 DAY)),

-- Eve 的愛心記錄
(5, 250, 'click', DATE_SUB(NOW(), INTERVAL 0 DAY)),
(5, 140, 'click', DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Frank 的愛心記錄
(6, 90, 'click', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Grace 的愛心記錄
(7, 180, 'click', DATE_SUB(NOW(), INTERVAL 0 DAY)),

-- Henry 的愛心記錄
(8, 110, 'click', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Ivy 的愛心記錄
(9, 220, 'click', DATE_SUB(NOW(), INTERVAL 0 DAY)),

-- Jack 的愛心記錄
(10, 160, 'click', DATE_SUB(NOW(), INTERVAL 0 DAY));

-- 更新總愛心數表
INSERT INTO user_total_loves (user_id, total_loves)
SELECT
    user_id,
    SUM(love_count) as total_loves
FROM love_scores
GROUP BY user_id
ON DUPLICATE KEY UPDATE
    total_loves = VALUES(total_loves);

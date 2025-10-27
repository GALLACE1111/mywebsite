-- ===================================
-- 分數排行榜資料庫結構
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
-- 分數記錄表
-- ===================================
CREATE TABLE IF NOT EXISTS scores (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    score INT UNSIGNED NOT NULL DEFAULT 0,
    game_type VARCHAR(50) DEFAULT 'default' COMMENT '遊戲類型（可擴展多種遊戲）',
    metadata JSON DEFAULT NULL COMMENT '額外資料（如關卡、時間等）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 外鍵
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- 索引優化
    INDEX idx_user_id (user_id),
    INDEX idx_score (score DESC),
    INDEX idx_created_at (created_at DESC),
    INDEX idx_game_type (game_type),
    INDEX idx_composite (game_type, score DESC, created_at DESC),
    INDEX idx_user_game (user_id, game_type, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================
-- 用戶最高分數快取表（優化查詢）
-- ===================================
CREATE TABLE IF NOT EXISTS user_best_scores (
    user_id INT UNSIGNED NOT NULL,
    game_type VARCHAR(50) NOT NULL DEFAULT 'default',
    best_score INT UNSIGNED NOT NULL DEFAULT 0,
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (user_id, game_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    INDEX idx_best_score (game_type, best_score DESC)
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

-- 插入測試分數（最近 7 天的隨機分數）
INSERT INTO scores (user_id, score, game_type, created_at) VALUES
-- Alice 的分數
(1, 9500, 'default', DATE_SUB(NOW(), INTERVAL 0 DAY)),
(1, 8800, 'default', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 9200, 'default', DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Bob 的分數
(2, 9300, 'default', DATE_SUB(NOW(), INTERVAL 0 DAY)),
(2, 8500, 'default', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Charlie 的分數
(3, 8900, 'default', DATE_SUB(NOW(), INTERVAL 0 DAY)),
(3, 9100, 'default', DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- Diana 的分數
(4, 8700, 'default', DATE_SUB(NOW(), INTERVAL 0 DAY)),

-- Eve 的分數
(5, 9800, 'default', DATE_SUB(NOW(), INTERVAL 0 DAY)),
(5, 9600, 'default', DATE_SUB(NOW(), INTERVAL 2 DAY)),

-- Frank 的分數
(6, 8400, 'default', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Grace 的分數
(7, 9000, 'default', DATE_SUB(NOW(), INTERVAL 0 DAY)),

-- Henry 的分數
(8, 8200, 'default', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Ivy 的分數
(9, 9400, 'default', DATE_SUB(NOW(), INTERVAL 0 DAY)),

-- Jack 的分數
(10, 8600, 'default', DATE_SUB(NOW(), INTERVAL 0 DAY));

-- 更新最佳分數表
INSERT INTO user_best_scores (user_id, game_type, best_score, achieved_at)
SELECT
    user_id,
    game_type,
    MAX(score) as best_score,
    MAX(created_at) as achieved_at
FROM scores
GROUP BY user_id, game_type
ON DUPLICATE KEY UPDATE
    best_score = VALUES(best_score),
    achieved_at = VALUES(achieved_at);

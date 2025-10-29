-- ===============================================
-- 常用 SQL 查詢集合 - 排行榜系統
-- ===============================================
-- 使用方法：複製需要的 SQL 指令，貼到 MySQL 中執行

-- ===============================================
-- 1. 查看資料
-- ===============================================

-- 查看排行榜（前 10 名）
SELECT
    u.username AS 用戶名,
    t.total_loves AS 總分數
FROM user_total_loves t
INNER JOIN users u ON t.user_id = u.id
ORDER BY t.total_loves DESC
LIMIT 10;

-- 查看所有用戶
SELECT * FROM users;

-- 查看最近 20 筆分數記錄
SELECT
    s.id,
    u.username,
    s.love_count,
    s.created_at
FROM love_scores s
INNER JOIN users u ON s.user_id = u.id
ORDER BY s.created_at DESC
LIMIT 20;

-- 查詢特定用戶的排名
SELECT
    u.username,
    t.total_loves,
    (SELECT COUNT(*) + 1 FROM user_total_loves WHERE total_loves > t.total_loves) AS ranking
FROM user_total_loves t
JOIN users u ON t.user_id = u.id
WHERE t.user_id = 1;  -- 改成你要查的 user_id

-- ===============================================
-- 2. 新增資料
-- ===============================================

-- 新增測試用戶
INSERT INTO users (id, username) VALUES (10, '測試用戶10');

-- 新增多個測試用戶
INSERT INTO users (id, username) VALUES
(11, '測試用戶11'),
(12, '測試用戶12'),
(13, '測試用戶13');

-- 手動新增分數記錄
INSERT INTO love_scores (user_id, love_count, action_type, created_at)
VALUES (1, 100, 'default', NOW());

-- 手動更新總分數
INSERT INTO user_total_loves (user_id, total_loves, last_updated)
VALUES (1, 100, NOW())
ON DUPLICATE KEY UPDATE
    total_loves = total_loves + 100,
    last_updated = NOW();

-- ===============================================
-- 3. 修改資料
-- ===============================================

-- 修改用戶名稱
UPDATE users SET username = '新名字' WHERE id = 1;

-- 修改總分數
UPDATE user_total_loves SET total_loves = 1000 WHERE user_id = 1;

-- ===============================================
-- 4. 刪除資料
-- ===============================================

-- 刪除特定用戶
DELETE FROM users WHERE id = 10;

-- 刪除特定分數記錄
DELETE FROM love_scores WHERE id = 100;

-- 清空排行榜（保留用戶）
TRUNCATE TABLE love_scores;
TRUNCATE TABLE user_total_loves;

-- ===============================================
-- 5. 統計查詢
-- ===============================================

-- 統計每個用戶的提交次數和總分
SELECT
    u.username,
    COUNT(s.id) AS 提交次數,
    SUM(s.love_count) AS 總分數
FROM love_scores s
INNER JOIN users u ON s.user_id = u.id
GROUP BY u.id, u.username
ORDER BY 總分數 DESC;

-- 查看資料表的資料量
SELECT
    '用戶數' AS 項目,
    COUNT(*) AS 數量
FROM users
UNION ALL
SELECT
    '分數記錄數',
    COUNT(*)
FROM love_scores
UNION ALL
SELECT
    '排行榜人數',
    COUNT(*)
FROM user_total_loves;

-- ===============================================
-- 6. 驗證 API 提交的資料
-- ===============================================

-- 在測試頁面提交分數後，執行以下查詢驗證

-- 1. 查看該用戶的總分是否更新
SELECT * FROM user_total_loves WHERE user_id = 1;

-- 2. 查看最新的分數記錄
SELECT * FROM love_scores ORDER BY created_at DESC LIMIT 5;

-- 3. 確認排行榜順序是否正確
SELECT
    u.username,
    t.total_loves,
    (SELECT COUNT(*) + 1 FROM user_total_loves WHERE total_loves > t.total_loves) AS ranking
FROM user_total_loves t
JOIN users u ON t.user_id = u.id
ORDER BY t.total_loves DESC;

-- ===============================================
-- 7. 重置測試資料
-- ===============================================

-- 完全重置（小心使用！）
TRUNCATE TABLE love_scores;
TRUNCATE TABLE user_total_loves;
DELETE FROM users WHERE id > 3;

-- 重新載入測試資料
SOURCE D:/網頁/website/backend/database/schema-simplified.sql;

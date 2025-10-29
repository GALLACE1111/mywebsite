# SQL 基礎教學 - 排行榜專用

## 如何開啟 MySQL

```bash
mysql -u root leaderboard_db
```

成功後會看到 `mysql>` 提示符。

---

## 常用 SQL 指令

### 1. 查看排行榜

```sql
SELECT * FROM user_total_loves ORDER BY total_loves DESC;
```

### 2. 查看所有用戶

```sql
SELECT * FROM users;
```

### 3. 查看最近的分數記錄

```sql
SELECT * FROM love_scores ORDER BY created_at DESC LIMIT 10;
```

### 4. 查詢特定用戶的排名

```sql
SELECT
    u.username,
    t.total_loves,
    (SELECT COUNT(*) + 1 FROM user_total_loves WHERE total_loves > t.total_loves) AS ranking
FROM user_total_loves t
JOIN users u ON t.user_id = u.id
WHERE t.user_id = 1;
```

---

## 新增/修改/刪除

### 新增用戶

```sql
INSERT INTO users (id, username) VALUES (10, '測試用戶');
```

### 修改用戶名稱

```sql
UPDATE users SET username = '新名字' WHERE id = 1;
```

### 刪除用戶

```sql
DELETE FROM users WHERE id = 10;
```

### 清空排行榜

```sql
TRUNCATE TABLE love_scores;
TRUNCATE TABLE user_total_loves;
```

---

## 驗證 API 提交的資料

### 步驟 1: 提交分數（在測試頁面）
- 用戶 ID: 1
- 分數: 50

### 步驟 2: 用 SQL 查詢確認

```sql
-- 查看該用戶的總分
SELECT * FROM user_total_loves WHERE user_id = 1;

-- 查看最新的分數記錄
SELECT * FROM love_scores WHERE user_id = 1 ORDER BY created_at DESC LIMIT 5;
```

---

## 重要提示

1. **UPDATE/DELETE 一定要加 WHERE**，否則會影響所有資料
2. 重要操作前先用 SELECT 確認
3. 不確定時可以先備份：`mysqldump -u root leaderboard_db > backup.sql`

---

## 退出 MySQL

```sql
EXIT;
```
或按 `Ctrl + C`

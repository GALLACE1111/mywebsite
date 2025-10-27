<?php
/**
 * Redis 客戶端類別
 */
class RedisClient {
    private static $redis = null;

    public static function connect() {
        if (self::$redis !== null) {
            return self::$redis;
        }

        $config = require __DIR__ . '/../database/config.php';
        $redisConfig = $config['redis'];

        try {
            self::$redis = new Redis();
            self::$redis->connect($redisConfig['host'], $redisConfig['port']);

            if ($redisConfig['password']) {
                self::$redis->auth($redisConfig['password']);
            }

            self::$redis->select($redisConfig['database']);

            return self::$redis;
        } catch (Exception $e) {
            // Redis 連線失敗不影響主功能，記錄錯誤即可
            error_log('Redis connection failed: ' . $e->getMessage());
            return null;
        }
    }

    public static function getRedis() {
        return self::connect();
    }

    /**
     * 更新排行榜（Sorted Set）
     */
    public static function updateLeaderboard($userId, $username, $score, $gameType = 'default') {
        $redis = self::getRedis();
        if (!$redis) {
            return false;
        }

        try {
            // 獲取當前時間資訊
            $now = new DateTime();
            $today = $now->format('Y-m-d');
            $week = $now->format('Y-W');
            $month = $now->format('Y-m');

            // 用戶資料（包含 username）
            $userData = json_encode([
                'user_id' => $userId,
                'username' => $username,
                'score' => $score
            ]);

            // 更新各時段排行榜
            $keys = [
                "leaderboard:{$gameType}:all",
                "leaderboard:{$gameType}:daily:{$today}",
                "leaderboard:{$gameType}:weekly:{$week}",
                "leaderboard:{$gameType}:monthly:{$month}"
            ];

            foreach ($keys as $key) {
                // 使用 ZADD 更新分數（如果新分數更高）
                $currentScore = $redis->zScore($key, $userId);

                if ($currentScore === false || $score > $currentScore) {
                    $redis->zAdd($key, $score, $userId);

                    // 同時儲存用戶資訊（用於查詢時獲取 username）
                    $redis->hSet("user:{$userId}", 'username', $username);
                    $redis->hSet("user:{$userId}", 'score', $score);
                }
            }

            // 設定過期時間
            $redis->expire("leaderboard:{$gameType}:daily:{$today}", 86400 * 7); // 7天
            $redis->expire("leaderboard:{$gameType}:weekly:{$week}", 86400 * 30); // 30天
            $redis->expire("leaderboard:{$gameType}:monthly:{$month}", 86400 * 90); // 90天

            return true;
        } catch (Exception $e) {
            error_log('Redis update failed: ' . $e->getMessage());
            return false;
        }
    }
}

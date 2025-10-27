<?php
/**
 * 分數提交 API
 * POST /api/submit-score.php
 *
 * 請求參數：
 * - user_id: 用戶ID
 * - score: 分數
 * - game_type: 遊戲類型（可選，預設 'default'）
 * - metadata: 額外資料（可選，JSON格式）
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 處理 OPTIONS 請求（CORS 預檢）
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 只允許 POST 請求
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/RedisClient.php';

try {
    // 解析請求資料
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        $input = $_POST;
    }

    // 驗證必要參數
    if (!isset($input['user_id']) || !isset($input['score'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required parameters: user_id, score']);
        exit;
    }

    $userId = (int)$input['user_id'];
    $score = (int)$input['score'];
    $gameType = $input['game_type'] ?? 'default';
    $metadata = $input['metadata'] ?? null;

    // 驗證分數範圍
    if ($score < 0 || $score > 999999) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid score value']);
        exit;
    }

    // 連線資料庫
    $pdo = Database::getPDO();

    // 驗證用戶存在
    $stmt = $pdo->prepare("SELECT id, username FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        exit;
    }

    // 插入分數記錄
    $stmt = $pdo->prepare("
        INSERT INTO scores (user_id, score, game_type, metadata, created_at)
        VALUES (?, ?, ?, ?, NOW())
    ");

    $metadataJson = $metadata ? json_encode($metadata) : null;
    $stmt->execute([$userId, $score, $gameType, $metadataJson]);

    $scoreId = $pdo->lastInsertId();

    // 更新最佳分數
    $stmt = $pdo->prepare("
        INSERT INTO user_best_scores (user_id, game_type, best_score, achieved_at)
        VALUES (?, ?, ?, NOW())
        ON DUPLICATE KEY UPDATE
            best_score = GREATEST(best_score, ?),
            achieved_at = IF(best_score < ?, NOW(), achieved_at)
    ");
    $stmt->execute([$userId, $gameType, $score, $score, $score]);

    // 同步到 Redis
    $redisSuccess = RedisClient::updateLeaderboard(
        $userId,
        $user['username'],
        $score,
        $gameType
    );

    // 回應成功
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'data' => [
            'score_id' => $scoreId,
            'user_id' => $userId,
            'username' => $user['username'],
            'score' => $score,
            'game_type' => $gameType,
            'redis_synced' => $redisSuccess,
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}

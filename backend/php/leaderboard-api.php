<?php
/**
 * 愛心排行榜 API
 * 提供獲取排行榜、提交愛心分數等功能
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// 處理 OPTIONS 請求
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/Database.php';

// 初始化資料庫連接
$db = Database::getInstance();
$conn = $db->getConnection();

// 路由處理
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'get_leaderboard':
            getLeaderboard($conn);
            break;

        case 'submit_love':
            submitLove($conn);
            break;

        case 'get_user_rank':
            getUserRank($conn);
            break;

        default:
            sendError('Invalid action', 400);
            break;
    }
} catch (Exception $e) {
    sendError($e->getMessage(), 500);
}

/**
 * 獲取排行榜
 */
function getLeaderboard($conn) {
    $limit = intval($_GET['limit'] ?? 10);
    $limit = min($limit, 100); // 最多100筆

    $sql = "
        SELECT
            u.id,
            u.username,
            u.avatar_url,
            utl.total_loves,
            RANK() OVER (ORDER BY utl.total_loves DESC) as rank
        FROM user_total_loves utl
        JOIN users u ON utl.user_id = u.id
        ORDER BY utl.total_loves DESC
        LIMIT ?
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $limit);
    $stmt->execute();
    $result = $stmt->get_result();

    $leaderboard = [];
    while ($row = $result->fetch_assoc()) {
        $leaderboard[] = [
            'rank' => intval($row['rank']),
            'username' => $row['username'],
            'avatar_url' => $row['avatar_url'],
            'total_loves' => intval($row['total_loves'])
        ];
    }

    sendSuccess(['leaderboard' => $leaderboard]);
}

/**
 * 提交愛心分數
 */
function submitLove($conn) {
    // 讀取 POST 數據
    $input = json_decode(file_get_contents('php://input'), true);

    $username = $input['username'] ?? null;
    $love_count = intval($input['love_count'] ?? 0);
    $action_type = $input['action_type'] ?? 'click';

    if (!$username || $love_count <= 0) {
        sendError('Invalid input', 400);
        return;
    }

    // 開始事務
    $conn->begin_transaction();

    try {
        // 查找或創建用戶
        $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->bind_param('s', $username);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            $user_id = $row['id'];
        } else {
            // 創建新用戶
            $email = $username . '@temp.com';
            $password_hash = password_hash(uniqid(), PASSWORD_BCRYPT);
            $stmt = $conn->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
            $stmt->bind_param('sss', $username, $email, $password_hash);
            $stmt->execute();
            $user_id = $conn->insert_id;
        }

        // 插入愛心記錄
        $stmt = $conn->prepare("INSERT INTO love_scores (user_id, love_count, action_type) VALUES (?, ?, ?)");
        $stmt->bind_param('iis', $user_id, $love_count, $action_type);
        $stmt->execute();

        // 更新總愛心數
        $stmt = $conn->prepare("
            INSERT INTO user_total_loves (user_id, total_loves)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE total_loves = total_loves + ?
        ");
        $stmt->bind_param('iii', $user_id, $love_count, $love_count);
        $stmt->execute();

        // 獲取更新後的總愛心數
        $stmt = $conn->prepare("SELECT total_loves FROM user_total_loves WHERE user_id = ?");
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $total_loves = $row['total_loves'];

        $conn->commit();

        sendSuccess([
            'message' => 'Love score submitted successfully',
            'total_loves' => intval($total_loves)
        ]);

    } catch (Exception $e) {
        $conn->rollback();
        throw $e;
    }
}

/**
 * 獲取用戶排名
 */
function getUserRank($conn) {
    $username = $_GET['username'] ?? null;

    if (!$username) {
        sendError('Username required', 400);
        return;
    }

    $sql = "
        SELECT
            u.username,
            utl.total_loves,
            (
                SELECT COUNT(*) + 1
                FROM user_total_loves utl2
                WHERE utl2.total_loves > utl.total_loves
            ) as rank
        FROM users u
        LEFT JOIN user_total_loves utl ON u.id = utl.user_id
        WHERE u.username = ?
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        sendSuccess([
            'username' => $row['username'],
            'total_loves' => intval($row['total_loves'] ?? 0),
            'rank' => intval($row['rank'])
        ]);
    } else {
        sendError('User not found', 404);
    }
}

/**
 * 發送成功響應
 */
function sendSuccess($data) {
    echo json_encode([
        'success' => true,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * 發送錯誤響應
 */
function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $message
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

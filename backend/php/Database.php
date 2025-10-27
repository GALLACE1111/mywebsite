<?php
/**
 * 資料庫連線類別
 */
class Database {
    private static $pdo = null;

    public static function connect() {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        $config = require __DIR__ . '/../database/config.php';
        $mysql = $config['mysql'];

        $dsn = sprintf(
            "mysql:host=%s;port=%d;dbname=%s;charset=%s",
            $mysql['host'],
            $mysql['port'],
            $mysql['database'],
            $mysql['charset']
        );

        try {
            self::$pdo = new PDO($dsn, $mysql['username'], $mysql['password'], $mysql['options']);
            return self::$pdo;
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit;
        }
    }

    public static function getPDO() {
        return self::connect();
    }
}

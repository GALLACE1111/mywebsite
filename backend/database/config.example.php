<?php
/**
 * 資料庫連線配置範例
 * 請複製此檔案為 config.php 並填入實際的連線資訊
 */

return [
    'mysql' => [
        'host' => 'localhost',
        'port' => 3306,
        'database' => 'leaderboard_db',
        'username' => 'your_username',
        'password' => 'your_password',
        'charset' => 'utf8mb4',
        'options' => [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    ],

    'redis' => [
        'host' => '127.0.0.1',
        'port' => 6379,
        'password' => null,
        'database' => 0,
    ]
];

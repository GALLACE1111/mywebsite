@echo off
chcp 65001 >nul
cls
echo ===============================================
echo   簡化版排行榜系統 - 一鍵啟動
echo ===============================================
echo.

echo [1/3] 檢查 MySQL 連線...
mysql -u root -e "SELECT 1" >nul 2>&1
if errorlevel 1 (
    echo     ❌ MySQL 未啟動或連線失敗
    echo     請確認 MySQL 服務已啟動
    pause
    exit /b 1
)
echo     ✅ MySQL 連線成功

echo.
echo [2/3] 檢查資料庫...
mysql -u root leaderboard_db -e "SELECT 1" >nul 2>&1
if errorlevel 1 (
    echo     ⚠ 資料庫不存在，正在建立...
    mysql -u root < "D:\網頁\website\backend\database\schema-simplified.sql"
    echo     ✅ 資料庫建立完成
) else (
    echo     ✅ 資料庫已存在
)

echo.
echo [3/3] 啟動後端伺服器...
cd /d "D:\網頁\website\backend\nodejs"
echo     正在啟動 Node.js 伺服器...
echo.
echo ===============================================
echo   後端伺服器啟動中...
echo   API 地址: http://localhost:3000
echo   按 Ctrl+C 可停止伺服器
echo ===============================================
echo.

npm start
pause

@echo off
chcp 65001 >nul
cls
echo ===============================================
echo   MySQL 快速指令工具
echo ===============================================
echo.
echo 正在連接到 leaderboard_db 資料庫...
echo.
echo 提示：
echo   - 輸入 SQL 指令後按 Enter
echo   - 輸入 EXIT; 或按 Ctrl+C 離開
echo   - 查看教學：打開 SQL_基礎教學.md
echo.
echo ===============================================
echo.

mysql -u root leaderboard_db

echo.
echo 已離開 MySQL
pause

@echo off
chcp 65001 >nul
cls
echo ===============================================
echo   前端測試伺服器啟動腳本
echo ===============================================
echo.
echo 啟動簡單的 HTTP 伺服器...
echo.
echo 前端網址：
echo   - 主頁面：http://localhost:8080/index.html
echo   - 測試頁面：http://localhost:8080/leaderboard-test.html
echo.
echo 提示：
echo   - 按 Ctrl+C 停止伺服器
echo   - 確保後端 API 也在運行（port 3000）
echo.
echo ===============================================
echo.

cd /d "%~dp0frontend"
python -m http.server 8080

pause

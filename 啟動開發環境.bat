@echo off
echo ========================================
echo    愛心互動遊戲 - 開發環境啟動
echo ========================================
echo.

echo [1/2] 啟動後端 API 服務器 (Port 3000)...
start "後端 API Server" cmd /k "cd /d D:\網頁\website\backend\nodejs && node server.js"

timeout /t 3 /nobreak > nul

echo [2/2] 啟動前端 Nuxt 開發服務器 (Port 3001)...
start "前端 Nuxt Dev" cmd /k "cd /d D:\網頁\website\frontend-nuxt && set PORT=3001 && npm run dev"

echo.
echo ========================================
echo    開發環境啟動完成！
echo ========================================
echo.
echo    後端 API:  http://localhost:3000/api
echo    前端頁面:  http://localhost:3001
echo.
echo    按任意鍵關閉此窗口...
pause > nul

@echo off
chcp 65001 >nul
echo 正在啟動排行榜後端伺服器...
echo.
start "排行榜後端 API - Port 3000" cmd /k "cd /d D:\網頁\website\backend\nodejs && npm start"
echo.
echo ✅ 後端伺服器已在新視窗中啟動
echo    視窗標題: 排行榜後端 API - Port 3000
echo.
echo 📡 API 地址: http://localhost:3000
echo.
pause

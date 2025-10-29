@echo off
chcp 65001 >nul
cls
echo ===============================================
echo   🚀 完整系統啟動腳本
echo ===============================================
echo.
echo 正在啟動前端和後端伺服器...
echo.

REM 啟動後端 API 伺服器（新視窗）
echo [1/2] 啟動後端 API 伺服器 (port 3000)...
start "排行榜後端 API" cmd /k "cd /d "%~dp0backend\nodejs" && npm start"
timeout /t 2 /nobreak >nul

REM 啟動前端伺服器（新視窗）
echo [2/2] 啟動前端測試伺服器 (port 8080)...
start "前端測試伺服器" cmd /k "cd /d "%~dp0frontend" && echo. && echo 前端伺服器啟動在 http://localhost:8080 && echo. && python -m http.server 8080"
timeout /t 2 /nobreak >nul

echo.
echo ===============================================
echo   ✅ 所有伺服器已啟動！
echo ===============================================
echo.
echo 📋 伺服器資訊：
echo   - 後端 API：http://localhost:3000
echo   - 前端網站：http://localhost:8080
echo.
echo 🌐 可用頁面：
echo   - 主網站：http://localhost:8080/index.html
echo   - 測試頁面：http://localhost:8080/leaderboard-test.html
echo.
echo 💡 提示：
echo   - 兩個伺服器都在獨立視窗中運行
echo   - 關閉視窗即停止對應的伺服器
echo   - 按任意鍵開啟測試頁面
echo.
echo ===============================================
pause

REM 開啟測試頁面
start http://localhost:8080/leaderboard-test.html

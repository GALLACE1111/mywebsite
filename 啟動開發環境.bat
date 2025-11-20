@echo off
chcp 65001 >nul
echo ========================================
echo    愛心互動遊戲 - 開發環境啟動
echo ========================================
echo.

REM 檢查並安裝後端依賴
echo [0/3] 檢查依賴...
cd /d "%~dp0backend\nodejs"
if not exist "node_modules\" (
    echo 後端依賴未安裝，正在安裝...
    call npm install
    echo.
)

cd /d "%~dp0frontend-nuxt"
if not exist "node_modules\" (
    echo 前端依賴未安裝，正在安裝...
    call npm install
    echo.
)

echo [1/3] 啟動後端 API 服務器 (Port 3000)...
cd /d "%~dp0backend\nodejs"
start "後端 API Server" cmd /k node server.js

timeout /t 3 /nobreak > nul

echo [2/3] 啟動前端 Nuxt 開發服務器 (Port 3001)...
cd /d "%~dp0frontend-nuxt"
start "前端 Nuxt Dev" cmd /k "set PORT=3001 && npm run dev"

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

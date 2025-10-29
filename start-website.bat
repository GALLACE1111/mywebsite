@echo off
chcp 65001 >nul
echo ========================================
echo    阿賢的小窩 - 網站啟動工具
echo ========================================
echo.
echo 選擇啟動模式：
echo [1] 僅啟動前端 (不需要後端API)
echo [2] 啟動前端 + 後端 (完整功能)
echo [3] 直接在瀏覽器中打開 (檔案協議)
echo.
set /p choice="請輸入選項 (1/2/3): "

if "%choice%"=="1" goto frontend_only
if "%choice%"=="2" goto full_stack
if "%choice%"=="3" goto open_file
echo 無效選項，預設使用選項 1
goto frontend_only

:frontend_only
echo.
echo ✨ 正在啟動前端服務器...
cd /d "%~dp0frontend"
start "前端服務器" cmd /k "python -m http.server 8000 && echo 前端已啟動於 http://localhost:8000"
timeout /t 2 >nul
start http://localhost:8000
echo.
echo ✅ 前端已啟動於 http://localhost:8000
echo ℹ️  注意：排行榜功能需要後端API支持
echo.
pause
exit

:full_stack
echo.
echo 📡 正在檢查後端依賴...
cd /d "%~dp0backend\nodejs"
if not exist "node_modules" (
    echo ⚠️  後端依賴未安裝，正在安裝...
    call npm install
)

echo.
echo ✨ 正在啟動後端服務器...
start "後端API服務器" cmd /k "node server.js"
timeout /t 3 >nul

echo.
echo ✨ 正在啟動前端服務器...
cd /d "%~dp0frontend"
start "前端服務器" cmd /k "python -m http.server 8000"
timeout /t 2 >nul
start http://localhost:8000

echo.
echo ✅ 網站已完整啟動！
echo 📡 前端: http://localhost:8000
echo 📡 後端API: http://localhost:3000
echo.
pause
exit

:open_file
echo.
echo ✨ 正在打開 index.html...
cd /d "%~dp0frontend"
start index.html
echo.
echo ✅ 已在預設瀏覽器中打開
echo ℹ️  注意：某些功能可能因安全限制無法使用
echo.
pause
exit

@echo off
chcp 65001 >nul
echo ====================================
echo    Firebase Functions 部署腳本
echo ====================================
echo.

cd /d "%~dp0"

echo [1/3] 檢查 Firebase 登入狀態...
firebase login:list 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  未登入 Firebase，請先執行登入...
    echo.
    firebase login
    if %errorlevel% neq 0 (
        echo ❌ 登入失敗！
        pause
        exit /b 1
    )
)

echo ✅ Firebase 已登入
echo.

echo [2/3] 檢查 Functions 依賴套件...
cd functions
if not exist "node_modules" (
    echo 安裝 Functions 依賴套件...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 套件安裝失敗！
        pause
        exit /b 1
    )
)
cd ..
echo ✅ 依賴套件已就緒
echo.

echo [3/3] 部署 Firebase Functions...
firebase deploy --only functions
if %errorlevel% neq 0 (
    echo ❌ Functions 部署失敗！
    pause
    exit /b 1
)
echo.

echo ====================================
echo    ✅ Functions 部署完成！
echo ====================================
echo.
echo Firebase Functions 已成功部署！
echo.
pause

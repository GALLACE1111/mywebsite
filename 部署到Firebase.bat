@echo off
chcp 65001 >nul
echo ====================================
echo    Firebase 部署腳本
echo ====================================
echo.

cd /d "%~dp0"

echo [1/5] 檢查 Firebase 登入狀態...
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

echo [2/5] 構建 Nuxt 前端...
cd frontend-nuxt
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Nuxt 構建失敗！
    pause
    exit /b 1
)
echo ✅ Nuxt 構建成功
cd ..
echo.

echo [3/5] 部署 Firestore 規則和索引...
firebase deploy --only firestore
if %errorlevel% neq 0 (
    echo ⚠️  Firestore 部署失敗，但繼續...
)
echo.

echo [4/5] 部署 Storage 規則...
firebase deploy --only storage
if %errorlevel% neq 0 (
    echo ⚠️  Storage 部署失敗，但繼續...
)
echo.

echo [5/5] 部署 Firebase Hosting...
firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo ❌ Hosting 部署失敗！
    pause
    exit /b 1
)
echo.

echo ====================================
echo    ✅ 部署完成！
echo ====================================
echo.
echo 你的網站已成功部署到 Firebase！
echo 專案: side-project-663de
echo.
pause

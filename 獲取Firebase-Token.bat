@echo off
chcp 65001 >nul
echo ====================================
echo    獲取 Firebase CI Token
echo ====================================
echo.
echo 這個 Token 用於 GitHub Actions 自動部署
echo.

cd /d "%~dp0"

echo [1/2] 檢查 Firebase 登入狀態...
echo.

firebase login:list 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  未登入 Firebase，現在開始登入...
    echo.
    firebase login
    if %errorlevel% neq 0 (
        echo ❌ 登入失敗！
        pause
        exit /b 1
    )
)

echo.
echo ✅ Firebase 已登入
echo.
echo ====================================
echo.
echo [2/2] 生成 CI Token...
echo.
echo ⚠️  重要說明：
echo    1. 下面會生成一個長串的 Token
echo    2. 請完整複製這個 Token
echo    3. 前往 GitHub Repository Settings
echo    4. Secrets and variables → Actions
echo    5. 新增 Secret:
echo       Name: FIREBASE_TOKEN
echo       Value: [貼上你的 Token]
echo.
echo 按任意鍵繼續生成 Token...
pause >nul
echo.
echo ====================================

firebase login:ci

echo.
echo ====================================
echo.
echo ✅ Token 已生成！
echo.
echo 📋 下一步操作：
echo.
echo 1. 複製上面顯示的 Token
echo.
echo 2. 前往 GitHub:
echo    https://github.com/GALLACE1111/mywebsite/settings/secrets/actions
echo.
echo 3. 點擊 "New repository secret"
echo.
echo 4. 輸入：
echo    Name: FIREBASE_TOKEN
echo    Secret: [貼上你的 Token]
echo.
echo 5. 點擊 "Add secret"
echo.
echo 6. 完成！現在推送代碼會自動部署
echo.
echo ====================================
pause

@echo off
chcp 65001 >nul
echo ====================================
echo    部署問題診斷工具
echo ====================================
echo.

cd /d "%~dp0"

echo [1/5] 檢查 Git 狀態...
git status
echo.

echo [2/5] 檢查最近的提交...
git log --oneline -3
echo.

echo [3/5] 測試 Nuxt 構建...
echo 正在測試構建 (這可能需要 1-2 分鐘)...
cd frontend-nuxt
call npm run build
set BUILD_STATUS=%errorlevel%
cd ..

if %BUILD_STATUS% neq 0 (
    echo ❌ Nuxt 構建失敗！這可能是部署失敗的原因。
    echo.
    echo 建議：
    echo 1. 檢查 frontend-nuxt 目錄中的代碼錯誤
    echo 2. 執行 cd frontend-nuxt ^&^& npm install
    echo 3. 查看上面的錯誤訊息
    pause
    exit /b 1
) else (
    echo ✅ Nuxt 構建成功！
)
echo.

echo [4/5] 測試 SSG 生成...
echo 正在測試靜態生成...
cd frontend-nuxt
call npm run generate
set GENERATE_STATUS=%errorlevel%
cd ..

if %GENERATE_STATUS% neq 0 (
    echo ❌ SSG 生成失敗！GitHub Pages 部署會失敗。
    echo.
    echo 建議：
    echo 1. 檢查 Nuxt 配置是否支援 SSG
    echo 2. 查看上面的錯誤訊息
    pause
    exit /b 1
) else (
    echo ✅ SSG 生成成功！
)
echo.

echo [5/5] 檢查 Firebase 登入...
firebase login:list
if %errorlevel% neq 0 (
    echo ⚠️  未登入 Firebase
    echo.
    echo Firebase 部署需要：
    echo 1. 本地登入: firebase login
    echo 2. 獲取 Token: firebase login:ci
    echo 3. 在 GitHub 設置 FIREBASE_TOKEN Secret
) else (
    echo ✅ Firebase 已登入
)
echo.

echo ====================================
echo    診斷完成
echo ====================================
echo.
echo 📊 檢查結果：
if %BUILD_STATUS% equ 0 (
    echo ✅ Nuxt 構建: 成功
) else (
    echo ❌ Nuxt 構建: 失敗
)

if %GENERATE_STATUS% equ 0 (
    echo ✅ SSG 生成: 成功
) else (
    echo ❌ SSG 生成: 失敗
)
echo.

echo 📝 GitHub Actions 錯誤檢查：
echo 1. 前往 https://github.com/GALLACE1111/mywebsite/actions
echo 2. 點擊失敗的 workflow
echo 3. 查看紅色 ❌ 的步驟
echo 4. 複製錯誤訊息
echo.

echo 🔧 常見錯誤：
echo.
echo Firebase 部署失敗：
echo   - 缺少 FIREBASE_TOKEN Secret
echo   - Token 已過期
echo   - 權限不足
echo.
echo GitHub Pages 部署失敗：
echo   - Nuxt generate 失敗
echo   - 依賴安裝失敗
echo   - 構建錯誤
echo.
pause

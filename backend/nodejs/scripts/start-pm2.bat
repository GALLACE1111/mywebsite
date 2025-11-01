@echo off
echo ========================================
echo   PM2 啟動腳本
echo ========================================
echo.

REM 檢查 PM2 是否已安裝
where pm2 >nul 2>nul
if errorlevel 1 (
    echo [錯誤] PM2 未安裝！
    echo.
    echo 請先安裝 PM2:
    echo   npm install -g pm2
    echo.
    pause
    exit /b 1
)

echo [1/3] 停止現有的 PM2 進程...
pm2 stop leaderboard-api 2>nul
pm2 delete leaderboard-api 2>nul

echo [2/3] 啟動應用...
cd /d "%~dp0.."
pm2 start ecosystem.config.cjs

echo [3/3] 顯示狀態...
pm2 status

echo.
echo ========================================
echo   啟動完成！
echo ========================================
echo.
echo 常用命令:
echo   pm2 logs leaderboard-api    查看日誌
echo   pm2 restart leaderboard-api  重啟應用
echo   pm2 stop leaderboard-api     停止應用
echo   pm2 monit                    監控面板
echo.
pause

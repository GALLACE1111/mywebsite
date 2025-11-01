@echo off
REM 清理所有佔用 3000 端口的進程
echo 正在清理端口 3000 上的所有進程...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a 2>nul
    if not errorlevel 1 (
        echo 已終止進程 PID: %%a
    )
)

echo.
echo 清理完成！
echo.
pause

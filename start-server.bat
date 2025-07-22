@echo off
echo 正在启动本地服务器...
echo 请使用浏览器访问 http://localhost:8000

REM 检查是否安装了Python
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo 使用Python启动HTTP服务器...
    python -m http.server 8000
    goto :eof
)

REM 检查是否安装了Node.js
node --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo 检查是否安装了http-server...
    npm list -g http-server >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo 使用http-server启动...
        http-server -p 8000 -o
    ) else (
        echo 未找到全局http-server，尝试使用npx...
        echo 自动确认安装http-server...
        set "npm_config_yes=true"
        npx http-server -p 8000 -o
        if %ERRORLEVEL% NEQ 0 (
            echo npx http-server失败，尝试全局安装...
            npm install -g http-server
            if %ERRORLEVEL% EQU 0 (
                echo 安装成功，启动http-server...
                http-server -p 8000 -o
            ) else (
                echo 安装http-server失败
            )
        )
    )
    goto :eof
)

echo 未找到Python或Node.js，无法启动HTTP服务器
echo 请安装Python或Node.js后再试
pause
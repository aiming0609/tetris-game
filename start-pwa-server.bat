@echo off
echo Starting PWA server and IP display...

REM Start PowerShell script to display IP address
start powershell -ExecutionPolicy Bypass -File "%~dp0show-ip.ps1"

REM Start HTTP server in a new window
start cmd /c "python -m http.server 8000"

echo PWA server started successfully!
echo You can access the game at http://localhost:8000
echo Or use the IP addresses shown in the PowerShell window

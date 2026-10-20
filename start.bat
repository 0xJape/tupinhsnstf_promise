@echo off
setlocal
cd /d "%~dp0"

set "PORT=%~1"
if not defined PORT set "PORT=3000"

echo Checking port %PORT%...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%PORT% .*LISTENING"') do (
  echo Stopping existing process %%P on port %PORT%...
  taskkill /F /PID %%P >nul 2>&1
)

echo Starting PROMISE at http://localhost:%PORT%...
call npm run dev -- --port %PORT%

endlocal

@echo off
setlocal
cd /d "%~dp0"

set "PORT=%~1"
if not defined PORT set "PORT=3000"

where node >nul 2>&1 || (
  echo ERROR: Node.js is not installed or not available in PATH.
  exit /b 1
)

if not exist "node_modules\next\package.json" (
  echo Installing local dependencies...
  call npm install || exit /b 1
)

echo Checking port %PORT%...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /R /C:":%PORT% .*LISTENING"') do (
  echo Stopping existing local process %%P on port %PORT%...
  taskkill /F /PID %%P >nul 2>&1
)

echo.
echo PROMISE local app: http://localhost:%PORT%
echo Press Ctrl+C to stop.
echo.
call npm run dev -- --port %PORT%

endlocal
@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo   DSAviz - starting all services
echo ============================================
echo.

REM --- first-run dependency installs (skipped if already present) ---
if not exist "backend\Api\node_modules" (
  echo Installing gateway dependencies...
  pushd backend\Api & call npm install & popd
)
if not exist "frontend\node_modules" (
  echo Installing frontend dependencies...
  pushd frontend & call npm install & popd
)
echo Ensuring Python dependencies...
pip install -r backend\requirements.txt >nul 2>&1

REM --- launch each service in its own window ---
start "DSAviz Python worker" cmd /k "cd /d %~dp0backend && uvicorn worker.app:app --port 8000"
start "DSAviz Java worker"   cmd /k "cd /d %~dp0backend\java-worker && java JavaWorker.java --serve 8001"
start "DSAviz Gateway"       cmd /k "cd /d %~dp0backend\Api && npm start"
start "DSAviz Frontend"      cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Four windows are starting up.
echo When the Frontend window shows "Local: http://localhost:5173/",
echo open that address in your browser.
echo.
echo (Java needs a JDK 11+. If the Java worker window shows an error,
echo  Python still works - install a JDK to enable the Java tab.)
echo.
pause

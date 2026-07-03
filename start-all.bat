@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo   Interactive Algorithm Tutor - starting all services
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

REM --- check for the C++ toolchain (g++ + gdb) before launching that worker ---
where g++ >nul 2>&1
set HAVE_GPP=%ERRORLEVEL%
where gdb >nul 2>&1
set HAVE_GDB=%ERRORLEVEL%

REM --- launch each service in its own window ---
start "IAT Python worker" cmd /k "cd /d %~dp0backend && uvicorn worker.app:app --port 8000"
start "IAT Java worker"   cmd /k "cd /d %~dp0backend\java-worker && java JavaWorker.java --serve 8001"
if %HAVE_GPP%==0 if %HAVE_GDB%==0 (
  start "IAT C++ worker" cmd /k "cd /d %~dp0backend\cpp-worker && python -m uvicorn app:app --port 8002"
) else (
  echo g++ + gdb not detected -^> C++ tab disabled (Python still works).
  echo   Install with: winget install MSYS2.MSYS2, then pacman -S mingw-w64-ucrt-x86_64-gcc mingw-w64-ucrt-x86_64-gdb
)
start "IAT Gateway"       cmd /k "cd /d %~dp0backend\Api && npm start"
start "IAT Frontend"      cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Windows are starting up.
echo When the Frontend window shows "Local: http://localhost:5173/",
echo open that address in your browser.
echo.
echo (Java needs a JDK 11+. If the Java worker window shows an error,
echo  Python still works - install a JDK to enable the Java tab.)
echo.
pause

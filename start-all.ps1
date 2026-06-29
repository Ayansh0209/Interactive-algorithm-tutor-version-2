# DSAviz one-click launcher (PowerShell).
# Right-click > Run with PowerShell, or: powershell -ExecutionPolicy Bypass -File start-all.ps1
$root = $PSScriptRoot
function Have($c) { $null -ne (Get-Command $c -ErrorAction SilentlyContinue) }

Write-Host "=== DSAviz launcher ===" -ForegroundColor Cyan

if (-not (Have python)) { Write-Host "Python not found. Install Python 3.10+ and re-run." -ForegroundColor Red; Read-Host "Enter to exit"; exit }
if (-not (Have node))   { Write-Host "Node.js not found. Install Node 18+ and re-run." -ForegroundColor Red; Read-Host "Enter to exit"; exit }

$hasJava = $false
if (Have java) {
  $mods = (& java --list-modules) 2>$null
  if ($mods -match "jdk.compiler") { $hasJava = $true }
}
if (-not $hasJava) {
  Write-Host "JDK 11+ not detected -> Java tab disabled (Python still works)." -ForegroundColor Yellow
  Write-Host "  Install with:  winget install EclipseAdoptium.Temurin.17.JDK" -ForegroundColor Yellow
}

# first-run installs
if (-not (Test-Path "$root\backend\Api\node_modules")) {
  Write-Host "Installing gateway deps..."; Push-Location "$root\backend\Api"; npm install; Pop-Location
}
if (-not (Test-Path "$root\frontend\node_modules")) {
  Write-Host "Installing frontend deps..."; Push-Location "$root\frontend"; npm install; Pop-Location
}
Write-Host "Ensuring Python deps..."; pip install -r "$root\backend\requirements.txt" 2>$null | Out-Null

# launch each service in its own window
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root\backend'; uvicorn worker.app:app --port 8000"
if ($hasJava) {
  Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root\backend\java-worker'; java JavaWorker.java --serve 8001"
}
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root\backend\Api'; npm start"
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root\frontend'; npm run dev"

Write-Host ""
Write-Host "All services launching. Open http://localhost:5173 when the frontend is ready." -ForegroundColor Green
Read-Host "Press Enter to close this window"

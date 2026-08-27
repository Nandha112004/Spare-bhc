# SPARE — Run both servers persistently (PowerShell)
# Double-click or run:  powershell -ExecutionPolicy Bypass -File E:\opencode_Project\run.ps1
$ErrorActionPreference = "SilentlyContinue"

function Ensure-Backend {
  $running = Get-Process -Name python -ErrorAction SilentlyContinue | Where-Object { 
    try { (Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)").CommandLine -like "*uvicorn*"} catch { $false }
  }
  try { $health = Invoke-WebRequest -Uri "http://127.0.0.1:8000/health" -UseBasicParsing -TimeoutSec 3 } catch { $health = $null }
  if (-not $health -or $health.StatusCode -ne 200) {
    Write-Host "[SPARE] Starting backend :8000 ..." -ForegroundColor Cyan
    Get-Process -Name python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    $p = Start-Process -FilePath "python" -ArgumentList "-m","uvicorn","app.main:app","--host","127.0.0.1","--port","8000" -WorkingDirectory "E:\opencode_Project\backend" -PassThru -WindowStyle Hidden
    Write-Host "[SPARE] Backend PID $($p.Id) — http://127.0.0.1:8000  docs http://127.0.0.1:8000/docs" -ForegroundColor Green
    return $true
  } else {
    Write-Host "[SPARE] Backend already running — http://127.0.0.1:8000" -ForegroundColor Green
    return $false
  }
}

function Ensure-Frontend {
  try { $r = Invoke-WebRequest -Uri "http://127.0.0.1:5173" -UseBasicParsing -TimeoutSec 3 } catch { $r = $null }
  if (-not $r -or $r.StatusCode -ne 200) {
    Write-Host "[SPARE] Starting frontend :5173 ..." -ForegroundColor Cyan
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    $log = "E:\opencode_Project\frontend\vite.log"
    Remove-Item $log -Force -ErrorAction SilentlyContinue
    $p = Start-Process -FilePath "cmd.exe" -ArgumentList "/c","npx vite --host 127.0.0.1 --port 5173 > `"$log`" 2>&1" -WorkingDirectory "E:\opencode_Project\frontend" -PassThru -WindowStyle Hidden
    Write-Host "[SPARE] Frontend PID $($p.Id) — http://127.0.0.1:5173" -ForegroundColor Green
    Start-Sleep -Seconds 6
    try { $r2 = Invoke-WebRequest -Uri "http://127.0.0.1:5173" -UseBasicParsing -TimeoutSec 5; Write-Host "[SPARE] Frontend OK $($r2.StatusCode)" -ForegroundColor Green } catch { Write-Host "[SPARE] Frontend still starting — check $log" -ForegroundColor Yellow }
    return $true
  } else {
    Write-Host "[SPARE] Frontend already running — http://127.0.0.1:5173" -ForegroundColor Green
    return $false
  }
}

Write-Host "==========================================" -ForegroundColor White
Write-Host " SPARE × BHC — Bishop Heber College 620017" -ForegroundColor White
Write-Host " Post Box 615, Vayalur Rd, Puthur, Trichy" -ForegroundColor DarkGray
Write-Host "==========================================" -ForegroundColor White

Ensure-Backend | Out-Null
Ensure-Frontend | Out-Null

Write-Host ""
Write-Host "✓ SPARE is LIVE:" -ForegroundColor Green
Write-Host "  Frontend → http://127.0.0.1:5173/" -ForegroundColor Cyan
Write-Host "  Backend  → http://127.0.0.1:8000/" -ForegroundColor Cyan
Write-Host "  Docs     → http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host "  Demo     → demo@bhc.edu.in / password123 (also demo@spare.edu)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Keep this window open OR close it — servers stay running in background." -ForegroundColor DarkGray
Write-Host "After reboot, double-click run.bat or run this script again." -ForegroundColor DarkGray
Write-Host "To stop: Get-Process python,node | Stop-Process -Force" -ForegroundColor DarkGray

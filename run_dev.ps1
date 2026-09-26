# RepoMind - Local Startup Script

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  🧠 Starting RepoMind - AI Codebase Doctor & Architecture Assistant" -ForegroundColor Green
Write-Host "  Student: Subhechha Maiti | Roll: 251810700219" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start FastAPI Backend in background job
Write-Host "`n[1/2] Launching FastAPI Backend on http://localhost:8000..." -ForegroundColor Cyan
Start-Process -FilePath "python" -ArgumentList "-m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload" -WindowStyle Normal

Start-Sleep -Seconds 2

# 2. Start Vite React Frontend
Write-Host "`n[2/2] Launching Vite Frontend on http://localhost:5173..." -ForegroundColor Cyan
Set-Location -Path "./frontend"
npm run dev

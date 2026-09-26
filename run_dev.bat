@echo off
echo ==========================================================
echo   RepoMind - AI Codebase Doctor and Architecture Assistant
echo   Student: Subhechha Maiti ^| Roll: 251810700219
echo ==========================================================

echo [1/2] Launching FastAPI Backend on http://localhost:8000...
start cmd /k "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo [2/2] Launching Vite Frontend on http://localhost:5173...
cd frontend
npm run dev

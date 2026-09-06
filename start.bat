@echo off
title Mobile Hub - Spin & Win Starter
echo ===================================================
echo       MOBILE HUB - SPIN & WIN STARTER SCRIPT
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Flask Backend on http://127.0.0.1:5000 ...
start "Mobile Hub Backend (Flask)" cmd /k "cd /d %~dp0backend && set PYTHONPATH=. && ..\backend\venv\Scripts\python.exe run.py"

echo [2/2] Starting Vite Frontend on http://localhost:5173 ...
start "Mobile Hub Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo   Servers are starting in separate windows!
echo   Customer Portal: http://localhost:5173
echo   Admin Portal:    http://localhost:5173/admin/login
echo   Admin Email:     admin@mobilehub.com
echo   Admin Password:  Admin@123
echo ===================================================
pause

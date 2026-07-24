@echo off
title Revive AI Launcher
cls
echo ========================================================
echo           🚀 Starting Revive AI Engine 🚀               
echo ========================================================
echo.
echo 1. Launching FastAPI Backend Server (http://localhost:8000)...
start "Revive AI Backend (Port 8000)" cmd /k "cd /d %~dp0backend && python main.py"

echo 2. Launching Next.js Frontend Development Server (http://localhost:3000)...
start "Revive AI Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo ✅ Both servers are launching in separate windows!
echo 🌐 Frontend: http://localhost:3000
echo ⚡ Backend API: http://localhost:8000
echo 📖 API Docs: http://localhost:8000/docs
echo ========================================================
echo.
pause

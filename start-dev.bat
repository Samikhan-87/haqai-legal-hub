@echo off
echo Starting HaqAI Development Servers...

:: Start the Python Backend
echo Launching FastAPI Backend on http://localhost:8000...
start "HaqAI Backend" cmd /k "cd backend && ..\.venv\Scripts\activate && uvicorn main:app --reload --port 8000"

:: Start the React Frontend
echo Launching Frontend Dev Server...
start "HaqAI Frontend" cmd /k "cd frontend\haqai-legal-hub && npm run dev"

echo Both servers are launching in separate windows. Close those windows to stop them.
pause

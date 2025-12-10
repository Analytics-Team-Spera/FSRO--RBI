@echo off
echo ========================================
echo  FSRO - Complete Application Startup
echo  Reserve Bank of India
echo  Powered by Spera Digital
echo ========================================
echo.

echo Step 1: Starting Backend Server...
start cmd /k "cd backend && python app.py"

timeout /t 5 /nobreak > nul

echo Step 2: Starting Frontend Server...
start cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo  FSRO is starting up...
echo  Backend: http://localhost:8000
echo  Frontend: http://localhost:3000
echo  API Docs: http://localhost:8000/docs
echo ========================================
echo.
echo Both servers are running in separate windows.
echo Press any key to exit this window...
pause > nul

@echo off
echo ============================================================
echo   FSRO - Financial System Risk Observatory
echo   Backend Server Startup
echo   Reserve Bank of India | Powered by Spera Digital
echo ============================================================
echo.

cd /d "%~dp0"

:: Check if virtual environment exists
if exist "venv\Scripts\activate.bat" (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo Installing dependencies...
    pip install -r requirements.txt
)

echo.
echo Starting FSRO Backend Server...
echo.
python app.py

pause

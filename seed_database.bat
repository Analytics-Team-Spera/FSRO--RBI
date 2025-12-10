@echo off
echo ============================================
echo FSRO Database Seeding Script
echo ============================================
echo.
cd /d "%~dp0"
echo Installing required packages...
pip install pandas openpyxl motor pymongo python-dotenv passlib --break-system-packages -q
echo.
echo Running seed script...
python seed.py
echo.
echo ============================================
echo Done! Press any key to exit...
pause >nul

@echo off
REM ============================================================================
REM SMS Extractor - Auto-run Script
REM This batch file starts the SMS extraction service in continuous mode
REM ============================================================================

echo.
echo ============================================================================
echo SMS Financial Data Extraction - Auto-running Service
echo ============================================================================
echo.
echo Starting SMS extraction service...
echo Service will run continuously and check for SMS every 1 second
echo.
echo Press Ctrl+C to stop the service
echo.
echo ============================================================================
echo.

REM Change to the smart_budget directory
cd /d "C:\Users\boitu\OneDrive\Desktop\smart_budget"

REM Activate the virtual environment
call .venv\Scripts\activate.bat

REM Run the Python script in continuous mode (processes all users)
python "backend\Extract SMS with User Linking.py"

REM Keep the window open if the script exits
pause

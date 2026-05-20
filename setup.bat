@echo off
REM SmartSpend 2.0 Setup Wrapper
REM This script runs the PowerShell setup.ps1 as Administrator

setlocal enabledelayedexpansion

REM Get the directory where this batch file is located
set "projectRoot=%~dp0"

echo.
echo ================================================
echo SmartSpend 2.0 - First-Time Setup
echo ================================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo Requesting Administrator privileges...
    echo.
    
    REM Re-run this script as Administrator
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process '%~0' -Verb RunAs"
    exit /b
)

REM Run the PowerShell setup script
powershell -NoProfile -ExecutionPolicy Bypass -File "%projectRoot%setup.ps1"
pause

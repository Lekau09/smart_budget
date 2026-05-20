@echo off
REM ============================================================================
REM Create a shortcut for the SMS Extractor batch file
REM Run this script once to create the shortcut
REM ============================================================================

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "BATCH_FILE=%SCRIPT_DIR%RUN_SMS_EXTRACTOR.bat"
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\SMS Extractor Service.lnk"

echo Creating shortcut...

REM Create the shortcut using PowerShell (cleaner method)
powershell -NoProfile -Command ^
"$WshShell = New-Object -ComObject WScript.Shell; ^
$Shortcut = $WshShell.CreateShortcut('!SHORTCUT_PATH!'); ^
$Shortcut.TargetPath = '!BATCH_FILE!'; ^
$Shortcut.WorkingDirectory = '!SCRIPT_DIR!'; ^
$Shortcut.Save(); ^
Write-Host 'Shortcut created successfully!'"

echo.
echo ✅ Shortcut created on Desktop: "SMS Extractor Service.lnk"
echo You can now double-click it to start the SMS extraction service
echo.
pause

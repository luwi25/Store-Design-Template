@echo off
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" python -m venv .venv
if errorlevel 1 goto failed
".venv\Scripts\python.exe" -m pip install -r requirements-background.txt
if errorlevel 1 goto failed
".venv\Scripts\python.exe" background_removal.py
if errorlevel 1 goto failed
echo Background removal installed. Reopen the app with its launcher.
pause
exit /b 0
:failed
echo Setup could not finish. Check your internet connection and Python installation.
pause
exit /b 1

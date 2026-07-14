@echo off
REM Start the Meetingly API on Windows (Command Prompt / double-click)
REM Usage: double-click run.bat  OR  run.bat  from the backend folder

cd /d "%~dp0"

if not exist ".env" (
  if exist ".env.example" (
    copy /Y ".env.example" ".env" >nul
    echo Created .env from .env.example — edit it and set GEMINI_API_KEY and JWT_SECRET.
  )
)

if not exist ".venv\Scripts\python.exe" (
  echo Creating virtual environment...
  where uv >nul 2>&1
  if %ERRORLEVEL%==0 (
    uv venv --python 3.12 .venv
    uv pip install -r requirements.txt
  ) else (
    python -m venv .venv 2>nul
    if not exist ".venv\Scripts\python.exe" (
      py -3 -m venv .venv
    )
    ".venv\Scripts\python.exe" -m pip install --upgrade pip
    ".venv\Scripts\python.exe" -m pip install -r requirements.txt
  )
)

echo Starting API on http://127.0.0.1:8000 ...
if exist ".venv\Scripts\uvicorn.exe" (
  ".venv\Scripts\uvicorn.exe" main:app --reload --host 0.0.0.0 --port 8000
) else (
  ".venv\Scripts\python.exe" -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
)

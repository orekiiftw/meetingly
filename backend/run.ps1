# Start the Meetingly API on Windows (PowerShell)
# Usage (from backend folder):
#   .\run.ps1
# If execution policy blocks it:
#   powershell -ExecutionPolicy Bypass -File .\run.ps1

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Created .env from .env.example — edit it and set GEMINI_API_KEY and JWT_SECRET." -ForegroundColor Yellow
    }
}

$venvPython = Join-Path ".venv" "Scripts\python.exe"
$venvUvicorn = Join-Path ".venv" "Scripts\uvicorn.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "Creating virtual environment..." -ForegroundColor Cyan
    if (Get-Command uv -ErrorAction SilentlyContinue) {
        uv venv --python 3.12 .venv
        uv pip install -r requirements.txt
    }
    else {
        python -m venv .venv
        if (-not (Test-Path $venvPython)) {
            # try py launcher
            py -3 -m venv .venv
        }
        & $venvPython -m pip install --upgrade pip
        & $venvPython -m pip install -r requirements.txt
    }
}

Write-Host "Starting API on http://127.0.0.1:8000 ..." -ForegroundColor Green

if (Test-Path $venvUvicorn) {
    & $venvUvicorn main:app --reload --host 0.0.0.0 --port 8000
}
else {
    & $venvPython -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
}

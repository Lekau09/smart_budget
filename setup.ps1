# SmartSpend 2.0 Setup Script
# Automatically configures the environment for first-time users
# Run as Administrator: powershell -ExecutionPolicy Bypass -File setup.ps1

param(
    [switch]$SkipJunction = $false
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "SmartSpend 2.0 - First-Time Setup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[WARNING] This script needs to run as Administrator to create junctions." -ForegroundColor Yellow
    Write-Host "Please run: powershell -ExecutionPolicy Bypass -File setup.ps1 -RunAsAdmin" -ForegroundColor Yellow
    exit 1
}

# Get the directory where this script is located
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host "[OK] Project root detected: $projectRoot" -ForegroundColor Green

# Verify critical folders exist
$backendPath = Join-Path $projectRoot "backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "[ERROR] 'backend' folder not found in project root." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Backend folder found" -ForegroundColor Green

# Create XAMPP htdocs structure if needed
$xamppHtdocs = "C:\xampp\htdocs"
if (-not (Test-Path $xamppHtdocs)) {
    Write-Host "[ERROR] XAMPP not found at $xamppHtdocs" -ForegroundColor Red
    Write-Host "Please install XAMPP first: https://www.apachefriends.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] XAMPP detected at $xamppHtdocs" -ForegroundColor Green

# Create smart_budget directory if it doesn't exist
$smartBudgetDir = Join-Path $xamppHtdocs "smart_budget"
if (-not (Test-Path $smartBudgetDir)) {
    New-Item -Path $smartBudgetDir -ItemType Directory | Out-Null
    Write-Host "[OK] Created $smartBudgetDir" -ForegroundColor Green
}

# Create backend junction
$backendLink = Join-Path $smartBudgetDir "backend"
if (Test-Path $backendLink) {
    if ((Get-Item $backendLink -Force).LinkType -eq "Junction") {
        Write-Host "[OK] Backend junction already exists" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] $backendLink exists but is not a junction. Skipping..." -ForegroundColor Yellow
    }
} else {
    try {
        New-Item -Path $backendLink -ItemType Junction -Value $backendPath -Force | Out-Null
        Write-Host "[OK] Created backend junction: $backendLink -> $backendPath" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Could not create junction. Error: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "[OK] Setup Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start XAMPP (Apache + MySQL)" -ForegroundColor White
Write-Host "  2. Run: npm install" -ForegroundColor White
Write-Host "  3. Run: make setup-db" -ForegroundColor White
Write-Host "  4. Run: make dev" -ForegroundColor White
Write-Host ""
Write-Host "Backend API will be available at:" -ForegroundColor Cyan
Write-Host "  http://localhost/smart_budget/backend/api/" -ForegroundColor Green
Write-Host ""

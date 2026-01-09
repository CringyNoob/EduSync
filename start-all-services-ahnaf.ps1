# Start All EduSync Services
# This script starts all microservices in separate terminal windows

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   EduSync - Starting All Services   " -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Get the script's directory (root of the project)
$ROOT = $PSScriptRoot
Write-Host "Project Root: $ROOT" -ForegroundColor Gray

# Check if required directories exist
$services = @("auth-service", "marketplace-service", "renthub-service", "gateway", "client")
foreach ($service in $services) {
    $path = Join-Path $ROOT $service
    if (-not (Test-Path $path)) {
        Write-Host "ERROR: Directory not found: $path" -ForegroundColor Red
        exit 1
    }
}
Write-Host "All service directories found." -ForegroundColor Green
Write-Host ""

# Kill any existing processes on these ports
Write-Host "Cleaning up existing processes on ports 3001, 3002, 3003, 8000, 5173..." -ForegroundColor Yellow
try {
    # Try using npx kill-port if available
    $killPortResult = npx kill-port 3001 3002 3003 8000 5173 2>&1
    Start-Sleep -Seconds 2
    Write-Host "Ports cleared." -ForegroundColor Green
} catch {
    Write-Host "Note: Could not kill ports (they may not be in use)" -ForegroundColor Gray
}
Write-Host ""

# Determine which shell to use (pwsh or powershell)
$shell = "powershell"
if (Get-Command pwsh -ErrorAction SilentlyContinue) {
    $shell = "pwsh"
}
Write-Host "Using shell: $shell" -ForegroundColor Gray
Write-Host ""

# Start Auth Service (Port 3001)
Write-Host "Starting Auth Service (Port 3001)..." -ForegroundColor Cyan
$authPath = Join-Path $ROOT "auth-service"
Start-Process $shell -ArgumentList "-NoExit", "-Command", "Set-Location '$authPath'; Write-Host '=== AUTH SERVICE (Port 3001) ===' -ForegroundColor Cyan; node server.js"

# Start Marketplace Service (Port 3002)
Write-Host "Starting Marketplace Service (Port 3002)..." -ForegroundColor Magenta
$marketPath = Join-Path $ROOT "marketplace-service"
Start-Process $shell -ArgumentList "-NoExit", "-Command", "Set-Location '$marketPath'; Write-Host '=== MARKETPLACE SERVICE (Port 3002) ===' -ForegroundColor Magenta; npm start"

# Start RentHub Service (Port 3003)
Write-Host "Starting RentHub Service (Port 3003)..." -ForegroundColor Yellow
$rentPath = Join-Path $ROOT "renthub-service"
Start-Process $shell -ArgumentList "-NoExit", "-Command", "Set-Location '$rentPath'; Write-Host '=== RENTHUB SERVICE (Port 3003) ===' -ForegroundColor Yellow; npm start"

# Start Gateway (Port 8000)
Write-Host "Starting API Gateway (Port 8000)..." -ForegroundColor Blue
$gatewayPath = Join-Path $ROOT "gateway"
Start-Process $shell -ArgumentList "-NoExit", "-Command", "Set-Location '$gatewayPath'; Write-Host '=== API GATEWAY (Port 8000) ===' -ForegroundColor Blue; node server.js"

# Wait for backend services to initialize
Write-Host ""
Write-Host "Waiting for backend services to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 4

# Start Client (Port 5173)
Write-Host "Starting React Client (Port 5173)..." -ForegroundColor Green
$clientPath = Join-Path $ROOT "client"
Start-Process $shell -ArgumentList "-NoExit", "-Command", "Set-Location '$clientPath'; Write-Host '=== REACT CLIENT (Port 5173) ===' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "   All Services Started!             " -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services running in separate terminal windows:" -ForegroundColor White
Write-Host "  Auth Service:        http://localhost:3001" -ForegroundColor Cyan
Write-Host "  Marketplace Service: http://localhost:3002" -ForegroundColor Magenta
Write-Host "  RentHub Service:     http://localhost:3003" -ForegroundColor Yellow
Write-Host "  API Gateway:         http://localhost:8000" -ForegroundColor Blue
Write-Host "  React Client:        http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "Client connects to Gateway at: http://localhost:8000/api" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

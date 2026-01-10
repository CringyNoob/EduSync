# Start All EduSync Services
# This script starts all microservices in separate terminal windows

Write-Host "Starting All EduSync Services..." -ForegroundColor Cyan

# Get the directory where this script is located
$BaseDir = $PSScriptRoot

# Kill any existing processes on these ports
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
try {
    # Check if kill-port is available
    if (Get-Command npx -ErrorAction SilentlyContinue) {
        npx kill-port 3001 3002 3003 8000 5173 2>$null
    }
    Start-Sleep -Seconds 2
} catch {
    Write-Host "Cleanup skipped" -ForegroundColor Gray
}

# Helper function to start a service
function Start-EduService {
    param(
        [string]$Name,
        [string]$Dir,
        [string]$Command,
        [string]$Color
    )
    Write-Host "Starting $Name..." -ForegroundColor Green
    $FullDir = Join-Path $BaseDir $Dir
    
    if (Test-Path $FullDir) {
        # Detect if we should use 'pwsh' or 'powershell'
        $Shell = if (Get-Command pwsh -ErrorAction SilentlyContinue) { "pwsh" } else { "powershell" }
        
        # Using a more robust way to pass arguments to Start-Process
        Start-Process $Shell -WorkingDirectory $FullDir -ArgumentList "-NoExit", "-Command", "Write-Host '$Name' -ForegroundColor $Color; $Command"
    } else {
        Write-Warning "Directory not found: $FullDir"
    }
}

# Start Services
Start-EduService -Name "AUTH SERVICE" -Dir "auth-service" -Command "node server.js" -Color "Cyan"
Start-EduService -Name "MARKETPLACE SERVICE" -Dir "marketplace-service" -Command "npm start" -Color "Magenta"
Start-EduService -Name "RENTHUB SERVICE" -Dir "renthub-service" -Command "npm start" -Color "Yellow"
Start-EduService -Name "API GATEWAY" -Dir "gateway" -Command "node server.js" -Color "Blue"

# Wait a bit for backend services to start
Start-Sleep -Seconds 3

# Start Client
Start-EduService -Name "REACT CLIENT" -Dir "client" -Command "npm run dev" -Color "Cyan"

Write-Host ""
Write-Host "All services are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Services should be available at:"
Write-Host "  Auth Service:        http://localhost:3001"
Write-Host "  Marketplace Service: http://localhost:3002"
Write-Host "  RentHub Service:     http://localhost:3003"
Write-Host "  API Gateway:         http://localhost:8000"
Write-Host "  React Client:        http://localhost:5173"
Write-Host ""
Write-Host "Press any key to exit this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

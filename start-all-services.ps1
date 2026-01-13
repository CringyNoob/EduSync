# Start All EduSync Services
# This script starts all microservices in separate terminal windows

Write-Host "Starting All EduSync Services..." -ForegroundColor Cyan

# Get the directory where this script is located
$BaseDir = $PSScriptRoot

# Kill any existing processes on these ports
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
try {
    npx kill-port 3001 3002 3003 3004 8000 5173 2>$null
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

# Start Marketplace Service (Port 3002)
Write-Host "Starting Marketplace Service (Port 3002)..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd C:\EduSync\EduSync\marketplace-service; Write-Host '🛒 MARKETPLACE SERVICE' -ForegroundColor Magenta; npm start"

# Start RentHub Service (Port 3003)
Write-Host "Starting RentHub Service (Port 3003)..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd C:\EduSync\EduSync\renthub-service; Write-Host '🏠 RENTHUB SERVICE' -ForegroundColor Yellow; npm start"

# Start NewsBox Service (Port 3004)
Write-Host "Starting NewsBox Service (Port 3004)..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd C:\EduSync\EduSync\newsbox-service; Write-Host '📰 NEWSBOX SERVICE' -ForegroundColor Magenta; npm start"

# Start Gateway (Port 8000)
Write-Host "Starting API Gateway (Port 8000)..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd C:\EduSync\EduSync\gateway; Write-Host '🌐 API GATEWAY' -ForegroundColor Blue; node server.js"

# Wait a bit for backend services to start
Start-Sleep -Seconds 3

# Start Client
Start-EduService -Name "REACT CLIENT" -Dir "client" -Command "npm run dev" -Color "Cyan"

Write-Host ""
Write-Host "All services are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Services will open in separate terminal windows:" -ForegroundColor White
Write-Host "  🔐 Auth Service:        http://localhost:3001" -ForegroundColor Cyan
Write-Host "  🛒 Marketplace Service: http://localhost:3002" -ForegroundColor Magenta
Write-Host "  🏠 RentHub Service:     http://localhost:3003" -ForegroundColor Yellow
Write-Host "  📰 NewsBox Service:     http://localhost:3004" -ForegroundColor Magenta
Write-Host "  🌐 API Gateway:         http://localhost:8000" -ForegroundColor Blue
Write-Host "  ⚛️  React Client:        http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

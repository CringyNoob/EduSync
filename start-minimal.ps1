# Start Minimal EduSync Services (Login Only)
# This script starts only the ESSENTIAL services required for logging in:
# 1. Auth Service (3001)
# 2. API Gateway (8080)
# 3. React Client (5173)

Write-Host "Starting Minimal EduSync Services (Login Only)..." -ForegroundColor Cyan

# Get the directory where this script is located
$BaseDir = $PSScriptRoot

# Kill any existing processes on these ports
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
try {
    npx kill-port 3001 8080 5173 2>$null
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

# Start Auth Service (Port 3001)
Start-EduService -Name "AUTH SERVICE" -Dir "auth-service" -Command "npm start" -Color "Cyan"

# Start Gateway (Port 8080)
Start-EduService -Name "API GATEWAY" -Dir "gateway" -Command "node server.js" -Color "Blue"

# Wait a bit for backend services to start
Start-Sleep -Seconds 3

# Start Client
Start-EduService -Name "REACT CLIENT" -Dir "client" -Command "npm run dev" -Color "Cyan"

Write-Host ""
Write-Host "Minimal services are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Services will open in separate terminal windows:" -ForegroundColor White
Write-Host "  [AUTH] Auth Service:        http://localhost:3001" -ForegroundColor Cyan
Write-Host "  [GATE] API Gateway:         http://localhost:8080" -ForegroundColor Blue
Write-Host "  [CLIENT]  React Client:        http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

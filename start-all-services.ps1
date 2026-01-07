# Start All EduSync Services
# This script starts all microservices in separate terminal windows

Write-Host "🚀 Starting All EduSync Services..." -ForegroundColor Cyan

# Kill any existing processes on these ports
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
try {
    npx kill-port 3001 3002 3003 8000 5173 2>$null
    Start-Sleep -Seconds 2
} catch {
    Write-Host "No existing processes to kill" -ForegroundColor Gray
}

# Start Auth Service (Port 3001)
Write-Host "Starting Auth Service (Port 3001)..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd C:\EduSync\EduSync\auth-service; Write-Host '🔐 AUTH SERVICE' -ForegroundColor Cyan; node server.js"

# Start Marketplace Service (Port 3002)
Write-Host "Starting Marketplace Service (Port 3002)..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd C:\EduSync\EduSync\marketplace-service; Write-Host '🛒 MARKETPLACE SERVICE' -ForegroundColor Magenta; npm start"

# Start RentHub Service (Port 3003)
Write-Host "Starting RentHub Service (Port 3003)..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd C:\EduSync\EduSync\renthub-service; Write-Host '🏠 RENTHUB SERVICE' -ForegroundColor Yellow; npm start"

# Start Gateway (Port 8000)
Write-Host "Starting API Gateway (Port 8000)..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd C:\EduSync\EduSync\gateway; Write-Host '🌐 API GATEWAY' -ForegroundColor Blue; node server.js"

# Wait a bit for backend services to start
Start-Sleep -Seconds 3

# Start Client (Port 5173)
Write-Host "Starting React Client (Port 5173)..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd C:\EduSync\EduSync\client; Write-Host '⚛️  REACT CLIENT' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "✅ All services are starting!" -ForegroundColor Green
Write-Host ""
Write-Host "Services will open in separate terminal windows:" -ForegroundColor White
Write-Host "  🔐 Auth Service:        http://localhost:3001" -ForegroundColor Cyan
Write-Host "  🛒 Marketplace Service: http://localhost:3002" -ForegroundColor Magenta
Write-Host "  🏠 RentHub Service:     http://localhost:3003" -ForegroundColor Yellow
Write-Host "  🌐 API Gateway:         http://localhost:8000" -ForegroundColor Blue
Write-Host "  ⚛️  React Client:        http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Stop All EduSync Services
# This script kills all running services on their respective ports

Write-Host "🛑 Stopping All EduSync Services..." -ForegroundColor Red

Write-Host "Killing processes on ports 3001, 3002, 3003, 3004, 8000, 5173..." -ForegroundColor Yellow

try {
    npx kill-port 3001 3002 3003 3004 8000 5173
    Write-Host "✅ All services stopped successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Error stopping services: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

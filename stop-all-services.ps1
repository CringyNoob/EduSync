# Stop All EduSync Services
# This script kills all running services on their respective ports

<<<<<<< HEAD
Write-Host "🛑 Stopping All EduSync Services..." -ForegroundColor Red
=======
Write-Host ">> Stopping All EduSync Services..." -ForegroundColor Red
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)

Write-Host "Killing processes on ports 3001, 3002, 3003, 3004, 8000, 5173..." -ForegroundColor Yellow

try {
    npx kill-port 3001 3002 3003 3004 8000 5173
<<<<<<< HEAD
    Write-Host "✅ All services stopped successfully!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Error stopping services: $_" -ForegroundColor Red
=======
    Write-Host "[OK] All services stopped successfully!" -ForegroundColor Green
}
catch {
    Write-Host "[WARN] Error stopping services: $_" -ForegroundColor Red
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

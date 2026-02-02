# 🚀 Quick Start - Test Admin Pages

Write-Host "🔧 EduSync Admin Pages - Quick Test" -ForegroundColor Cyan
Write-Host ""

# Check if services are running
Write-Host "📋 Checking services..." -ForegroundColor Yellow
$services = @(
    @{Port=3001; Name="Auth Service"},
    @{Port=3002; Name="Marketplace Service"},
    @{Port=3004; Name="NewsBox Service"},
    @{Port=8000; Name="Gateway"},
    @{Port=5173; Name="Frontend"}
)

$allRunning = $true
foreach ($service in $services) {
    $connection = Test-NetConnection -ComputerName localhost -Port $service.Port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "✅ $($service.Name) (Port $($service.Port))" -ForegroundColor Green
    } else {
        Write-Host "❌ $($service.Name) (Port $($service.Port)) NOT RUNNING" -ForegroundColor Red
        $allRunning = $false
    }
}

Write-Host ""

if (-not $allRunning) {
    Write-Host "⚠️  Some services are not running!" -ForegroundColor Yellow
    Write-Host "Would you like to start all services? (Y/N)" -ForegroundColor Cyan
    $response = Read-Host
    
    if ($response -eq 'Y' -or $response -eq 'y') {
        Write-Host "🚀 Starting all services..." -ForegroundColor Green
        & ".\start-all-services.ps1"
        Write-Host ""
        Write-Host "⏳ Waiting 10 seconds for services to start..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    }
}

Write-Host "🌐 Opening Admin Dashboard..." -ForegroundColor Cyan
Start-Process "http://localhost:5173/admin-dashboard"

Write-Host ""
Write-Host "✅ Admin Dashboard opened in browser!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Look for the YELLOW DEBUG PANEL at the top"
Write-Host "  2. Check if 'Is Admin Active' shows ✅"
Write-Host "  3. Use the TEST BUTTONS to access admin pages"
Write-Host "  4. Open Browser Console (F12) to see debug logs"
Write-Host ""
Write-Host "📍 Admin Page URLs:" -ForegroundColor Cyan
Write-Host "  • User Management:  http://localhost:5173/admin/users"
Write-Host "  • Vendor Management: http://localhost:5173/admin/vendors"
Write-Host "  • News Manager:     http://localhost:5173/admin/newsManager"
Write-Host "  • Analytics:        http://localhost:5173/admin/analytics"
Write-Host ""
Write-Host "📚 For troubleshooting, see:" -ForegroundColor Yellow
Write-Host "  • ADMIN-ACCESS-GUIDE.md"
Write-Host "  • ADMIN-ACCESS-FIXES.md"
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Setup All EduSync Services
# This script installs dependencies for all microservices
# Run this ONCE before starting services, or after updating dependencies

Write-Host "Setting Up All EduSync Services..." -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="Auth Service"; Path="c:\Edusync\Edusync\auth-service"},
    @{Name="Marketplace Service"; Path="c:\Edusync\Edusync\marketplace-service"},
    @{Name="RentHub Service"; Path="c:\Edusync\Edusync\renthub-service"},
    @{Name="NewsBox Service"; Path="c:\Edusync\Edusync\newsbox-service"},
    @{Name="Notices Service"; Path="c:\Edusync\Edusync\notices-service"},
    @{Name="Chat Service"; Path="c:\Edusync\Edusync\chat-service"},
    @{Name="Gateway"; Path="c:\Edusync\Edusync\gateway"},
    @{Name="React Client"; Path="c:\Edusync\Edusync\client"}
)

$totalServices = $services.Count
$currentService = 0

foreach ($service in $services) {
    $currentService++
    Write-Host "[$currentService/$totalServices] Installing dependencies for $($service.Name)..." -ForegroundColor Yellow
    
    if (Test-Path $service.Path) {
        Push-Location $service.Path
        
        try {
            # Run npm install
            npm install --legacy-peer-deps 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  SUCCESS: $($service.Name) dependencies installed successfully" -ForegroundColor Green
            } else {
                Write-Host "  WARNING: $($service.Name) had some warnings (may still work)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  ERROR: Failed to install dependencies for $($service.Name)" -ForegroundColor Red
            Write-Host "     Error: $_" -ForegroundColor Red
        }
        
        Pop-Location
    } else {
        Write-Host "  WARNING: Directory not found: $($service.Path)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Setup databases (if not done already)" -ForegroundColor Gray
Write-Host "  2. Configure .env files for each service" -ForegroundColor Gray
Write-Host "  3. Run: .\start-all-services.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')

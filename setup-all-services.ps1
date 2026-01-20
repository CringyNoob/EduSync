# Setup All EduSync Services
# This script installs dependencies for all microservices
# Run this ONCE before starting services, or after updating dependencies

<<<<<<< HEAD
Write-Host "🔧 Setting Up All EduSync Services..." -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="Auth Service"; Path="C:\EduSync\EduSync\auth-service"; Icon="🔐"},
    @{Name="Marketplace Service"; Path="C:\EduSync\EduSync\marketplace-service"; Icon="🛒"},
    @{Name="RentHub Service"; Path="C:\EduSync\EduSync\renthub-service"; Icon="🏠"},
    @{Name="NewsBox Service"; Path="C:\EduSync\EduSync\newsbox-service"; Icon="📰"},
    @{Name="Gateway"; Path="C:\EduSync\EduSync\gateway"; Icon="🌐"},
    @{Name="React Client"; Path="C:\EduSync\EduSync\client"; Icon="⚛️"}
=======
Write-Host ">> Setting Up All EduSync Services..." -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="Auth Service"; Path="$PSScriptRoot\auth-service"; Icon="[AUTH]"},
    @{Name="Marketplace Service"; Path="$PSScriptRoot\marketplace-service"; Icon="[MARKET]"},
    @{Name="RentHub Service"; Path="$PSScriptRoot\renthub-service"; Icon="[RENT]"},
    @{Name="NewsBox Service"; Path="$PSScriptRoot\newsbox-service"; Icon="[NEWS]"},
    @{Name="Gateway"; Path="$PSScriptRoot\gateway"; Icon="[GATEWAY]"},
    @{Name="React Client"; Path="$PSScriptRoot\client"; Icon="[CLIENT]"}
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
)

$totalServices = $services.Count
$currentService = 0

foreach ($service in $services) {
    $currentService++
    Write-Host "[$currentService/$totalServices] $($service.Icon) Installing dependencies for $($service.Name)..." -ForegroundColor Yellow
    
    if (Test-Path $service.Path) {
        Push-Location $service.Path
        
        try {
            # Run npm install
            npm install --legacy-peer-deps 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
<<<<<<< HEAD
                Write-Host "  ✅ $($service.Name) dependencies installed successfully" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  $($service.Name) had some warnings (may still work)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  ❌ Failed to install dependencies for $($service.Name)" -ForegroundColor Red
=======
                Write-Host "  [OK] $($service.Name) dependencies installed successfully" -ForegroundColor Green
            } else {
                Write-Host "  [WARN] $($service.Name) had some warnings (may still work)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  [ERR] Failed to install dependencies for $($service.Name)" -ForegroundColor Red
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
            Write-Host "     Error: $_" -ForegroundColor Red
        }
        
        Pop-Location
    } else {
<<<<<<< HEAD
        Write-Host "  ⚠️  Directory not found: $($service.Path)" -ForegroundColor Red
=======
        Write-Host "  [WARN] Directory not found: $($service.Path)" -ForegroundColor Red
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
    }
    
    Write-Host ""
}

Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
<<<<<<< HEAD
Write-Host "  ✅ SETUP COMPLETE!" -ForegroundColor Green
=======
Write-Host "  [OK] SETUP COMPLETE!" -ForegroundColor Green
>>>>>>> d919d14 (Enhanced Chat Feature. for standup 3.)
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Setup databases (if not done already)" -ForegroundColor Gray
Write-Host "  2. Configure .env files for each service" -ForegroundColor Gray
Write-Host "  3. Run: .\start-all-services.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

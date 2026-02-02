# Payment Integration Installation Script
# Run this in PowerShell from the marketplace-service directory

Write-Host "🚀 Installing Payment Integration Dependencies..." -ForegroundColor Cyan

# Install npm packages
Write-Host "`n📦 Installing sslcommerz-lts and uuid..." -ForegroundColor Yellow
npm install sslcommerz-lts uuid

Write-Host "`n✅ Dependencies installed successfully!" -ForegroundColor Green

# Check if .env has SSLCommerz credentials
Write-Host "`n🔍 Checking .env configuration..." -ForegroundColor Yellow
$envContent = Get-Content .env -Raw

if ($envContent -match "SSLCOMMERZ_STORE_ID=your_store_id_here") {
    Write-Host "⚠️  WARNING: SSLCommerz credentials not configured!" -ForegroundColor Red
    Write-Host "   Please update the following in .env file:" -ForegroundColor Yellow
    Write-Host "   - SSLCOMMERZ_STORE_ID" -ForegroundColor Yellow
    Write-Host "   - SSLCOMMERZ_STORE_PASSWORD" -ForegroundColor Yellow
    Write-Host "`n   Get credentials from: https://developer.sslcommerz.com/registration/" -ForegroundColor Cyan
} else {
    Write-Host "✅ SSLCommerz credentials configured!" -ForegroundColor Green
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Run the SQL migration (add-payment-tables.sql) in your Aiven console" -ForegroundColor White
Write-Host "2. Configure SSLCommerz credentials in .env if not done" -ForegroundColor White
Write-Host "3. Restart the marketplace service" -ForegroundColor White
Write-Host "4. Test payment flow from frontend" -ForegroundColor White

Write-Host "`n📖 Full guide: PAYMENT-INTEGRATION-GUIDE.md" -ForegroundColor Cyan

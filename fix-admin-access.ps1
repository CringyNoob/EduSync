# Quick fix for Admin Access - Run this in PowerShell

Write-Host "🔧 Admin Access Fix Script" -ForegroundColor Cyan
Write-Host ""

# Get token from browser console
Write-Host "Step 1: Get your token" -ForegroundColor Yellow
Write-Host "Open browser console (F12) and run:" -ForegroundColor White
Write-Host "  localStorage.getItem('edusync_token')" -ForegroundColor Gray
Write-Host ""
Write-Host "Paste your token here (press Enter when done):" -ForegroundColor Cyan
$token = Read-Host

if (-not $token) {
    Write-Host "❌ No token provided. Exiting..." -ForegroundColor Red
    exit
}

# Decode JWT to check roles
Write-Host ""
Write-Host "Step 2: Checking your current roles..." -ForegroundColor Yellow

# Split token and get payload
$parts = $token.Split('.')
if ($parts.Length -ne 3) {
    Write-Host "❌ Invalid token format" -ForegroundColor Red
    exit
}

# Base64 decode payload
$payload = $parts[1]
$padding = '=' * (4 - ($payload.Length % 4))
$base64 = $payload.Replace('-', '+').Replace('_', '/') + $padding
$bytes = [Convert]::FromBase64String($base64)
$json = [System.Text.Encoding]::UTF8.GetString($bytes)
$decoded = $json | ConvertFrom-Json

Write-Host ""
Write-Host "👤 Your User Info:" -ForegroundColor Cyan
Write-Host "  Email: $($decoded.email)" -ForegroundColor White
Write-Host "  Roles: $($decoded.roles)" -ForegroundColor White
Write-Host "  Active Role: $($decoded.activeRole)" -ForegroundColor White
Write-Host ""

# Check if user has ADMIN role
$hasAdminRole = $decoded.roles -contains 'ADMIN'

if ($hasAdminRole) {
    if ($decoded.activeRole -eq 'ADMIN') {
        Write-Host "✅ You already have ADMIN access!" -ForegroundColor Green
        Write-Host "   But middleware was broken. It's fixed now - refresh your browser!" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  You have ADMIN role but it's not active" -ForegroundColor Yellow
        Write-Host "   Current active role: $($decoded.activeRole)" -ForegroundColor White
        Write-Host ""
        Write-Host "Solution: Switch to Admin mode from Admin Dashboard" -ForegroundColor Cyan
        Write-Host "  1. Go to http://localhost:5173/admin-dashboard" -ForegroundColor Gray
        Write-Host "  2. Look for 'Switch to Admin Mode' button" -ForegroundColor Gray
        Write-Host "  3. Verify with OTP" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Your account does NOT have ADMIN role" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solution: Add ADMIN role to your account in database" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Run this SQL query in PgAdmin (auth_db):" -ForegroundColor Yellow
    Write-Host "  UPDATE users " -ForegroundColor Gray
    Write-Host "  SET roles = ARRAY['STUDENT', 'ADMIN'], " -ForegroundColor Gray
    Write-Host "      active_role = 'ADMIN' " -ForegroundColor Gray
    Write-Host "  WHERE email = '$($decoded.email)';" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Then logout and login again to get new token." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Services restarted with fixed middleware ✅" -ForegroundColor Green
Write-Host "  2. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "  3. Hard refresh (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "  4. Try accessing admin pages again" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

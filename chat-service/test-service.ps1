# Chat Service Quick Test Script
# Tests the chat service endpoints

$baseUrl = "http://localhost:3006"

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       EduSync Chat Service - Quick Test                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Health check passed!" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
    Write-Host "   Uptime: $($response.uptime) seconds" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Root Info
Write-Host "2. Testing Root Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Service info retrieved!" -ForegroundColor Green
    Write-Host "   Service: $($response.service)" -ForegroundColor Gray
    Write-Host "   Version: $($response.version)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Root endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Auth Required Endpoint (should return 401)
Write-Host "3. Testing Auth Protection..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/chat/my-conversations" -Method GET -ErrorAction Stop
    Write-Host "   ⚠️ No auth error returned (unexpected)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "   ✅ Auth protection working (401 returned as expected)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Tests completed!" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test with authentication, use a valid JWT token:" -ForegroundColor White
Write-Host "  1. Login to get a token from auth-service" -ForegroundColor Gray
Write-Host "  2. Use the token in Authorization: Bearer <token>" -ForegroundColor Gray
Write-Host ""

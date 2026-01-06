# Marketplace Service API Test Script
# Run: .\test-marketplace-apis.ps1

$baseUrl = "http://localhost:3002"
$testsPassed = 0
$testsFailed = 0

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "MARKETPLACE SERVICE API TESTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [string]$Body = $null
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    Write-Host "  → $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            ContentType = "application/json"
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "  ✓ PASSED" -ForegroundColor Green
        Write-Host "    Response: $($response | ConvertTo-Json -Compress -Depth 2)" -ForegroundColor DarkGray
        $script:testsPassed++
    }
    catch {
        Write-Host "  ✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $script:testsFailed++
    }
    Write-Host ""
}

# Test 1: Health Check
Test-Endpoint -Name "Health Check" -Method "GET" -Url "$baseUrl/"

# Test 2: Get Startups
Test-Endpoint -Name "Get All Startups" -Method "GET" -Url "$baseUrl/vendors?type=STARTUP"

# Test 3: Get Food Vendors
Test-Endpoint -Name "Get All Food Vendors" -Method "GET" -Url "$baseUrl/vendors?type=FOOD_VENDOR"

# Test 4: Get Vendor by ID
Test-Endpoint -Name "Get Vendor by ID (ID=8b5b503a-b122-4554-b5ab-0e251fecd78d)" -Method "GET" -Url "$baseUrl/vendors/8b5b503a-b122-4554-b5ab-0e251fecd78d"

# Test 5: Get Product by ID
Test-Endpoint -Name "Get Product by ID (ID=2dd4c6a6-113a-4d3f-8806-302b442a3a2a)" -Method "GET" -Url "$baseUrl/products/2dd4c6a6-113a-4d3f-8806-302b442a3a2a"

# Test 6: Get All Pre-Owned
Test-Endpoint -Name "Get All Pre-Owned Listings" -Method "GET" -Url "$baseUrl/preowned"

# Test 7: Get Pre-Owned by Category
Test-Endpoint -Name "Get Pre-Owned Electronics" -Method "GET" -Url "$baseUrl/preowned?category=ELECTRONICS"

# Test 8: Create Pre-Owned Listing
$newListing = @{
    seller_id = "7c1a0a18-015f-47bf-8be4-abc65c0e2722"
    seller_name = "Test User"
    title = "Test Textbook"
    description = "Great condition"
    price = 45.00
    category = "TEXTBOOKS"
    images = @("https://example.com/book.jpg")
} | ConvertTo-Json

Test-Endpoint -Name "Create Pre-Owned Listing" -Method "POST" -Url "$baseUrl/preowned" -Body $newListing

# Test 9: Get Pre-Owned by ID
Test-Endpoint -Name "Get Pre-Owned by ID (ID=d0922de3-98a5-40c6-a9b7-44f0775b40a2)" -Method "GET" -Url "$baseUrl/preowned/d0922de3-98a5-40c6-a9b7-44f0775b40a2"

# Test 10: Mark as Sold
Test-Endpoint -Name "Mark Pre-Owned as Sold (ID=d0922de3-98a5-40c6-a9b7-44f0775b40a2)" -Method "PUT" -Url "$baseUrl/preowned/d0922de3-98a5-40c6-a9b7-44f0775b40a2/sold"

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Passed: $testsPassed" -ForegroundColor Green
Write-Host "Failed: $testsFailed" -ForegroundColor Red
Write-Host "Total:  $($testsPassed + $testsFailed)" -ForegroundColor White
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "All tests passed! ✓" -ForegroundColor Green
} else {
    Write-Host "Some tests failed. Check the output above." -ForegroundColor Yellow
}

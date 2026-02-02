# Chat Service Database Setup Script
# Run this script after setting up your .env file

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       EduSync Chat Service - Database Setup            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$scriptDir = $PSScriptRoot

# Check if .env exists
$envFile = Join-Path $scriptDir ".env"
$envExample = Join-Path $scriptDir ".env.example"

if (-Not (Test-Path $envFile)) {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        Write-Host "✅ .env file created. Please update credentials if needed." -ForegroundColor Green
    } else {
        Write-Host "❌ .env.example not found! Please create .env manually." -ForegroundColor Red
        exit 1
    }
}

# Read .env file
$envContent = Get-Content $envFile | ForEach-Object {
    if ($_ -match '^([^#=]+)=(.*)$') {
        [PSCustomObject]@{
            Name  = $matches[1].Trim()
            Value = $matches[2].Trim()
        }
    }
}

$DB_HOST = ($envContent | Where-Object Name -eq 'DB_HOST').Value
$DB_PORT = ($envContent | Where-Object Name -eq 'DB_PORT').Value
$DB_USER = ($envContent | Where-Object Name -eq 'DB_USER').Value
$DB_PASSWORD = ($envContent | Where-Object Name -eq 'DB_PASSWORD').Value
$DB_NAME = ($envContent | Where-Object Name -eq 'DB_NAME').Value

if (-Not $DB_HOST) {
    Write-Host "❌ DB_HOST not found in .env" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📊 Database Configuration:" -ForegroundColor Cyan
Write-Host "   Host: $DB_HOST" -ForegroundColor White
Write-Host "   Port: $DB_PORT" -ForegroundColor White
Write-Host "   User: $DB_USER" -ForegroundColor White
Write-Host "   Database: $DB_NAME" -ForegroundColor White
Write-Host ""

# Instructions for manual setup
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "📋 Manual Database Setup Instructions:" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Connect to your Aiven PostgreSQL:" -ForegroundColor White
Write-Host "   psql `"postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/defaultdb?sslmode=require`"" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Create the chat_db database (if it doesn't exist):" -ForegroundColor White
Write-Host "   CREATE DATABASE chat_db;" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Connect to chat_db:" -ForegroundColor White
Write-Host "   \c chat_db" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Run the schema file:" -ForegroundColor White
Write-Host "   \i $scriptDir\database-schema.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "Or run everything in one command (from psql):" -ForegroundColor White
Write-Host "   psql `"postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/chat_db?sslmode=require`" -f $scriptDir\database-schema.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ After running the schema, start the service with:" -ForegroundColor Green
Write-Host "   cd $scriptDir" -ForegroundColor White
Write-Host "   npm install" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green

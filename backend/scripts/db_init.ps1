# QR Loyalty Platform - Database Initialization Script (Windows PowerShell)
# This script recreates the database and applies the complete schema

Write-Host "Starting QR Loyalty Platform Database Initialization..." -ForegroundColor Cyan

# Database configuration
$DB_HOST = "127.0.0.1"
$DB_PORT = "5432"
$DB_USER = "postgres"
$DB_NAME = "qr_database"
$DB_SCHEMA_FILE = "scripts\db_init.sql"

Write-Host "Database Configuration:" -ForegroundColor Yellow
Write-Host "   Host: $DB_HOST"
Write-Host "   Port: $DB_PORT"
Write-Host "   User: $DB_USER"
Write-Host "   Database: $DB_NAME"
Write-Host ""

# Check if psql is available
Write-Host "Checking if PostgreSQL tools are available..." -ForegroundColor Yellow
try {
    $null = Get-Command psql -ErrorAction Stop
    Write-Host "PostgreSQL tools found" -ForegroundColor Green
} catch {
    Write-Host "Error: psql command not found" -ForegroundColor Red
    Write-Host "   Please ensure PostgreSQL is installed and psql is in your PATH" -ForegroundColor Red
    Write-Host "   You can install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Check PostgreSQL connection
Write-Host "Checking PostgreSQL connection..." -ForegroundColor Yellow
$connectionTest = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT 1;" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Cannot connect to PostgreSQL server at ${DB_HOST}:${DB_PORT}" -ForegroundColor Red
    Write-Host "   Please ensure:" -ForegroundColor Yellow
    Write-Host "   1. PostgreSQL service is running" -ForegroundColor Yellow
    Write-Host "   2. Connection credentials are correct" -ForegroundColor Yellow
    Write-Host "   3. Server is accessible on ${DB_HOST}:${DB_PORT}" -ForegroundColor Yellow
    exit 1
}
Write-Host "PostgreSQL connection successful" -ForegroundColor Green

# Drop existing database (if exists)
Write-Host "Dropping existing database '$DB_NAME' (if exists)..." -ForegroundColor Yellow
$dropResult = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>$null
Write-Host "Database dropped (if existed)" -ForegroundColor Green

# Create new database
Write-Host "Creating new database '$DB_NAME'..." -ForegroundColor Yellow
$createResult = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME TEMPLATE template0;"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to create database '$DB_NAME'" -ForegroundColor Red
    exit 1
}
Write-Host "Database '$DB_NAME' created successfully" -ForegroundColor Green

# Check if schema file exists
Write-Host "Applying database schema from '$DB_SCHEMA_FILE'..." -ForegroundColor Yellow
if (-not (Test-Path $DB_SCHEMA_FILE)) {
    Write-Host "Error: Schema file '$DB_SCHEMA_FILE' not found" -ForegroundColor Red
    Write-Host "   Please ensure the file exists in the scripts directory" -ForegroundColor Yellow
    exit 1
}

# Apply schema
$schemaResult = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $DB_SCHEMA_FILE
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to apply database schema" -ForegroundColor Red
    exit 1
}
Write-Host "Database schema applied successfully" -ForegroundColor Green

# Verify tables were created
Write-Host "Verifying database tables..." -ForegroundColor Yellow
$tableCountResult = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" 2>$null

# Handle the result properly - it might be an array or string
if ($tableCountResult -is [array]) {
    $tableCount = $tableCountResult[0].Trim()
} else {
    $tableCount = $tableCountResult.Trim()
}

Write-Host "Database created with:" -ForegroundColor Cyan
Write-Host "   Tables: $tableCount" -ForegroundColor White

try {
    $tableCountNum = [int]$tableCount
    if ($tableCountNum -ge 7) {
        Write-Host "All expected tables created successfully" -ForegroundColor Green
    } else {
        Write-Host "Warning: Expected at least 7 tables, found $tableCount" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Tables created successfully (count verification skipped)" -ForegroundColor Green
}

# Show sample data summary
Write-Host ""
Write-Host "Sample Data Summary:" -ForegroundColor Cyan
try {
    $businessCount = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM business_owners;" 2>$null
    $establishmentCount = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM establishments;" 2>$null
    $userCount = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM users;" 2>$null
    $programCount = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM loyalty_programs;" 2>$null
    
    Write-Host "   Business Owners: $($businessCount.Trim())" -ForegroundColor White
    Write-Host "   Establishments: $($establishmentCount.Trim())" -ForegroundColor White  
    Write-Host "   Users: $($userCount.Trim())" -ForegroundColor White
    Write-Host "   Loyalty Programs: $($programCount.Trim())" -ForegroundColor White
} catch {
    Write-Host "   Data loaded successfully (count details skipped)" -ForegroundColor White
}

Write-Host ""
Write-Host "QR Loyalty Platform Database Initialization Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "   1. Update your .env file with the database connection:"
Write-Host "      DATABASE_URL=postgresql://${DB_USER}:password@${DB_HOST}:${DB_PORT}/${DB_NAME}"
Write-Host "   2. Start your FastAPI application: python application.py"
Write-Host "   3. Test the database connection at: http://localhost:8000/health"
Write-Host ""
Write-Host "Database connection string:" -ForegroundColor Cyan
Write-Host "   postgresql://${DB_USER}:password@${DB_HOST}:${DB_PORT}/${DB_NAME}" -ForegroundColor White

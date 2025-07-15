#!/bin/bash

# QR Loyalty Platform - Database Initialization Script
# This script recreates the database and applies the complete schema

echo "🔄 Starting QR Loyalty Platform Database Initialization..."

# Database configuration
DB_HOST="127.0.0.1"
DB_PORT="5432"
DB_USER="postgres"
DB_NAME="qr_database"
DB_SCHEMA_FILE="scripts/db_init.sql"

echo "📋 Database Configuration:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   User: $DB_USER"
echo "   Database: $DB_NAME"
echo ""

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL connection..."
if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER > /dev/null 2>&1; then
    echo "❌ Error: Cannot connect to PostgreSQL server at $DB_HOST:$DB_PORT"
    echo "   Please ensure PostgreSQL is running and accessible."
    exit 1
fi
echo "✅ PostgreSQL connection successful"

# Drop existing database (if exists)
echo "🗑️  Dropping existing database '$DB_NAME' (if exists)..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null
echo "✅ Database dropped (if existed)"

# Create new database
echo "🏗️  Creating new database '$DB_NAME'..."
if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME TEMPLATE template0;"; then
    echo "❌ Error: Failed to create database '$DB_NAME'"
    exit 1
fi
echo "✅ Database '$DB_NAME' created successfully"

# Apply schema
echo "📊 Applying database schema from '$DB_SCHEMA_FILE'..."
if [ ! -f "$DB_SCHEMA_FILE" ]; then
    echo "❌ Error: Schema file '$DB_SCHEMA_FILE' not found"
    exit 1
fi

if ! psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $DB_SCHEMA_FILE; then
    echo "❌ Error: Failed to apply database schema"
    exit 1
fi
echo "✅ Database schema applied successfully"

# Verify tables were created
echo "🔍 Verifying database tables..."
TABLE_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")
VIEW_COUNT=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public';")

echo "📊 Database created with:"
echo "   Tables: $TABLE_COUNT"
echo "   Views: $VIEW_COUNT"

if [ "$TABLE_COUNT" -ge 7 ]; then
    echo "✅ All expected tables created successfully"
else
    echo "⚠️  Warning: Expected at least 7 tables, found $TABLE_COUNT"
fi

echo ""
echo "🎉 QR Loyalty Platform Database Initialization Complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Update your .env file with the database connection:"
echo "      DATABASE_URL=postgresql://$DB_USER:password@$DB_HOST:$DB_PORT/$DB_NAME"
echo "   2. Start your FastAPI application: python application.py"
echo "   3. Test the database connection at: http://localhost:8000/health"
echo ""
echo "🔗 Database connection string:"
echo "   postgresql://$DB_USER:password@$DB_HOST:$DB_PORT/$DB_NAME"

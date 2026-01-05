#!/bin/bash

# Migration Script for DataTeX v2 Typed Metadata
# This script applies all SQL migrations to the database

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}DataTeX v2 - Typed Metadata Migration Script${NC}"
echo "=============================================="

# Find database path
DB_DIR="$HOME/.local/share/datatex"
DB_PATH="$DB_DIR/project.db"

if [ ! -f "$DB_PATH" ]; then
    echo -e "${RED}Error: Database not found at $DB_PATH${NC}"
    echo "Please specify the database path:"
    read -p "Database path: " DB_PATH
    
    if [ ! -f "$DB_PATH" ]; then
        echo -e "${RED}Error: Database file does not exist!${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}Found database: $DB_PATH${NC}"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}Error: Migrations directory not found at $MIGRATIONS_DIR${NC}"
    exit 1
fi

# Backup database
BACKUP_PATH="${DB_PATH}.backup_$(date +%Y%m%d_%H%M%S)"
echo -e "${BLUE}Creating backup: $BACKUP_PATH${NC}"
cp "$DB_PATH" "$BACKUP_PATH"
echo -e "${GREEN}Backup created!${NC}"
echo ""

# Apply migrations
MIGRATIONS=(
    "002_common_infrastructure.sql"
    "003_resource_files.sql"
    "004_resource_documents.sql"
    "005_resource_tables.sql"
    "006_resource_figures.sql"
    "007_resource_commands.sql"
    "008_resource_packages.sql"
    "009_resource_preambles.sql"
    "010_resource_classes.sql"
    "011_migrate_json_to_typed.sql"
)

echo -e "${BLUE}Applying migrations...${NC}"
echo ""

for migration in "${MIGRATIONS[@]}"; do
    migration_path="$MIGRATIONS_DIR/$migration"
    
    if [ ! -f "$migration_path" ]; then
        echo -e "${RED}Warning: Migration file not found: $migration${NC}"
        continue
    fi
    
    echo -e "${BLUE}Applying: $migration${NC}"
    
    if sqlite3 "$DB_PATH" < "$migration_path"; then
        echo -e "${GREEN}✓ Success${NC}"
    else
        echo -e "${RED}✗ Failed!${NC}"
        echo "Migration failed. Database has been backed up to: $BACKUP_PATH"
        echo "You can restore it with: cp $BACKUP_PATH $DB_PATH"
        exit 1
    fi
    
    echo ""
done

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}All migrations applied successfully!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Database: $DB_PATH"
echo "Backup: $BACKUP_PATH"
echo ""
echo "You can now restart the DataTeX application to use the typed metadata system."
echo ""

# Verify tables were created
echo -e "${BLUE}Verifying tables...${NC}"
TABLE_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name LIKE 'resource_%';")
echo -e "${GREEN}Created $TABLE_COUNT resource extension tables${NC}"

echo ""
echo -e "${BLUE}Sample queries to test:${NC}"
echo "sqlite3 $DB_PATH 'SELECT * FROM fields;'"
echo "sqlite3 $DB_PATH 'SELECT * FROM chapters;'"
echo "sqlite3 $DB_PATH 'SELECT * FROM file_types;'"

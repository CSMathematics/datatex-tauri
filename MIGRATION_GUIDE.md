# Running SQL Migrations

## Quick Start

Τρέξε το migration script:

```bash
cd /home/spyros/datatex-v2/src-tauri
./run_migrations.sh
```

Το script θα:
1. ✅ Βρει αυτόματα τη database (`~/.local/share/datatex/project.db`)
2. ✅ Δημιουργήσει backup πριν τις αλλαγές
3. ✅ Τρέξει όλα τα migrations με τη σειρά (002-011)
4. ✅ Verify ότι δημιουργήθηκαν οι πίνακες

## Manual Migration (Alternative)

Αν προτιμάς να τρέξεις manual:

```bash
DB_PATH="$HOME/.local/share/datatex/project.db"
cd /home/spyros/datatex-v2/src-tauri/migrations

# Backup first
cp "$DB_PATH" "${DB_PATH}.backup"

# Run migrations in order
sqlite3 "$DB_PATH" < 002_common_infrastructure.sql
sqlite3 "$DB_PATH" < 003_resource_files.sql
sqlite3 "$DB_PATH" < 004_resource_documents.sql
sqlite3 "$DB_PATH" < 005_resource_tables.sql
sqlite3 "$DB_PATH" < 006_resource_figures.sql
sqlite3 "$DB_PATH" < 007_resource_commands.sql
sqlite3 "$DB_PATH" < 008_resource_packages.sql
sqlite3 "$DB_PATH" < 009_resource_preambles.sql
sqlite3 "$DB_PATH" < 010_resource_classes.sql
sqlite3 "$DB_PATH" < 011_migrate_json_to_typed.sql
```

## Verify Migration

```bash
DB_PATH="$HOME/.local/share/datatex/project.db"

# Check tables created
sqlite3 "$DB_PATH" ".tables" | grep resource_

# Check sample data
sqlite3 "$DB_PATH" "SELECT * FROM fields;"
sqlite3 "$DB_PATH" "SELECT * FROM file_types;"
sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM resource_files;"
```

## After Migration

1. Restart the DataTeX app: `pnpm tauri dev`
2. Open Database tab
3. Select a resource
4. Go to Metadata tab
5. You should see the new typed metadata editor!

## Rollback (if needed)

```bash
DB_PATH="$HOME/.local/share/datatex/project.db"
# Find your backup
ls -lh "${DB_PATH}.backup"*

# Restore
cp "${DB_PATH}.backup_TIMESTAMP" "$DB_PATH"
```

## What Gets Created

### Lookup Tables (with default data)
- `fields` - Mathematical fields (Calculus, Algebra, etc.)
- `chapters` - Chapters per field
- `sections` - Sections per chapter
- `exercise_types` - Exercise, Theorem, Definition, etc.
- `file_types` - Document types
- `custom_tags` - User tags
- `texlive_packages` - LaTeX packages
- Hierarchical folders (basic_folders, sub_folders, subsub_folders)

### Resource Extension Tables (for typed metadata)
- `resource_files` + 6 junction tables
- `resource_documents` + 3 junction tables
- `resource_tables` + 2 junction tables
- `resource_figures` + 2 junction tables
- `resource_commands` + 1 junction table
- `resource_packages` + 2 junction tables
- `resource_preambles` + 2 junction tables
- `resource_classes` + 1 junction table

### History Tables (for version control)
- `resource_file_history`
- `resource_document_history`
- etc. (8 total)

**Total**: ~40 new tables created!

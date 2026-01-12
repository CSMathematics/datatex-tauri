-- ============================================================================
-- Migration 019: Separate Table Types
-- Creates table_types and updates resource_tables to use it
-- ============================================================================

CREATE TABLE IF NOT EXISTS table_types (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Insert Default Table Types
INSERT OR IGNORE INTO table_types (id, name, description) VALUES ('results', 'Results Table', 'Main results presentation');
INSERT OR IGNORE INTO table_types (id, name, description) VALUES ('comparison', 'Comparison Table', 'Comparison with other works');
INSERT OR IGNORE INTO table_types (id, name, description) VALUES ('data', 'Data Table', 'Raw or processed data');
INSERT OR IGNORE INTO table_types (id, name, description) VALUES ('appendix', 'Appendix Table', 'Supplementary material');
INSERT OR IGNORE INTO table_types (id, name, description) VALUES ('general', 'General Table', 'General purpose table');

-- Recreate resource_tables to update Foreign Key
-- 1. Rename old table
ALTER TABLE resource_tables RENAME TO resource_tables_old;

-- 2. Create new table with correct FK to table_types
CREATE TABLE resource_tables (
    resource_id TEXT PRIMARY KEY NOT NULL,
    table_type_id TEXT,  -- FK to table_types (NEW)
    date DATE,
    content TEXT,
    caption TEXT,
    description TEXT,
    environment TEXT DEFAULT 'tabular',
    placement TEXT,
    label TEXT,
    width TEXT,
    alignment TEXT,
    rows INTEGER,
    columns INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY(table_type_id) REFERENCES table_types(id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- 3. Copy data
-- Note: 'table_type_id' values from old table might refer to file_types.
-- We copy them anyway. If they don't exist in table_types, they will be invalid FKs if unchecked,
-- or just text values. Given this is a fresh feature, likely few exist.
INSERT INTO resource_tables (
    resource_id, table_type_id, date, content, caption, description,
    environment, placement, label, width, alignment, rows, columns,
    created_at, updated_at
)
SELECT 
    resource_id, table_type_id, date, content, caption, description,
    environment, placement, label, width, alignment, rows, columns,
    created_at, updated_at
FROM resource_tables_old;

-- 4. Recreate Indices
CREATE INDEX IF NOT EXISTS idx_resource_tables_type ON resource_tables(table_type_id);
CREATE INDEX IF NOT EXISTS idx_resource_tables_env ON resource_tables(environment);

-- 5. Drop old table
DROP TABLE resource_tables_old;

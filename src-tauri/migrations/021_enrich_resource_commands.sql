-- ============================================================================
-- Migration 021: Enrich Command Metadata
-- Creates command_types and updates resource_commands schema
-- ============================================================================

CREATE TABLE IF NOT EXISTS command_types (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Insert Default Command Types
INSERT OR IGNORE INTO command_types (id, name, description) VALUES ('newcommand', 'New Command', 'Define a new command');
INSERT OR IGNORE INTO command_types (id, name, description) VALUES ('renewcommand', 'Renew Command', 'Redefine an existing command');
INSERT OR IGNORE INTO command_types (id, name, description) VALUES ('def', 'TeX Definition', 'Low-level TeX definition (\def)');
INSERT OR IGNORE INTO command_types (id, name, description) VALUES ('declare_math_operator', 'Math Operator', 'Define a new math operator (\DeclareMathOperator)');
INSERT OR IGNORE INTO command_types (id, name, description) VALUES ('environment', 'Environment', 'Define a new environment (\newenvironment)');
INSERT OR IGNORE INTO command_types (id, name, description) VALUES ('other', 'Other', 'Other command types');

-- Recreate resource_commands to update Schema
-- 1. Rename old table
ALTER TABLE resource_commands RENAME TO resource_commands_old;

-- 2. Create new table
CREATE TABLE resource_commands (
    resource_id TEXT PRIMARY KEY NOT NULL,
    command_type_id TEXT,  -- FK to command_types
    name TEXT NOT NULL,
    arguments_num INTEGER,      -- Number of arguments (e.g. 2 for [2])
    optional_argument TEXT, -- Default value for first arg (e.g. [default])
    content TEXT,  -- Command definition code
    example TEXT,  -- Usage example
    description TEXT,
    built_in BOOLEAN DEFAULT FALSE,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY(resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY(command_type_id) REFERENCES command_types(id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- 3. Copy data
-- Map old 'file_type_id' or 'macro_command_type_id' to 'command_type_id' if possible
-- For now, we'll try to map exact matches or default to NULL.
-- Since previous schema had file_type_id, we can attempt to copy it if it matches known IDs, 
-- but likely it was pointing to file_types table. 
-- We will just migrate the core data and let the type be NULL or 'other' initially.
INSERT INTO resource_commands (
    resource_id, name, content, description, built_in,
    created_at, updated_at
)
SELECT 
    resource_id, name, content, description, built_in,
    created_at, updated_at
FROM resource_commands_old;

-- 4. Recreate Indices
CREATE INDEX IF NOT EXISTS idx_resource_commands_type ON resource_commands(command_type_id);
CREATE INDEX IF NOT EXISTS idx_resource_commands_name ON resource_commands(name);

-- 5. Drop old table
DROP TABLE resource_commands_old;

-- 6. Create Junction Tables
CREATE TABLE IF NOT EXISTS resource_command_tags (
    resource_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    PRIMARY KEY(resource_id, tag),
    FOREIGN KEY(resource_id) REFERENCES resource_commands(resource_id) ON DELETE CASCADE,
    FOREIGN KEY(tag) REFERENCES custom_tags(tag) ON UPDATE CASCADE ON DELETE CASCADE
);

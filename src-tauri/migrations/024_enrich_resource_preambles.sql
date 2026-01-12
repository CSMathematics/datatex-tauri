-- ============================================================================
-- Enrich Resource Preambles
-- Add fields for configuration, options, and boolean flags
-- Add junction table for provided commands
-- ============================================================================

-- Recreate resource_preambles with new columns
ALTER TABLE resource_preambles RENAME TO resource_preambles_old;

CREATE TABLE resource_preambles (
    resource_id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    file_type_id TEXT,
    content TEXT,
    description TEXT,
    built_in BOOLEAN DEFAULT FALSE,
    
    -- New Fields
    engines TEXT, -- JSON or comma-separated
    date DATE,
    class TEXT, -- Document Class (e.g. article, report)
    paper_size TEXT,
    font_size INTEGER,
    options TEXT, -- Class options
    languages TEXT,
    geometry TEXT,
    author TEXT,
    title TEXT,
    
    -- Boolean Flags & Config
    use_bibliography BOOLEAN DEFAULT FALSE,
    bib_compile_engine TEXT,
    make_index BOOLEAN DEFAULT FALSE,
    make_glossaries BOOLEAN DEFAULT FALSE,
    has_toc BOOLEAN DEFAULT FALSE, -- Table of Contents
    has_lot BOOLEAN DEFAULT FALSE, -- List of Tables
    has_lof BOOLEAN DEFAULT FALSE, -- List of Figures

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY(file_type_id) REFERENCES file_types(id) ON UPDATE CASCADE ON DELETE SET NULL
);

INSERT INTO resource_preambles (
    resource_id, name, file_type_id, content, description, built_in, created_at, updated_at
)
SELECT 
    resource_id, name, file_type_id, content, description, built_in, created_at, updated_at
FROM resource_preambles_old;

DROP TABLE resource_preambles_old;

-- Indices
CREATE INDEX idx_resource_preambles_name ON resource_preambles(name);
CREATE INDEX idx_resource_preambles_type ON resource_preambles(file_type_id);
CREATE INDEX idx_resource_preambles_builtin ON resource_preambles(built_in);

-- ============================================================================
-- New Junction Tables
-- ============================================================================

-- Preamble Provided Commands
CREATE TABLE IF NOT EXISTS resource_preamble_provided_commands (
    resource_id TEXT NOT NULL,
    command_name TEXT NOT NULL,
    PRIMARY KEY(resource_id, command_name),
    FOREIGN KEY(resource_id) REFERENCES resource_preambles(resource_id) ON DELETE CASCADE
);

-- Note: resource_preamble_packages already exists (Migration 009).
-- Note: resource_preamble_command_types already exists (Migration 009).

-- Trigger
CREATE TRIGGER update_resource_preambles_timestamp
AFTER UPDATE ON resource_preambles
BEGIN
    UPDATE resource_preambles SET updated_at = CURRENT_TIMESTAMP 
    WHERE resource_id = NEW.resource_id;
END;

-- ============================================================================
-- Enrich Resource Classes
-- Add fields for engines, paper_size, font_size, geometry, options, languages
-- Add junction tables for provided commands and required packages (class packages)
-- ============================================================================

-- Recreate resource_classes with new columns
ALTER TABLE resource_classes RENAME TO resource_classes_old;

CREATE TABLE resource_classes (
    resource_id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    file_type_id TEXT,
    date DATE,
    content TEXT,
    description TEXT,
    
    -- New Fields
    engines TEXT, -- JSON array? or comma separated?
    paper_size TEXT,
    font_size INTEGER,
    geometry TEXT,
    options TEXT,
    languages TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY(file_type_id) REFERENCES file_types(id) ON UPDATE CASCADE ON DELETE SET NULL
);

INSERT INTO resource_classes (
    resource_id, name, file_type_id, date, content, description, created_at, updated_at
)
SELECT 
    resource_id, name, file_type_id, date, content, description, created_at, updated_at
FROM resource_classes_old;

DROP TABLE resource_classes_old;

-- Indices
CREATE INDEX idx_resource_classes_name ON resource_classes(name);
CREATE INDEX idx_resource_classes_type ON resource_classes(file_type_id);

-- ============================================================================
-- New Junction Tables
-- ============================================================================

-- Class Required Packages (Required Packages)
CREATE TABLE IF NOT EXISTS resource_class_packages (
    resource_id TEXT NOT NULL,
    package_id TEXT NOT NULL,
    PRIMARY KEY(resource_id, package_id),
    FOREIGN KEY(resource_id) REFERENCES resource_classes(resource_id) ON DELETE CASCADE,
    -- We assume package_id here refers to texlive_packages or local packages?
    -- resource_commands also has packages.
    -- Wait, resource_package_dependencies used "package_id" referring to texlive.
    -- Usually "Required Packages" means any package required.
    -- For now, let's just make it TEXT or assume FK to resource_packages if we want strong link?
    -- But resource_packages table stores *our* custom wrapper.
    -- Let's stick to TEXT if simply listing names, or FK if linking to our DB.
    -- Most tables use package_id as text (implied FK to something, but not strictly enforced in all tables).
    -- Migration 008 resource_package_dependencies references texlive_packages(id).
    -- resource_command_packages uses package_id.
    -- Let's just create the table without strict FK to texlive_packages if we want flexibility, OR assume typical usage.
    -- Let's stick to the pattern used in commands/tables.
    -- resource_command_packages: (resource_id, package_id) - no FK to texlive explicitly defined in 007? Checked 007?
    -- 007 does NOT define FK to texlive.
    -- So I will do the same: just columns.
    FOREIGN KEY(resource_id) REFERENCES resource_classes(resource_id) ON DELETE CASCADE
);

-- Class Provided Commands
CREATE TABLE IF NOT EXISTS resource_class_provided_commands (
    resource_id TEXT NOT NULL,
    command_name TEXT NOT NULL,
    PRIMARY KEY(resource_id, command_name),
    FOREIGN KEY(resource_id) REFERENCES resource_classes(resource_id) ON DELETE CASCADE
);

-- Note: resource_class_tags already exists in 010.

-- Trigger
CREATE TRIGGER update_resource_classes_timestamp
AFTER UPDATE ON resource_classes
BEGIN
    UPDATE resource_classes SET updated_at = CURRENT_TIMESTAMP 
    WHERE resource_id = NEW.resource_id;
END;

-- ============================================================================
-- Enrich Resource Packages
-- Add fields for options, built_in, documentation, example
-- Add junction tables for tags and provided commands
-- ============================================================================

-- Recreate resource_packages with new columns
-- Rename old table
ALTER TABLE resource_packages RENAME TO resource_packages_old;

-- Create new table
CREATE TABLE resource_packages (
    resource_id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    topic_id TEXT,
    date DATE,
    content TEXT,
    description TEXT,
    
    -- New Fields
    options TEXT, -- Package options (comma separated or JSON array)
    built_in BOOLEAN DEFAULT 0,
    documentation TEXT, -- Path or URL
    example TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY(topic_id) REFERENCES package_topics(id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- Copy data
INSERT INTO resource_packages (
    resource_id, name, topic_id, date, content, description, created_at, updated_at
)
SELECT 
    resource_id, name, topic_id, date, content, description, created_at, updated_at
FROM resource_packages_old;

-- Drop old table
DROP TABLE resource_packages_old;

-- Recreate indices
CREATE INDEX idx_resource_packages_name ON resource_packages(name);
CREATE INDEX idx_resource_packages_topic ON resource_packages(topic_id);

-- ============================================================================
-- New Junction Tables
-- ============================================================================

-- Package Custom Tags
CREATE TABLE IF NOT EXISTS resource_package_tags (
    resource_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    PRIMARY KEY(resource_id, tag),
    FOREIGN KEY(resource_id) REFERENCES resource_packages(resource_id) ON DELETE CASCADE,
    FOREIGN KEY(tag) REFERENCES custom_tags(tag) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Package Provided Commands (Simple List)
CREATE TABLE IF NOT EXISTS resource_package_provided_commands (
    resource_id TEXT NOT NULL,
    command_name TEXT NOT NULL,
    PRIMARY KEY(resource_id, command_name),
    FOREIGN KEY(resource_id) REFERENCES resource_packages(resource_id) ON DELETE CASCADE
);

-- Trigger for updated_at
CREATE TRIGGER update_resource_packages_timestamp
AFTER UPDATE ON resource_packages
BEGIN
    UPDATE resource_packages SET updated_at = CURRENT_TIMESTAMP 
    WHERE resource_id = NEW.resource_id;
END;

-- ============================================================================
-- Type-Specific Extension Tables: CLASSES
-- LaTeX document classes (.cls)
-- ============================================================================

CREATE TABLE IF NOT EXISTS resource_classes (
    resource_id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,  -- Class name
    file_type_id TEXT,  -- Type/Category FK
    date DATE,
    content TEXT,  -- .cls file content
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY(file_type_id) REFERENCES file_types(id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_resource_classes_name ON resource_classes(name);
CREATE INDEX IF NOT EXISTS idx_resource_classes_type ON resource_classes(file_type_id);

-- ============================================================================
-- JUNCTION TABLES for Classes
-- ============================================================================

CREATE TABLE IF NOT EXISTS resource_class_tags (
    resource_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    PRIMARY KEY(resource_id, tag),
    FOREIGN KEY(resource_id) REFERENCES resource_classes(resource_id) ON DELETE CASCADE,
    FOREIGN KEY(tag) REFERENCES custom_tags(tag) ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================================
-- EDIT HISTORY for Classes
-- ============================================================================
CREATE TABLE IF NOT EXISTS resource_class_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id TEXT NOT NULL,
    date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    modification TEXT,
    content TEXT,
    metadata TEXT,
    FOREIGN KEY(resource_id) REFERENCES resource_classes(resource_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_class_history_resource ON resource_class_history(resource_id);

CREATE TRIGGER IF NOT EXISTS update_resource_classes_timestamp
AFTER UPDATE ON resource_classes
BEGIN
    UPDATE resource_classes SET updated_at = CURRENT_TIMESTAMP 
    WHERE resource_id = NEW.resource_id;
END;

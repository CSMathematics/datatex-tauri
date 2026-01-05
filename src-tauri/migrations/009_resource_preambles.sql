-- ============================================================================
-- Type-Specific Extension Tables: PREAMBLES
-- Reusable document preambles
-- ============================================================================

-- Macro/Command Types for preambles
CREATE TABLE IF NOT EXISTS macro_command_types (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resource_preambles (
    resource_id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,  -- Preamble name/title
    file_type_id TEXT,  -- article, book, beamer, exam, custom
    content TEXT,  -- Preamble LaTeX code
    description TEXT,
    built_in BOOLEAN DEFAULT FALSE,  -- Is it a built-in template
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY(file_type_id) REFERENCES file_types(id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_resource_preambles_name ON resource_preambles(name);
CREATE INDEX IF NOT EXISTS idx_resource_preambles_type ON resource_preambles(file_type_id);
CREATE INDEX IF NOT EXISTS idx_resource_preambles_builtin ON resource_preambles(built_in);

-- ============================================================================
-- JUNCTION TABLES for Preambles
-- ============================================================================

CREATE TABLE IF NOT EXISTS resource_preamble_packages (
    resource_id TEXT NOT NULL,
    package_id TEXT NOT NULL,
    PRIMARY KEY(resource_id, package_id),
    FOREIGN KEY(resource_id) REFERENCES resource_preambles(resource_id) ON DELETE CASCADE,
    FOREIGN KEY(package_id) REFERENCES texlive_packages(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS resource_preamble_command_types (
    resource_id TEXT NOT NULL,
    command_type_id TEXT NOT NULL,
    PRIMARY KEY(resource_id, command_type_id),
    FOREIGN KEY(resource_id) REFERENCES resource_preambles(resource_id) ON DELETE CASCADE,
    FOREIGN KEY(command_type_id) REFERENCES macro_command_types(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================================
-- Default Macro Command Types
-- ============================================================================
INSERT OR IGNORE INTO macro_command_types (id, name, description) VALUES
    ('math', 'Mathematical', 'Math-related commands'),
    ('formatting', 'Formatting', 'Text formatting commands'),
    ('structure', 'Structural', 'Document structure commands'),
    ('custom', 'Custom', 'User-defined custom commands');

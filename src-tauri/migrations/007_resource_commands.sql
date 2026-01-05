-- ============================================================================
-- Type-Specific Extension Tables: COMMANDS
-- Custom LaTeX macros and commands
-- ============================================================================

CREATE TABLE IF NOT EXISTS resource_commands (
    resource_id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,  -- Command name (e.g., "\mycommand")
    file_type_id TEXT,  -- newcommand, renewcommand, def, etc.
    content TEXT,  -- Command definition code
    description TEXT,
    built_in BOOLEAN DEFAULT FALSE,  -- Is it a built-in LaTeX command
    macro_command_type_id TEXT,  -- Category FK
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY(file_type_id) REFERENCES file_types(id) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_resource_commands_name ON resource_commands(name);
CREATE INDEX IF NOT EXISTS idx_resource_commands_type ON resource_commands(file_type_id);
CREATE INDEX IF NOT EXISTS idx_resource_commands_builtin ON resource_commands(built_in);

-- ============================================================================
-- JUNCTION TABLES for Commands
-- ============================================================================

CREATE TABLE IF NOT EXISTS resource_command_packages (
    resource_id TEXT NOT NULL,
    package_id TEXT NOT NULL,
    PRIMARY KEY(resource_id, package_id),
    FOREIGN KEY(resource_id) REFERENCES resource_commands(resource_id) ON DELETE CASCADE,
    FOREIGN KEY(package_id) REFERENCES texlive_packages(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================================
-- EDIT HISTORY for Commands (if needed)
-- ============================================================================
CREATE TABLE IF NOT EXISTS resource_command_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id TEXT NOT NULL,
    date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    modification TEXT,
    content TEXT,
    metadata TEXT,
    FOREIGN KEY(resource_id) REFERENCES resource_commands(resource_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_command_history_resource ON resource_command_history(resource_id);

CREATE TRIGGER IF NOT EXISTS update_resource_commands_timestamp
AFTER UPDATE ON resource_commands
BEGIN
    UPDATE resource_commands SET updated_at = CURRENT_TIMESTAMP 
    WHERE resource_id = NEW.resource_id;
END;

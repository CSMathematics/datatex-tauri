-- Migration 015: File History for Local Version Control
-- Stores snapshots of file content for local history feature

CREATE TABLE IF NOT EXISTS file_history (
    id TEXT PRIMARY KEY,
    file_path TEXT NOT NULL,
    content TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    summary TEXT,
    is_manual_snapshot INTEGER DEFAULT 0
);

-- Index for efficient lookup by file path (most common query)
CREATE INDEX IF NOT EXISTS idx_file_history_path ON file_history(file_path);

-- Index for time-based queries and cleanup operations
CREATE INDEX IF NOT EXISTS idx_file_history_created ON file_history(created_at);

-- Compound index for path + time queries (e.g., "get last 50 snapshots for file X")
CREATE INDEX IF NOT EXISTS idx_file_history_path_created ON file_history(file_path, created_at DESC);

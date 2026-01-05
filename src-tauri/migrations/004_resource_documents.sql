-- ============================================================================
-- Type-Specific Extension Tables: DOCUMENTS
-- Πλήρη έγγραφα LaTeX
-- ============================================================================

CREATE TABLE IF NOT EXISTS resource_documents (
    resource_id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    document_type_id TEXT,  -- FK to file_types
    basic_folder TEXT NOT NULL,
    sub_folder TEXT NOT NULL,
    subsub_folder TEXT,
    date DATE,
    content TEXT,  -- Document LaTeX content
    preamble_id TEXT,  -- FK to resources.id
    build_command TEXT,
    needs_update BOOLEAN DEFAULT FALSE,
    bibliography TEXT,
    description TEXT,
    solution_document_id TEXT,  -- FK to resources.id
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY(document_type_id) REFERENCES file_types(id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY(basic_folder) REFERENCES basic_folders(name) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY(sub_folder) REFERENCES sub_folders(name) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY(subsub_folder) REFERENCES subsub_folders(name) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY(preamble_id) REFERENCES resources(id) ON DELETE SET NULL,
    FOREIGN KEY(solution_document_id) REFERENCES resources(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_resource_documents_type ON resource_documents(document_type_id);
CREATE INDEX IF NOT EXISTS idx_resource_documents_folder ON resource_documents(basic_folder, sub_folder);
CREATE INDEX IF NOT EXISTS idx_resource_documents_needs_update ON resource_documents(needs_update);

-- ============================================================================
-- JUNCTION TABLES for Documents
-- ============================================================================

-- Files included in Document (with source tracking)
CREATE TABLE IF NOT EXISTS resource_document_files (
    document_id TEXT NOT NULL,
    file_id TEXT NOT NULL,
    order_index INTEGER NOT NULL,  -- Order in which files appear
    files_database_source TEXT,  -- Which database the file comes from
    database_type INTEGER,  -- Type identifier
    PRIMARY KEY(document_id, file_id),
    FOREIGN KEY(document_id) REFERENCES resource_documents(resource_id) ON DELETE CASCADE,
    FOREIGN KEY(file_id) REFERENCES resources(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_document_files_order ON resource_document_files(document_id, order_index);

-- Custom Tags per Document
CREATE TABLE IF NOT EXISTS resource_document_tags (
    resource_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    PRIMARY KEY(resource_id, tag),
    FOREIGN KEY(resource_id) REFERENCES resource_documents(resource_id) ON DELETE CASCADE,
    FOREIGN KEY(tag) REFERENCES custom_tags(tag) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Bibliography Entries per Document
CREATE TABLE IF NOT EXISTS resource_document_bib_entries (
    resource_id TEXT NOT NULL,
    bib_id TEXT NOT NULL,
    PRIMARY KEY(resource_id, bib_id),
    FOREIGN KEY(resource_id) REFERENCES resource_documents(resource_id) ON DELETE CASCADE,
    FOREIGN KEY(bib_id) REFERENCES bibliography(citation_key) ON UPDATE CASCADE ON DELETE CASCADE
);

-- ============================================================================
-- EDIT HISTORY for Documents
-- ============================================================================
CREATE TABLE IF NOT EXISTS resource_document_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id TEXT NOT NULL,
    date_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    modification TEXT,
    content TEXT,  -- Content snapshot
    metadata TEXT,  -- Metadata snapshot (JSON)
    files_included TEXT,  -- Snapshot of included files
    FOREIGN KEY(resource_id) REFERENCES resource_documents(resource_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_document_history_resource ON resource_document_history(resource_id);
CREATE INDEX IF NOT EXISTS idx_document_history_date ON resource_document_history(date_time);

-- ============================================================================
-- TRIGGERS for Documents
-- ============================================================================

CREATE TRIGGER IF NOT EXISTS update_resource_documents_timestamp
AFTER UPDATE ON resource_documents
BEGIN
    UPDATE resource_documents SET updated_at = CURRENT_TIMESTAMP 
    WHERE resource_id = NEW.resource_id;
END;

CREATE TRIGGER IF NOT EXISTS create_document_history_on_update
AFTER UPDATE ON resource_documents
WHEN OLD.content != NEW.content OR OLD.description != NEW.description
BEGIN
    INSERT INTO resource_document_history (resource_id, modification, content, metadata)
    VALUES (
        NEW.resource_id,
        'Content updated',
        OLD.content,
        json_object(
            'title', OLD.title,
            'document_type', OLD.document_type_id,
            'description', OLD.description
        )
    );
END;

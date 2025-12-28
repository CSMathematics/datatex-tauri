-- ============================================================================
-- DataTex v2 Unified Schema
-- ============================================================================

-- 1. RESOURCES
CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY NOT NULL,
    path TEXT NOT NULL,
    type TEXT NOT NULL,
    collection TEXT NOT NULL,
    title TEXT,
    content_hash TEXT,
    metadata JSON DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(path)
);

CREATE INDEX IF NOT EXISTS idx_resources_collection ON resources(collection);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);

-- 2. DOCUMENTS
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    metadata JSON DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. DOCUMENT ITEMS
CREATE TABLE IF NOT EXISTS document_items (
    document_id TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    PRIMARY KEY (document_id, resource_id),
    FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY(resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- 4. BIBLIOGRAPHY
CREATE TABLE IF NOT EXISTS bibliography (
    citation_key TEXT PRIMARY KEY NOT NULL,
    entry_type TEXT NOT NULL,
    data JSON NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. DEPENDENCIES
CREATE TABLE IF NOT EXISTS dependencies (
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    relation_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (source_id, target_id, relation_type)
);

-- Trigger


-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Add sample resources
INSERT OR REPLACE INTO resources (id, path, type, collection, title, metadata) VALUES
('res-001', 'calculus/deriv_01.tex', 'exercise', 'Calculus', 'Derivative Basics', '{"difficulty": "easy", "tags": ["derivatives", "polynomials"]}'),
('res-002', 'calculus/int_01.tex', 'exercise', 'Calculus', 'Integral Basics', '{"difficulty": "medium", "tags": ["integrals", "definite"]}'),
('res-003', 'algebra/matrix_01.tex', 'exercise', 'Linear Algebra', 'Matrix Multiplication', '{"difficulty": "hard", "tags": ["matrices", "multiplication"]}'),
('res-004', 'geometry/circle_01.tex', 'exercise', 'Geometry', 'Circle Area', '{"difficulty": "easy", "tags": ["circle", "area"]}'),
('res-005', 'logo.png', 'figure', 'General', 'DataTeX Logo', '{"caption": "The official logo", "scale": 0.5}');

-- Add sample documents
INSERT OR REPLACE INTO documents (id, title, category, metadata) VALUES
('doc-001', 'Midterm Exam 2024', 'Exams', '{"author": "John Doe", "date": "2024-05-20"}'),
('doc-002', 'Lecture Notes: Calculus', 'Notes', '{"author": "Jane Smith", "term": "Spring 2024"}');

-- Add sample bibliography
INSERT OR REPLACE INTO bibliography (citation_key, entry_type, data) VALUES
('spivak1994', 'book', '{"author": "Michael Spivak", "title": "Calculus", "year": "1994", "publisher": "Publish or Perish"}'),
('knuth1984', 'article', '{"author": "Donald Knuth", "title": "Literate Programming", "year": "1984", "journal": "The Computer Journal"}');

INSERT OR REPLACE INTO document_items (document_id, resource_id, order_index) VALUES
('doc-001', 'res-001', 1),
('doc-001', 'res-002', 2),
('doc-002', 'res-001', 1);

-- ============================================================================
-- TRIGGERS (Moved to end to avoid parser splitting issues)
-- ============================================================================

CREATE TRIGGER IF NOT EXISTS update_timestamp_resources 
AFTER UPDATE ON resources 
BEGIN
    UPDATE resources SET updated_at = CURRENT_TIMESTAMP WHERE id = new.id;
END;

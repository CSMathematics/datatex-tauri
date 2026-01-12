-- ============================================================================
-- Preamble Types
-- Classification for Preambles (e.g. Book, Article, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS preamble_types (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO preamble_types (id, name, description) VALUES
    ('article', 'Article', 'Standard article class'),
    ('book', 'Book', 'Standard book class'),
    ('report', 'Report', 'Standard report class'),
    ('beamer', 'Beamer', 'Presentation beamer class'),
    ('standalone', 'Standalone', 'Standalone compilable file'),
    ('exam', 'Exam', 'Exam class'),
    ('thesis', 'Thesis', 'Thesis class'),
    ('custom', 'Custom', 'Custom preamble');

-- Recreate resource_preambles to swap file_type_id with preamble_type_id
ALTER TABLE resource_preambles RENAME TO resource_preambles_old_025;

CREATE TABLE resource_preambles (
    resource_id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    preamble_type_id TEXT, -- NEW: specific type
    content TEXT,
    description TEXT,
    built_in BOOLEAN DEFAULT FALSE,
    
    -- Enriched Fields (from 024)
    engines TEXT,
    date DATE,
    class TEXT,
    paper_size TEXT,
    font_size INTEGER,
    options TEXT,
    languages TEXT,
    geometry TEXT,
    author TEXT,
    title TEXT,
    
    -- Boolean Flags
    use_bibliography BOOLEAN DEFAULT FALSE,
    bib_compile_engine TEXT,
    make_index BOOLEAN DEFAULT FALSE,
    make_glossaries BOOLEAN DEFAULT FALSE,
    has_toc BOOLEAN DEFAULT FALSE,
    has_lot BOOLEAN DEFAULT FALSE,
    has_lof BOOLEAN DEFAULT FALSE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY(preamble_type_id) REFERENCES preamble_types(id) ON UPDATE CASCADE ON DELETE SET NULL
);

-- Migrate data (attempt to map file_type_id to preamble_type_id if possible, or just copy common fields)
INSERT INTO resource_preambles (
    resource_id, name, preamble_type_id, content, description, built_in,
    engines, date, class, paper_size, font_size, options, languages, geometry, author, title,
    use_bibliography, bib_compile_engine, make_index, make_glossaries, has_toc, has_lot, has_lof,
    created_at, updated_at
)
SELECT 
    resource_id, name, NULL, content, description, built_in,
    engines, date, class, paper_size, font_size, options, languages, geometry, author, title,
    use_bibliography, bib_compile_engine, make_index, make_glossaries, has_toc, has_lot, has_lof,
    created_at, updated_at
FROM resource_preambles_old_025;

DROP TABLE resource_preambles_old_025;

-- Indices
CREATE INDEX idx_resource_preambles_name_025 ON resource_preambles(name);
CREATE INDEX idx_resource_preambles_type_025 ON resource_preambles(preamble_type_id);

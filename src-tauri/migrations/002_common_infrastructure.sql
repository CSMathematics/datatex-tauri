-- ============================================================================
-- Common Infrastructure Tables
-- These tables provide shared taxonomy and lookup data for all resource types
-- ============================================================================

-- ============================================================================
-- FIELDS (Mathematical/Subject Areas)
-- ============================================================================
CREATE TABLE IF NOT EXISTS fields (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fields_name ON fields(name);

-- ============================================================================
-- CHAPTERS (Organized by Field)
-- ============================================================================
CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    field_id TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, field_id),
    FOREIGN KEY(field_id) REFERENCES fields(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chapters_field ON chapters(field_id);
CREATE INDEX IF NOT EXISTS idx_chapters_name ON chapters(name);

-- ============================================================================
-- SECTIONS (Organized by Chapter)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sections (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    chapter_id TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, chapter_id),
    FOREIGN KEY(chapter_id) REFERENCES chapters(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sections_chapter ON sections(chapter_id);
CREATE INDEX IF NOT EXISTS idx_sections_name ON sections(name);

-- ============================================================================
-- SUBSECTIONS (Organized by Section)
-- ============================================================================
CREATE TABLE IF NOT EXISTS subsections (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    section_id TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, section_id),
    FOREIGN KEY(section_id) REFERENCES sections(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_subsections_section ON subsections(section_id);
CREATE INDEX IF NOT EXISTS idx_subsections_name ON subsections(name);

-- ============================================================================
-- EXERCISE TYPES
-- ============================================================================
CREATE TABLE IF NOT EXISTS exercise_types (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exercise_types_name ON exercise_types(name);

-- Link exercise types to sections (many-to-many)
CREATE TABLE IF NOT EXISTS sections_exercise_types (
    section_id TEXT NOT NULL,
    exercise_type_id TEXT NOT NULL,
    PRIMARY KEY(section_id, exercise_type_id),
    FOREIGN KEY(section_id) REFERENCES sections(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY(exercise_type_id) REFERENCES exercise_types(id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Trigger to clean up orphaned exercise types
CREATE TRIGGER IF NOT EXISTS cleanup_exercise_types
AFTER DELETE ON sections_exercise_types
BEGIN
    DELETE FROM exercise_types
    WHERE id NOT IN (SELECT DISTINCT exercise_type_id FROM sections_exercise_types)
    AND id != '-'; -- Preserve null/default marker
END;

-- ============================================================================
-- FILE TYPES (For File Resources - Theorem, Definition, Exercise, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS file_types (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    folder_name TEXT,
    solvable BOOLEAN DEFAULT FALSE,
    belongs_to TEXT, -- Parent category
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_file_types_name ON file_types(name);

-- ============================================================================
-- DOCUMENT TYPES (For Document Resources - Exam, Notes, Article, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_types (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_document_types_name ON document_types(name);

-- ============================================================================
-- CUSTOM TAGS (User-defined tags)
-- ============================================================================
CREATE TABLE IF NOT EXISTS custom_tags (
    tag TEXT PRIMARY KEY NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TEXLIVE PACKAGES (LaTeX Package Reference)
-- ============================================================================
CREATE TABLE IF NOT EXISTS texlive_packages (
    id TEXT PRIMARY KEY NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_texlive_packages_id ON texlive_packages(id);

-- ============================================================================
-- HIERARCHICAL FOLDERS (Legacy - for Documents)
-- ============================================================================

-- Basic (top-level) folders
CREATE TABLE IF NOT EXISTS basic_folders (
    name TEXT PRIMARY KEY NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sub folders
CREATE TABLE IF NOT EXISTS sub_folders (
    name TEXT PRIMARY KEY NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Subsub folders
CREATE TABLE IF NOT EXISTS subsub_folders (
    name TEXT PRIMARY KEY NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- SubFolders per Basic (many-to-many)
CREATE TABLE IF NOT EXISTS sub_folders_per_basic (
    sub_id TEXT NOT NULL,
    basic_id TEXT NOT NULL,
    PRIMARY KEY(sub_id, basic_id),
    FOREIGN KEY(sub_id) REFERENCES sub_folders(name) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY(basic_id) REFERENCES basic_folders(name) ON UPDATE CASCADE ON DELETE CASCADE
);

-- SubsubFolders per Sub per Basic (many-to-many-to-many)
CREATE TABLE IF NOT EXISTS subsub_folders_per_sub_per_basic (
    subsub_id TEXT NOT NULL,
    sub_id TEXT NOT NULL,
    basic_id TEXT NOT NULL,
    PRIMARY KEY(subsub_id, sub_id, basic_id),
    FOREIGN KEY(subsub_id) REFERENCES subsub_folders(name) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY(sub_id) REFERENCES sub_folders(name) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY(basic_id) REFERENCES basic_folders(name) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Cascade cleanup triggers for folder hierarchy
CREATE TRIGGER IF NOT EXISTS cleanup_sub_folders_on_basic_delete
AFTER DELETE ON basic_folders
BEGIN
    DELETE FROM sub_folders 
    WHERE name NOT IN (SELECT DISTINCT sub_id FROM sub_folders_per_basic);
END;

CREATE TRIGGER IF NOT EXISTS cleanup_subsub_folders_on_sub_delete
AFTER DELETE ON sub_folders
BEGIN
    DELETE FROM subsub_folders 
    WHERE name NOT IN (SELECT DISTINCT subsub_id FROM subsub_folders_per_sub_per_basic);
END;

CREATE TRIGGER IF NOT EXISTS cleanup_subsub_folders_on_basic_delete
AFTER DELETE ON basic_folders
BEGIN
    DELETE FROM subsub_folders 
    WHERE name NOT IN (SELECT DISTINCT subsub_id FROM subsub_folders_per_sub_per_basic);
END;

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Default Fields
INSERT OR IGNORE INTO fields (id, name, description) VALUES 
    ('algebra', 'Algebra', 'Algebraic structures and equations'),
    ('calculus', 'Calculus', 'Differential and Integral Calculus'),
    ('geometry', 'Geometry', 'Geometric theorems and proofs'),
    ('linear-algebra', 'Linear Algebra', 'Matrices, vectors, and linear transformations'),
    ('statistics', 'Statistics', 'Probability and statistical analysis'),
    ('other', 'Other', 'Miscellaneous topics');

-- Default File Types
INSERT OR IGNORE INTO file_types (id, name, folder_name, solvable, description) VALUES 
    ('exercise', 'Exercise', 'Exercises', 1, 'Mathematical exercises and problems'),
    ('theorem', 'Theorem', 'Theorems', 1, 'Mathematical theorems and proofs'),
    ('definition', 'Definition', 'Definitions', 0, 'Mathematical definitions'),
    ('note', 'Note', 'Notes', 0, 'Educational notes and remarks'),
    ('example', 'Example', 'Examples', 0, 'Worked examples'),
    ('other', 'Other', 'Miscellaneous', 0, 'Other file types');

-- Default Document Types
INSERT OR IGNORE INTO document_types (id, name, description) VALUES 
    ('exam', 'Διαγώνισμα', 'Examination paper'),
    ('exam-solution', 'Λύσεις Διαγωνίσματος', 'Exam solutions'),
    ('notes', 'Σημειώσεις', 'Lecture notes or study notes'),
    ('exercises', 'Συλλογή Ασκήσεων', 'Collection of exercises'),
    ('homework', 'Εργασία', 'Homework assignment'),
    ('article', 'Article', 'Academic article'),
    ('book', 'Book', 'Book or textbook'),
    ('book-chapter', 'Book Chapter', 'Chapter of a book'),
    ('report', 'Report', 'Technical or academic report'),
    ('presentation', 'Presentation', 'Slides or presentation'),
    ('worksheet', 'Φύλλο Εργασίας', 'Worksheet'),
    ('other', 'Other', 'Other document type');

-- Default Exercise Types
INSERT OR IGNORE INTO exercise_types (id, name, description) VALUES 
    ('multiple-choice', 'Multiple Choice', 'Multiple choice questions'),
    ('true-false', 'True/False', 'True or false questions'),
    ('short-answer', 'Short Answer', 'Short answer questions'),
    ('proof', 'Proof', 'Mathematical proofs'),
    ('calculation', 'Calculation', 'Numerical calculations'),
    ('other', 'Other', 'Other exercise types');

-- Default folders (legacy)
INSERT OR IGNORE INTO basic_folders (name) VALUES ('General');
INSERT OR IGNORE INTO sub_folders (name) VALUES ('');
INSERT OR IGNORE INTO sub_folders (name) VALUES ('General');
INSERT OR IGNORE INTO sub_folders_per_basic (sub_id, basic_id) VALUES ('', 'General');
INSERT OR IGNORE INTO sub_folders_per_basic (sub_id, basic_id) VALUES ('General', 'General');


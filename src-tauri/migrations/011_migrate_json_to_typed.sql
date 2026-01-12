-- ============================================================================
-- Data Migration: JSON Metadata → Typed Tables
-- Migrate existing resources from JSON metadata to strongly-typed extension tables
-- ============================================================================

-- ============================================================================
-- 1. MIGRATE FILES
-- ============================================================================

-- Create resource_files entries from existing file resources
INSERT OR IGNORE INTO resource_files (
    resource_id,
    file_type_id,
    field_id,
    difficulty,
    date,
    solved_prooved,
    solution_id,
    bibliography,
    file_content,
    preamble_id,
    build_command,
    file_description
)
SELECT 
    r.id,
    json_extract(r.metadata, '$.fileType'),
    json_extract(r.metadata, '$.field'),
    CAST(json_extract(r.metadata, '$.difficulty') AS INTEGER),
    json_extract(r.metadata, '$.date'),
    CASE WHEN json_extract(r.metadata, '$.solved_prooved') = 'true' THEN 1 ELSE 0 END,
    json_extract(r.metadata, '$.solutionId'),
    json_extract(r.metadata, '$.bibliography'),
    json_extract(r.metadata, '$.fileContent'),
    json_extract(r.metadata, '$.preamble'),
    json_extract(r.metadata, '$.buildCommand'),
    json_extract(r.metadata, '$.description')
FROM resources r
WHERE r.type = 'file'
AND r.id NOT IN (SELECT resource_id FROM resource_files);

-- Migrate chapters array
INSERT OR IGNORE INTO resource_file_chapters (resource_id, chapter_id)
SELECT r.id, chapter.value
FROM resources r, json_each(json_extract(r.metadata, '$.chapters')) AS chapter
WHERE r.type = 'file' 
AND json_extract(r.metadata, '$.chapters') IS NOT NULL
AND chapter.value IN (SELECT id FROM chapters);

-- Migrate sections array
INSERT OR IGNORE INTO resource_file_sections (resource_id, section_id)
SELECT r.id, section.value
FROM resources r, json_each(json_extract(r.metadata, '$.sections')) AS section
WHERE r.type = 'file' 
AND json_extract(r.metadata, '$.sections') IS NOT NULL
AND section.value IN (SELECT id FROM sections);

-- Migrate required packages array
INSERT OR IGNORE INTO resource_file_packages (resource_id, package_id)
SELECT r.id, pkg.value
FROM resources r, json_each(json_extract(r.metadata, '$.requiredPackages')) AS pkg
WHERE r.type = 'file' 
AND json_extract(r.metadata, '$.requiredPackages') IS NOT NULL
AND pkg.value IN (SELECT id FROM texlive_packages);

-- ============================================================================
-- 2. MIGRATE DOCUMENTS
-- ============================================================================

INSERT OR IGNORE INTO resource_documents (
    resource_id,
    title,
    document_type_id,
    basic_folder,
    sub_folder,
    subsub_folder,
    date,
    content,
    preamble_id,
    build_command,
    bibliography,
    description,
    solution_document_id
)
SELECT 
    r.id,
    r.title,
    json_extract(r.metadata, '$.documentType'),
    COALESCE(json_extract(r.metadata, '$.basicFolder'), 'General'),
    COALESCE(json_extract(r.metadata, '$.subFolder'), 'General'),
    json_extract(r.metadata, '$.subsubFolder'),
    json_extract(r.metadata, '$.date'),
    json_extract(r.metadata, '$.content'),
    json_extract(r.metadata, '$.preambleId'),
    json_extract(r.metadata, '$.buildCommand'),
    json_extract(r.metadata, '$.bibliography'),
    json_extract(r.metadata, '$.description'),
    json_extract(r.metadata, '$.solutionDocument')
FROM resources r
WHERE r.type = 'document'
AND r.id NOT IN (SELECT resource_id FROM resource_documents);

-- ============================================================================
-- 3. MIGRATE TABLES
-- ============================================================================

INSERT OR IGNORE INTO resource_tables (
    resource_id,
    table_type_id,
    date,
    content,
    caption
)
SELECT 
    r.id,
    json_extract(r.metadata, '$.tableType'),
    json_extract(r.metadata, '$.date'),
    json_extract(r.metadata, '$.content'),
    json_extract(r.metadata, '$.caption')
FROM resources r
WHERE r.type = 'table'
AND r.id NOT IN (SELECT resource_id FROM resource_tables);

-- ============================================================================
-- 4. MIGRATE FIGURES
-- ============================================================================

INSERT OR IGNORE INTO resource_figures (
    resource_id,
    figure_type_id,
    environment,
    date,
    content,
    caption,
    preamble_id,
    build_command,
    description
)
SELECT 
    r.id,
    json_extract(r.metadata, '$.figureType'),
    json_extract(r.metadata, '$.environment'),
    json_extract(r.metadata, '$.date'),
    json_extract(r.metadata, '$.content'),
    json_extract(r.metadata, '$.caption'),
    json_extract(r.metadata, '$.preamble'),
    json_extract(r.metadata, '$.buildCommand'),
    json_extract(r.metadata, '$.description')
FROM resources r
WHERE r.type = 'figure'
AND r.id NOT IN (SELECT resource_id FROM resource_figures);

-- ============================================================================
-- 5. MIGRATE COMMANDS
-- ============================================================================

INSERT OR IGNORE INTO resource_commands (
    resource_id,
    name,
    file_type_id,
    content,
    description,
    built_in
)
SELECT 
    r.id,
    json_extract(r.metadata, '$.commandName'),
    json_extract(r.metadata, '$.fileType'),
    json_extract(r.metadata, '$.content'),
    json_extract(r.metadata, '$.description'),
    CASE WHEN json_extract(r.metadata, '$.builtIn') = 'true' THEN 1 ELSE 0 END
FROM resources r
WHERE r.type = 'command'
AND r.id NOT IN (SELECT resource_id FROM resource_commands);

-- ============================================================================
-- 6. MIGRATE PACKAGES
-- ============================================================================

INSERT OR IGNORE INTO resource_packages (
    resource_id,
    name,
    topic_id,
    date,
    content,
    description
)
SELECT 
    r.id,
    json_extract(r.metadata, '$.packageName'),
    json_extract(r.metadata, '$.topic'),
    json_extract(r.metadata, '$.date'),
    json_extract(r.metadata, '$.content'),
    json_extract(r.metadata, '$.description')
FROM resources r
WHERE r.type = 'package'
AND r.id NOT IN (SELECT resource_id FROM resource_packages);

-- ============================================================================
-- 7. MIGRATE PREAMBLES
-- ============================================================================

INSERT OR IGNORE INTO resource_preambles (
    resource_id,
    name,
    file_type_id,
    content,
    description,
    built_in
)
SELECT 
    r.id,
    r.title,
    json_extract(r.metadata, '$.preambleType'),
    json_extract(r.metadata, '$.content'),
    json_extract(r.metadata, '$.description'),
    CASE WHEN json_extract(r.metadata, '$.isTemplate') = 'true' THEN 1 ELSE 0 END
FROM resources r
WHERE r.type = 'preamble'
AND r.id NOT IN (SELECT resource_id FROM resource_preambles);

-- ============================================================================
-- 8. MIGRATE CLASSES
-- ============================================================================

INSERT OR IGNORE INTO resource_classes (
    resource_id,
    name,
    file_type_id,
    date,
    content,
    description
)
SELECT 
    r.id,
    json_extract(r.metadata, '$.className'),
    json_extract(r.metadata, '$.fileType'),
    json_extract(r.metadata, '$.date'),
    json_extract(r.metadata, '$.content'),
    json_extract(r.metadata, '$.description')
FROM resources r
WHERE r.type = 'class'
AND r.id NOT IN (SELECT resource_id FROM resource_classes);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check migration results
SELECT 'Files migrated' as table_name, COUNT(*) as count FROM resource_files
UNION ALL
SELECT 'Documents migrated', COUNT(*) FROM resource_documents
UNION ALL
SELECT 'Tables migrated', COUNT(*) FROM resource_tables
UNION ALL
SELECT 'Figures migrated', COUNT(*) FROM resource_figures
UNION ALL
SELECT 'Commands migrated', COUNT(*) FROM resource_commands
UNION ALL
SELECT 'Packages migrated', COUNT(*) FROM resource_packages
UNION ALL
SELECT 'Preambles migrated', COUNT(*) FROM resource_preambles
UNION ALL
SELECT 'Classes migrated', COUNT(*) FROM resource_classes;

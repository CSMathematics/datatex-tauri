-- ============================================================================
-- Migration 018: Enrich Resource Tables
-- Adds descriptive and LaTeX-specific fields to resource_tables
-- ============================================================================

-- Add new columns to resource_tables
-- Add new columns to resource_tables
-- ALTER TABLE resource_tables ADD COLUMN description TEXT;
-- ALTER TABLE resource_tables ADD COLUMN environment TEXT DEFAULT 'tabular'; -- tabular, tabularx, longtable, tabularray, etc.
-- ALTER TABLE resource_tables ADD COLUMN placement TEXT; -- htbp
-- ALTER TABLE resource_tables ADD COLUMN label TEXT; -- tab:xyz
-- ALTER TABLE resource_tables ADD COLUMN width TEXT; -- 1.0\textwidth
-- ALTER TABLE resource_tables ADD COLUMN alignment TEXT; -- |l|c|r|

-- Dimensions
-- ALTER TABLE resource_tables ADD COLUMN rows INTEGER;
-- ALTER TABLE resource_tables ADD COLUMN columns INTEGER;

-- Create index for faster searching on environment
CREATE INDEX IF NOT EXISTS idx_resource_tables_env ON resource_tables(environment);

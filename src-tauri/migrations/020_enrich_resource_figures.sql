-- ============================================================================
-- Migration 020: Enrich Figure Metadata
-- Creates figure_types and updates resource_figures schema
-- ============================================================================

CREATE TABLE IF NOT EXISTS figure_types (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

-- Insert Default Figure Types
INSERT OR IGNORE INTO figure_types (id, name, description) VALUES ('2d_plot', '2D Plot', 'Two-dimensional plots');
INSERT OR IGNORE INTO figure_types (id, name, description) VALUES ('3d_plot', '3D Plot', 'Three-dimensional plots');
INSERT OR IGNORE INTO figure_types (id, name, description) VALUES ('geometric', 'Geometric Shape', 'Geometry shapes and constructions');
INSERT OR IGNORE INTO figure_types (id, name, description) VALUES ('statistical', 'Statistical Chart', 'Bar charts, pie charts, etc.');
INSERT OR IGNORE INTO figure_types (id, name, description) VALUES ('diagram', 'Diagram', 'Flowcharts, diagrams, etc.');
INSERT OR IGNORE INTO figure_types (id, name, description) VALUES ('image', 'Image', 'Raster or vector images');

-- Recreate resource_figures to update Schema
-- 1. Rename old table
ALTER TABLE resource_figures RENAME TO resource_figures_old;

-- 2. Create new table
CREATE TABLE resource_figures (
    resource_id TEXT PRIMARY KEY NOT NULL,
    figure_type_id TEXT,  -- FK to figure_types (NEW)
    date DATE,
    content TEXT,
    caption TEXT,
    description TEXT,
    
    -- Technical / Layout
    environment TEXT, -- tikzpicture, axis, includegraphics, etc.
    options TEXT,     -- [scale=0.5] (NEW)
    tikz_style TEXT,  -- (NEW)
    width TEXT,       -- (NEW)
    height TEXT,      -- (NEW)
    label TEXT,       -- (NEW)
    placement TEXT,   -- (NEW)
    alignment TEXT,   -- (NEW)
    
    -- Build info
    preamble_id TEXT,
    build_command TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY(resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY(figure_type_id) REFERENCES figure_types(id) ON UPDATE CASCADE ON DELETE SET NULL,
    FOREIGN KEY(preamble_id) REFERENCES resources(id) ON DELETE SET NULL
);

-- 3. Copy data
-- Note: 'plot_type_id' from old table is mapped to 'figure_type_id'
-- (Assuming we just copy the value, even if it was a file_type_id. User can fix later.)
INSERT INTO resource_figures (
    resource_id, figure_type_id, date, content, caption, description,
    environment, preamble_id, build_command,
    created_at, updated_at
)
SELECT 
    resource_id, figure_type_id, date, content, caption, description,
    environment, preamble_id, build_command,
    created_at, updated_at
FROM resource_figures_old;

-- 4. Recreate Indices
CREATE INDEX IF NOT EXISTS idx_resource_figures_type ON resource_figures(figure_type_id);
CREATE INDEX IF NOT EXISTS idx_resource_figures_env ON resource_figures(environment);

-- 5. Drop old table
DROP TABLE resource_figures_old;

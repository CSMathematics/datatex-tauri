// Helper implementations for remaining resource types
use crate::types::metadata::*;
use rusqlite::{params, Connection, Result};

// ============================================================================
// TABLE Metadata Operations
// ============================================================================

pub fn save_table_metadata(
    conn: &Connection,
    resource_id: &str,
    metadata: &TableMetadata,
) -> Result<()> {
    conn.execute(
        "INSERT OR REPLACE INTO resource_tables (
            resource_id, table_type_id, date, content, caption
        ) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![
            resource_id,
            metadata.table_type_id,
            metadata.date,
            metadata.content,
            metadata.caption,
        ],
    )?;

    // Save required packages
    if let Some(packages) = &metadata.required_packages {
        conn.execute(
            "DELETE FROM resource_table_packages WHERE resource_id = ?1",
            params![resource_id],
        )?;
        for package_id in packages {
            conn.execute(
                "INSERT OR IGNORE INTO resource_table_packages (resource_id, package_id) VALUES (?1, ?2)",
                params![resource_id, package_id],
            )?;
        }
    }

    // Save custom tags
    if let Some(tags) = &metadata.custom_tags {
        conn.execute(
            "DELETE FROM resource_table_tags WHERE resource_id = ?1",
            params![resource_id],
        )?;
        for tag in tags {
            conn.execute(
                "INSERT OR IGNORE INTO custom_tags (tag) VALUES (?1)",
                params![tag],
            )?;
            conn.execute(
                "INSERT OR IGNORE INTO resource_table_tags (resource_id, tag) VALUES (?1, ?2)",
                params![resource_id, tag],
            )?;
        }
    }

    Ok(())
}

// ============================================================================
// FIGURE Metadata Operations
// ============================================================================

pub fn save_figure_metadata(
    conn: &Connection,
    resource_id: &str,
    metadata: &FigureMetadata,
) -> Result<()> {
    conn.execute(
        "INSERT OR REPLACE INTO resource_figures (
            resource_id, plot_type_id, environment, date, content,
            caption, preamble_id, build_command, description
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![
            resource_id,
            metadata.plot_type_id,
            metadata.environment,
            metadata.date,
            metadata.content,
            metadata.caption,
            metadata.preamble_id,
            metadata.build_command,
            metadata.description,
        ],
    )?;

    // Save required packages
    if let Some(packages) = &metadata.required_packages {
        conn.execute(
            "DELETE FROM resource_figure_packages WHERE resource_id = ?1",
            params![resource_id],
        )?;
        for package_id in packages {
            conn.execute(
                "INSERT OR IGNORE INTO resource_figure_packages (resource_id, package_id) VALUES (?1, ?2)",
                params![resource_id, package_id],
            )?;
        }
    }

    // Save custom tags
    if let Some(tags) = &metadata.custom_tags {
        conn.execute(
            "DELETE FROM resource_figure_tags WHERE resource_id = ?1",
            params![resource_id],
        )?;
        for tag in tags {
            conn.execute(
                "INSERT OR IGNORE INTO custom_tags (tag) VALUES (?1)",
                params![tag],
            )?;
            conn.execute(
                "INSERT OR IGNORE INTO resource_figure_tags (resource_id, tag) VALUES (?1, ?2)",
                params![resource_id, tag],
            )?;
        }
    }

    Ok(())
}

// ============================================================================
// COMMAND Metadata Operations
// ============================================================================

pub fn save_command_metadata(
    conn: &Connection,
    resource_id: &str,
    metadata: &CommandMetadata,
) -> Result<()> {
    conn.execute(
        "INSERT OR REPLACE INTO resource_commands (
            resource_id, name, file_type_id, content, description,
            built_in, macro_command_type_id
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            resource_id,
            metadata.name,
            metadata.file_type_id,
            metadata.content,
            metadata.description,
            metadata.built_in,
            metadata.macro_command_type_id,
        ],
    )?;

    // Save required packages
    if let Some(packages) = &metadata.required_packages {
        conn.execute(
            "DELETE FROM resource_command_packages WHERE resource_id = ?1",
            params![resource_id],
        )?;
        for package_id in packages {
            conn.execute(
                "INSERT OR IGNORE INTO resource_command_packages (resource_id, package_id) VALUES (?1, ?2)",
                params![resource_id, package_id],
            )?;
        }
    }

    Ok(())
}

// ============================================================================
// PACKAGE Metadata Operations
// ============================================================================

pub fn save_package_metadata(
    conn: &Connection,
    resource_id: &str,
    metadata: &PackageMetadata,
) -> Result<()> {
    conn.execute(
        "INSERT OR REPLACE INTO resource_packages (
            resource_id, name, topic_id, date, content, description
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            resource_id,
            metadata.name,
            metadata.topic_id,
            metadata.date,
            metadata.content,
            metadata.description,
        ],
    )?;

    // Save dependencies
    if let Some(dependencies) = &metadata.dependencies {
        conn.execute(
            "DELETE FROM resource_package_dependencies WHERE resource_id = ?1",
            params![resource_id],
        )?;
        for package_id in dependencies {
            conn.execute(
                "INSERT OR IGNORE INTO resource_package_dependencies (resource_id, package_id) VALUES (?1, ?2)",
                params![resource_id, package_id],
            )?;
        }
    }

    // Save topics
    if let Some(topics) = &metadata.topics {
        conn.execute(
            "DELETE FROM resource_package_topics WHERE resource_id = ?1",
            params![resource_id],
        )?;
        for topic_id in topics {
            conn.execute(
                "INSERT OR IGNORE INTO resource_package_topics (resource_id, topic_id) VALUES (?1, ?2)",
                params![resource_id, topic_id],
            )?;
        }
    }

    Ok(())
}

// ============================================================================
// PREAMBLE Metadata Operations
// ============================================================================

pub fn save_preamble_metadata(
    conn: &Connection,
    resource_id: &str,
    metadata: &PreambleMetadata,
) -> Result<()> {
    conn.execute(
        "INSERT OR REPLACE INTO resource_preambles (
            resource_id, name, file_type_id, content, description, built_in
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            resource_id,
            metadata.name,
            metadata.file_type_id,
            metadata.content,
            metadata.description,
            metadata.built_in,
        ],
    )?;

    // Save required packages
    if let Some(packages) = &metadata.required_packages {
        conn.execute(
            "DELETE FROM resource_preamble_packages WHERE resource_id = ?1",
            params![resource_id],
        )?;
        for package_id in packages {
            conn.execute(
                "INSERT OR IGNORE INTO resource_preamble_packages (resource_id, package_id) VALUES (?1, ?2)",
                params![resource_id, package_id],
            )?;
        }
    }

    // Save command types
    if let Some(command_types) = &metadata.command_types {
        conn.execute(
            "DELETE FROM resource_preamble_command_types WHERE resource_id = ?1",
            params![resource_id],
        )?;
        for cmd_type_id in command_types {
            conn.execute(
                "INSERT OR IGNORE INTO resource_preamble_command_types (resource_id, command_type_id) VALUES (?1, ?2)",
                params![resource_id, cmd_type_id],
            )?;
        }
    }

    Ok(())
}

// ============================================================================
// CLASS Metadata Operations
// ============================================================================

pub fn save_class_metadata(
    conn: &Connection,
    resource_id: &str,
    metadata: &ClassMetadata,
) -> Result<()> {
    conn.execute(
        "INSERT OR REPLACE INTO resource_classes (
            resource_id, name, file_type_id, date, content, description
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            resource_id,
            metadata.name,
            metadata.file_type_id,
            metadata.date,
            metadata.content,
            metadata.description,
        ],
    )?;

    // Save custom tags
    if let Some(tags) = &metadata.custom_tags {
        conn.execute(
            "DELETE FROM resource_class_tags WHERE resource_id = ?1",
            params![resource_id],
        )?;
        for tag in tags {
            conn.execute(
                "INSERT OR IGNORE INTO custom_tags (tag) VALUES (?1)",
                params![tag],
            )?;
            conn.execute(
                "INSERT OR IGNORE INTO resource_class_tags (resource_id, tag) VALUES (?1, ?2)",
                params![resource_id, tag],
            )?;
        }
    }

    Ok(())
}

// ============================================================================
// Typed Metadata Database Operations
// CRUD operations for strongly-typed metadata
// ============================================================================

use crate::types::metadata::*;
use rusqlite::{params, Connection, OptionalExtension, Result};

// ============================================================================
// CREATE Operations
// ============================================================================

/// Save FileMetadata to database
pub fn save_file_metadata(
    conn: &Connection,
    resource_id: &str,
    metadata: &FileMetadata,
) -> Result<()> {
    // Insert main record
    conn.execute(
        "INSERT OR REPLACE INTO resource_files (
            resource_id, file_type_id, field_id, difficulty, date,
            solved_prooved, solution_id, bibliography, file_content,
            preamble_id, build_command, file_description
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
        params![
            resource_id,
            metadata.file_type_id,
            metadata.field_id,
            metadata.difficulty,
            metadata.date,
            metadata.solved_prooved,
            metadata.solution_id,
            metadata.bibliography,
            metadata.file_content,
            metadata.preamble_id,
            metadata.build_command,
            metadata.file_description,
        ],
    )?;

    // Save chapters
    if let Some(chapters) = &metadata.chapters {
        conn.execute(
            "DELETE FROM resource_file_chapters WHERE resource_id = ?1",
            params![resource_id],
        )?;
        for chapter_id in chapters {
            conn.execute(
                "INSERT OR IGNORE INTO resource_file_chapters (resource_id, chapter_id) VALUES (?1, ?2)",
                params![resource_id, chapter_id],
            )?;
        }
    }

    // Save sections
    if let Some(sections) = &metadata.sections {
        conn.execute(
            "DELETE FROM resource_file_sections WHERE resource_id = ?1",
            params![resource_id],
        )?;
        for section_id in sections {
            conn.execute(
                "INSERT OR IGNORE INTO resource_file_sections (resource_id, section_id) VALUES (?1, ?2)",
                params![resource_id, section_id],
            )?;
        }
    }

    // Save exercise types
    if let Some(exercise_types) = &metadata.exercise_types {
        conn.execute(
            "DELETE FROM resource_file_exercise_types WHERE resource_id = ?1",
            params![resource_id],
        )?;
        for exercise_type_id in exercise_types {
            conn.execute(
                "INSERT OR IGNORE INTO resource_file_exercise_types (resource_id, exercise_type_id) VALUES (?1, ?2)",
                params![resource_id, exercise_type_id],
            )?;
        }
    }

    // Save custom tags
    if let Some(tags) = &metadata.custom_tags {
        conn.execute(
            "DELETE FROM resource_file_tags WHERE resource_id = ?1",
            params![resource_id],
        )?;
        for tag in tags {
            conn.execute(
                "INSERT OR IGNORE INTO custom_tags (tag) VALUES (?1)",
                params![tag],
            )?;
            conn.execute(
                "INSERT OR IGNORE INTO resource_file_tags (resource_id, tag) VALUES (?1, ?2)",
                params![resource_id, tag],
            )?;
        }
    }

    Ok(())
}

/// Save DocumentMetadata to database
pub fn save_document_metadata(
    conn: &Connection,
    resource_id: &str,
    metadata: &DocumentMetadata,
) -> Result<()> {
    conn.execute(
        "INSERT OR REPLACE INTO resource_documents (
            resource_id, title, document_type_id, basic_folder, sub_folder,
            subsub_folder, date, content, preamble_id, build_command,
            needs_update, bibliography, description, solution_document_id
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)",
        params![
            resource_id,
            metadata.title,
            metadata.document_type_id,
            metadata.basic_folder.as_deref().unwrap_or("General"),
            metadata.sub_folder.as_deref().unwrap_or("General"),
            metadata.subsub_folder,
            metadata.date,
            metadata.content,
            metadata.preamble_id,
            metadata.build_command,
            metadata.needs_update,
            metadata.bibliography,
            metadata.description,
            metadata.solution_document_id,
        ],
    )?;

    // Save custom tags
    if let Some(tags) = &metadata.custom_tags {
        conn.execute(
            "DELETE FROM resource_document_tags WHERE resource_id = ?1",
            params![resource_id],
        )?;
        for tag in tags {
            conn.execute(
                "INSERT OR IGNORE INTO custom_tags (tag) VALUES (?1)",
                params![tag],
            )?;
            conn.execute(
                "INSERT OR IGNORE INTO resource_document_tags (resource_id, tag) VALUES (?1, ?2)",
                params![resource_id, tag],
            )?;
        }
    }

    Ok(())
}

// ============================================================================
// READ Operations
// ============================================================================

/// Load FileMetadata from database
pub fn load_file_metadata(conn: &Connection, resource_id: &str) -> Result<Option<FileMetadata>> {
    let mut stmt = conn.prepare(
        "SELECT file_type_id, field_id, difficulty, date, solved_prooved,
                solution_id, bibliography, file_content, preamble_id,
                build_command, file_description
         FROM resource_files WHERE resource_id = ?1",
    )?;

    let metadata = stmt
        .query_row(params![resource_id], |row| {
            Ok(FileMetadata {
                file_type_id: row.get(0)?,
                field_id: row.get(1)?,
                difficulty: row.get(2)?,
                date: row.get(3)?,
                solved_prooved: row.get(4)?,
                solution_id: row.get(5)?,
                bibliography: row.get(6)?,
                file_content: row.get(7)?,
                preamble_id: row.get(8)?,
                build_command: row.get(9)?,
                file_description: row.get(10)?,
                chapters: None,
                sections: None,
                exercise_types: None,
                required_packages: None,
                custom_tags: None,
                bib_entries: None,
            })
        })
        .optional()?;

    if let Some(mut meta) = metadata {
        // Load chapters
        let chapters: Vec<String> = conn
            .prepare("SELECT chapter_id FROM resource_file_chapters WHERE resource_id = ?1")?
            .query_map(params![resource_id], |row| row.get(0))?
            .collect::<Result<Vec<String>>>()?;
        if !chapters.is_empty() {
            meta.chapters = Some(chapters);
        }

        // Load sections
        let sections: Vec<String> = conn
            .prepare("SELECT section_id FROM resource_file_sections WHERE resource_id = ?1")?
            .query_map(params![resource_id], |row| row.get(0))?
            .collect::<Result<Vec<String>>>()?;
        if !sections.is_empty() {
            meta.sections = Some(sections);
        }

        // Load exercise types
        let exercise_types: Vec<String> = conn
            .prepare(
                "SELECT exercise_type_id FROM resource_file_exercise_types WHERE resource_id = ?1",
            )?
            .query_map(params![resource_id], |row| row.get(0))?
            .collect::<Result<Vec<String>>>()?;
        if !exercise_types.is_empty() {
            meta.exercise_types = Some(exercise_types);
        }

        // Load custom tags
        let tags: Vec<String> = conn
            .prepare("SELECT tag FROM resource_file_tags WHERE resource_id = ?1")?
            .query_map(params![resource_id], |row| row.get(0))?
            .collect::<Result<Vec<String>>>()?;
        if !tags.is_empty() {
            meta.custom_tags = Some(tags);
        }

        return Ok(Some(meta));
    }

    Ok(None)
}

/// Load DocumentMetadata from database
pub fn load_document_metadata(
    conn: &Connection,
    resource_id: &str,
) -> Result<Option<DocumentMetadata>> {
    let mut stmt = conn.prepare(
        "SELECT title, document_type_id, basic_folder, sub_folder, subsub_folder,
                date, content, preamble_id, build_command, needs_update,
                bibliography, description, solution_document_id
         FROM resource_documents WHERE resource_id = ?1",
    )?;

    let metadata = stmt
        .query_row(params![resource_id], |row| {
            Ok(DocumentMetadata {
                title: row.get(0)?,
                document_type_id: row.get(1)?,
                basic_folder: row.get(2)?,
                sub_folder: row.get(3)?,
                subsub_folder: row.get(4)?,
                date: row.get(5)?,
                content: row.get(6)?,
                preamble_id: row.get(7)?,
                build_command: row.get(8)?,
                needs_update: row.get(9)?,
                bibliography: row.get(10)?,
                description: row.get(11)?,
                solution_document_id: row.get(12)?,
                included_files: None,
                custom_tags: None,
                bib_entries: None,
            })
        })
        .optional()?;

    if let Some(mut meta) = metadata {
        // Load custom tags
        let tags: Vec<String> = conn
            .prepare("SELECT tag FROM resource_document_tags WHERE resource_id = ?1")?
            .query_map(params![resource_id], |row| row.get(0))?
            .collect::<Result<Vec<String>>>()?;
        if !tags.is_empty() {
            meta.custom_tags = Some(tags);
        }

        return Ok(Some(meta));
    }

    Ok(None)
}

// ============================================================================
// Generic load function by resource type
// ============================================================================

pub fn load_typed_metadata(
    conn: &Connection,
    resource_id: &str,
    resource_type: &str,
) -> Result<Option<TypedMetadata>> {
    match resource_type {
        "file" => {
            if let Some(meta) = load_file_metadata(conn, resource_id)? {
                Ok(Some(TypedMetadata::File(meta)))
            } else {
                Ok(None)
            }
        }
        "document" => {
            if let Some(meta) = load_document_metadata(conn, resource_id)? {
                Ok(Some(TypedMetadata::Document(meta)))
            } else {
                Ok(None)
            }
        }
        _ => Ok(None),
    }
}

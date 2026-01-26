use serde::{Deserialize, Serialize};
use sqlx::Row;
use std::fs;
use std::future::Future;
use std::path::Path;
use std::pin::Pin;
use std::process::Command;
use std::sync::Arc;
use tauri::Emitter;
use tokio::sync::Mutex;

use crate::database::DatabaseManager;
use crate::vectors::VectorStoreState;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ToolDefinition {
    pub name: String,
    pub description: String,
    pub parameters: serde_json::Value,
}

pub trait Tool: Send + Sync {
    fn definition(&self) -> ToolDefinition;
    fn execute(
        &self,
        args: serde_json::Value,
    ) -> Pin<Box<dyn Future<Output = Result<String, String>> + Send + '_>>;
}

// --- Tool Implementations ---

pub struct ListFilesTool;
impl Tool for ListFilesTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition {
            name: "list_files".to_string(),
            description: "List files in a directory. Use this to explore the project structure."
                .to_string(),
            parameters: serde_json::json!({
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Absolute path to directory to list"
                    }
                },
                "required": ["path"]
            }),
        }
    }

    fn execute(
        &self,
        args: serde_json::Value,
    ) -> Pin<Box<dyn Future<Output = Result<String, String>> + Send + '_>> {
        Box::pin(async move {
            let path_str = args["path"].as_str().ok_or("Missing path argument")?;
            let path = Path::new(path_str);

            if !path.exists() {
                return Err(format!("Path does not exist: {}", path_str));
            }

            let entries = fs::read_dir(path).map_err(|e| e.to_string())?;
            let mut files = Vec::new();

            for entry in entries {
                if let Ok(entry) = entry {
                    let file_name = entry.file_name().to_string_lossy().to_string();
                    let file_type = if entry.path().is_dir() { "DIR" } else { "FILE" };
                    files.push(format!("[{}] {}", file_type, file_name));
                }
            }

            // Limit output size
            if files.len() > 100 {
                files.truncate(100);
                files.push("... (truncated)".to_string());
            }

            Ok(files.join("\n"))
        })
    }
}

pub struct ReadFileTool;
impl Tool for ReadFileTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition {
            name: "read_file".to_string(),
            description: "Read the contents of a file.".to_string(),
            parameters: serde_json::json!({
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Absolute path to file to read"
                    }
                },
                "required": ["path"]
            }),
        }
    }

    fn execute(
        &self,
        args: serde_json::Value,
    ) -> Pin<Box<dyn Future<Output = Result<String, String>> + Send + '_>> {
        Box::pin(async move {
            let path_str = args["path"].as_str().ok_or("Missing path argument")?;

            // Basic security check (very simple for now)
            if path_str.contains("..") {
                return Err("Access denied: Traversal paths not allowed".to_string());
            }

            match fs::read_to_string(path_str) {
                Ok(content) => {
                    // Truncate if too huge
                    if content.len() > 10000 {
                        let truncated = &content[0..10000];
                        Ok(format!("{}... [TRUNCATED caused by length]", truncated))
                    } else {
                        Ok(content)
                    }
                }
                Err(e) => Err(format!("Failed to read file: {}", e)),
            }
        })
    }
}

pub struct WriteFileTool;
impl Tool for WriteFileTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition {
            name: "write_file".to_string(),
            description: "Write content to a file. Overwrites existing files. Use carefully."
                .to_string(),
            parameters: serde_json::json!({
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Absolute path to file"
                    },
                    "content": {
                        "type": "string",
                        "description": "Content to write"
                    }
                },
                "required": ["path", "content"]
            }),
        }
    }

    fn execute(
        &self,
        args: serde_json::Value,
    ) -> Pin<Box<dyn Future<Output = Result<String, String>> + Send + '_>> {
        Box::pin(async move {
            let path_str = args["path"].as_str().ok_or("Missing path argument")?;
            let content = args["content"].as_str().ok_or("Missing content argument")?;

            // Basic security checks
            if path_str.contains("..") {
                return Err("Access denied: Traversal paths not allowed".to_string());
            }

            // Ensure parent directory exists
            let path = Path::new(path_str);
            if let Some(parent) = path.parent() {
                if !parent.exists() {
                    fs::create_dir_all(parent)
                        .map_err(|e| format!("Failed to create parent dir: {}", e))?;
                }
            }

            fs::write(path_str, content).map_err(|e| format!("Failed to write file: {}", e))?;
            Ok(format!("Successfully wrote to {}", path_str))
        })
    }
}

pub struct RunTerminalTool;
impl Tool for RunTerminalTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition {
            name: "run_terminal".to_string(),
            description: "Run a shell command. Use cautiously.".to_string(),
            parameters: serde_json::json!({
                "type": "object",
                "properties": {
                    "command": {
                        "type": "string",
                        "description": "Command to execute"
                    },
                    "cwd": {
                        "type": "string",
                        "description": "Working directory"
                    }
                },
                "required": ["command"]
            }),
        }
    }

    fn execute(
        &self,
        args: serde_json::Value,
    ) -> Pin<Box<dyn Future<Output = Result<String, String>> + Send + '_>> {
        Box::pin(async move {
            let cmd_str = args["command"].as_str().ok_or("Missing command argument")?;
            let cwd_str = args["cwd"].as_str().unwrap_or(".");

            let output = if cfg!(target_os = "windows") {
                Command::new("cmd")
                    .args(["/C", cmd_str])
                    .current_dir(cwd_str)
                    .output()
            } else {
                Command::new("sh")
                    .arg("-c")
                    .arg(cmd_str)
                    .current_dir(cwd_str)
                    .output()
            };

            match output {
                Ok(out) => {
                    let stdout = String::from_utf8_lossy(&out.stdout);
                    let stderr = String::from_utf8_lossy(&out.stderr);
                    Ok(format!("STDOUT:\n{}\nSTDERR:\n{}", stdout, stderr))
                }
                Err(e) => Err(format!("Failed to execute command: {}", e)),
            }
        })
    }
}

pub struct DatabaseSearchTool {
    pub db_manager: Arc<Mutex<Option<DatabaseManager>>>,
}

impl Tool for DatabaseSearchTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition {
            name: "search_files".to_string(),
            description: "Search for text patterns (regex or string) inside files in the database."
                .to_string(),
            parameters: serde_json::json!({
                "type": "object",
                "properties": {
                    "query": { "type": "string", "description": "Text to search for" },
                    "regex": { "type": "boolean", "description": "Use regex? Default false" },
                    "extensions": { "type": "array", "items": { "type": "string" }, "description": "File extensions (tex, bib...)" }
                },
                "required": ["query"]
            }),
        }
    }

    fn execute(
        &self,
        args: serde_json::Value,
    ) -> Pin<Box<dyn Future<Output = Result<String, String>> + Send + '_>> {
        let db_manager = self.db_manager.clone();
        Box::pin(async move {
            let query_text = args["query"].as_str().ok_or("Missing query")?.to_string();
            let use_regex = args["regex"].as_bool().unwrap_or(false);
            let extensions = args["extensions"]
                .as_array()
                .map(|arr| {
                    arr.iter()
                        .filter_map(|v| v.as_str().map(|s| s.to_string()))
                        .collect()
                })
                .unwrap_or_default();

            let guard = db_manager.lock().await;
            if let Some(db) = guard.as_ref() {
                let collections = db.get_collections().await.unwrap_or_default();
                let col_names: Vec<String> = collections.into_iter().map(|c| c.name).collect();
                let resources = db
                    .get_resources_by_collections(&col_names)
                    .await
                    .unwrap_or_default();

                let search_query = crate::search::SearchQuery {
                    text: query_text,
                    case_sensitive: false,
                    use_regex: use_regex,
                    file_types: extensions,
                    max_results: 20,
                };

                match crate::search::search_in_files(&search_query, resources) {
                    Ok(res) => {
                        let mut out = String::new();
                        out.push_str(&format!(
                            "Found {} matches in {} files:\n",
                            res.matches.len(),
                            res.total_files_searched
                        ));
                        for m in res.matches {
                            out.push_str(&format!(
                                "{}:{} - {}\n",
                                m.file_name,
                                m.line_number,
                                m.line_content.trim()
                            ));
                        }
                        Ok(out)
                    }
                    Err(e) => Err(e),
                }
            } else {
                Err("Database not initialized".to_string())
            }
        })
    }
}

// Registry to hold tools
pub struct ToolRegistry {
    tools: std::collections::HashMap<String, Box<dyn Tool>>,
}

impl ToolRegistry {
    pub fn new(
        app_handle: tauri::AppHandle,
        db_manager: Arc<Mutex<Option<DatabaseManager>>>,
        vector_store: Arc<VectorStoreState>,
        config: crate::ai::ProviderConfig,
    ) -> Self {
        let mut registry = ToolRegistry {
            tools: std::collections::HashMap::new(),
        };

        registry.register(Box::new(ListFilesTool));
        registry.register(Box::new(ReadFileTool));
        registry.register(Box::new(WriteFileTool));
        registry.register(Box::new(ProposeEditTool {
            app_handle: app_handle.clone(),
        }));
        registry.register(Box::new(RunTerminalTool));
        registry.register(Box::new(FindResourceTool {
            db_manager: db_manager.clone(),
        }));

        registry.register(Box::new(DatabaseSearchTool { db_manager }));

        // For Semantic Search, we need to handle the embedding generation.
        registry.register(Box::new(SemanticSearchTool {
            vector_store,
            config,
        }));

        registry
    }

    pub fn register(&mut self, tool: Box<dyn Tool>) {
        self.tools.insert(tool.definition().name, tool);
    }

    pub fn get(&self, name: &str) -> Option<&Box<dyn Tool>> {
        self.tools.get(name)
    }

    pub fn get_definitions(&self) -> Vec<ToolDefinition> {
        self.tools.values().map(|t| t.definition()).collect()
    }
}

// ... (ProposeEditTool impl was NOT missing, but the Struct was?)
// Actually, looking at previous output, `ProposeEditTool` struct was at lines 371-373.
// My edit targeted 371.
// So I DELETED it.
// I must restore it.

pub struct ProposeEditTool {
    pub app_handle: tauri::AppHandle,
}

pub struct FindResourceTool {
    pub db_manager: Arc<Mutex<Option<DatabaseManager>>>,
}

impl Tool for FindResourceTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition {
            name: "find_resource".to_string(),
            description: "Find files in the database. Can search by name/path and optionally filter by collection.".to_string(),
            parameters: serde_json::json!({
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Filename or partial pattern (e.g. 'Untitled.tex')"
                    },
                    "collection": {
                        "type": "string",
                        "description": "Optional: Filter by collection name (e.g. 'testLatex')"
                    }
                },
                "required": ["name"]
            }),
        }
    }

    fn execute(
        &self,
        args: serde_json::Value,
    ) -> Pin<Box<dyn Future<Output = Result<String, String>> + Send + '_>> {
        let db_manager = self.db_manager.clone();
        Box::pin(async move {
            let raw_name = args["name"].as_str().ok_or("Missing name argument")?;
            // Support glob-like patterns: replace * with %
            let name_pattern = raw_name.replace('*', "%");
            let collection_filter = args["collection"].as_str().map(|s| s.to_string());
            let search_pattern = format!("%{}%", name_pattern);

            let guard = db_manager.lock().await;
            if let Some(db) = guard.as_ref() {
                let rows = if let Some(col) = collection_filter {
                    sqlx::query("SELECT path, collection FROM resources WHERE (path LIKE ? OR title LIKE ?) AND collection = ? LIMIT 10")
                        .bind(&search_pattern)
                        .bind(&search_pattern)
                        .bind(col)
                        .fetch_all(&db.pool)
                        .await
                        .map_err(|e| format!("Database error: {}", e))?
                } else {
                    sqlx::query("SELECT path, collection FROM resources WHERE path LIKE ? OR title LIKE ? LIMIT 10")
                        .bind(&search_pattern)
                        .bind(&search_pattern)
                        .fetch_all(&db.pool)
                        .await
                        .map_err(|e| format!("Database error: {}", e))?
                };

                if rows.is_empty() {
                    return Ok(format!("No files found matching '{}'.", name_pattern));
                }

                let mut out = String::new();
                out.push_str(&format!("Found {} matches:\n", rows.len()));
                for row in rows {
                    let path: String = row.try_get("path").unwrap_or_default();
                    let col: String = row.try_get("collection").unwrap_or_default();
                    out.push_str(&format!("- [{}] {}\n", col, path));
                }
                Ok(out)
            } else {
                Err("Database not initialized".to_string())
            }
        })
    }
}
// (existing code)

impl Tool for ProposeEditTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition {
            name: "propose_edit".to_string(),
            description: "Propose changes to an existing file. Use this for editing code or text. The user will review the changes in a Diff View.".to_string(),
            parameters: serde_json::json!({
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Absolute path to file"
                    },
                    "new_content": {
                        "type": "string",
                        "description": "The full new content of the file"
                    }
                },
                "required": ["path", "new_content"]
            }),
        }
    }

    fn execute(
        &self,
        args: serde_json::Value,
    ) -> Pin<Box<dyn Future<Output = Result<String, String>> + Send + '_>> {
        let app = self.app_handle.clone();
        Box::pin(async move {
            let path_str = args["path"]
                .as_str()
                .ok_or("Missing path argument")?
                .to_string();
            let new_content = args["new_content"]
                .as_str()
                .ok_or("Missing new_content argument")?
                .to_string();

            if !Path::new(&path_str).exists() {
                return Err(format!(
                    "File does not exist: {}. Use write_file to create new files.",
                    path_str
                ));
            }

            // Emit event to frontend
            app.emit(
                "agent-proposal",
                serde_json::json!({
                    "path": path_str,
                    "new_content": new_content
                }),
            )
            .map_err(|e| e.to_string())?;

            Ok(format!(
                "Proposed edit for {}. User is reviewing changes...",
                path_str
            ))
        })
    }
}

// Actual Impl of SemanticSearchTool with Config
struct SemanticSearchTool {
    vector_store: Arc<VectorStoreState>,
    config: crate::ai::ProviderConfig,
}

impl Tool for SemanticSearchTool {
    fn definition(&self) -> ToolDefinition {
        ToolDefinition {
            name: "semantic_search".to_string(),
            description: "Search for similar content by meaning (embeddings). Useful for finding exercises, chapters, or concepts.".to_string(),
            parameters: serde_json::json!({
                "type": "object",
                "properties": {
                    "query": { "type": "string", "description": "Concept or text to find" },
                    "k": { "type": "integer", "description": "Number of results (default 5)" }
                },
                "required": ["query"]
            }),
        }
    }

    fn execute(
        &self,
        args: serde_json::Value,
    ) -> Pin<Box<dyn Future<Output = Result<String, String>> + Send + '_>> {
        let store_state = self.vector_store.clone();
        let config = self.config.clone();

        Box::pin(async move {
            let query_text = args["query"].as_str().ok_or("Missing query")?.to_string();
            let top_k = args["k"].as_u64().unwrap_or(5) as usize;

            let embedding = crate::ai::get_embedding(&query_text, &config)
                .await
                .map_err(|e| e.to_string())?;

            let store = store_state.0.lock().await;
            let results = store.search(&embedding, top_k);

            let mut out = String::new();
            out.push_str(&format!("Found {} semantic matches:\n", results.len()));
            for (id, score) in results {
                out.push_str(&format!("- {} (Score: {:.4})\n", id, score));
            }
            Ok(out)
        })
    }
}

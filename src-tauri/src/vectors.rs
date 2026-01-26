use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{Emitter, Manager, State};
use tokio::sync::Mutex;

use crate::ai::{self, ProviderConfig};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VectorItem {
    pub id: String, // File Path or Chunk ID
    pub vector: Vec<f32>,
    pub metadata: Option<HashMap<String, String>>,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct VectorStore {
    pub vectors: HashMap<String, VectorItem>,
}

impl VectorStore {
    pub fn new() -> Self {
        VectorStore {
            vectors: HashMap::new(),
        }
    }

    pub fn insert(&mut self, item: VectorItem) {
        self.vectors.insert(item.id.clone(), item);
    }

    pub fn search(&self, query_vector: &[f32], top_k: usize) -> Vec<(String, f32)> {
        let mut scores: Vec<(String, f32)> = self
            .vectors
            .values()
            .map(|item| {
                let score = cosine_similarity(query_vector, &item.vector);
                (item.id.clone(), score)
            })
            .collect();

        // Sort by score descending
        scores.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

        scores.into_iter().take(top_k).collect()
    }
}

fn cosine_similarity(v1: &[f32], v2: &[f32]) -> f32 {
    let dot_product: f32 = v1.iter().zip(v2.iter()).map(|(a, b)| a * b).sum();
    let magnitude1: f32 = v1.iter().map(|x| x * x).sum::<f32>().sqrt();
    let magnitude2: f32 = v2.iter().map(|x| x * x).sum::<f32>().sqrt();

    if magnitude1 == 0.0 || magnitude2 == 0.0 {
        return 0.0;
    }

    dot_product / (magnitude1 * magnitude2)
}

// Global State
#[derive(Clone)]
pub struct VectorStoreState(pub Arc<Mutex<VectorStore>>);

// App Data Path helper (placeholder, actual path logic handles mostly in main or passed from frontend)
pub fn get_vectors_path(app_handle: &tauri::AppHandle) -> PathBuf {
    let mut path = app_handle.path().app_data_dir().unwrap();
    path.push("vectors.json");
    path
}

pub fn save_store(store: &VectorStore, path: &PathBuf) -> Result<(), String> {
    let json = serde_json::to_string(store).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())?;
    Ok(())
}

pub fn load_store(path: &PathBuf) -> Result<VectorStore, String> {
    if !path.exists() {
        return Ok(VectorStore::new());
    }
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let store: VectorStore = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    Ok(store)
}

// --- Commands ---

#[tauri::command]
pub async fn store_embeddings(
    items: Vec<VectorItem>,
    state: State<'_, VectorStoreState>, // Use State reference for async usually (or owned since State implies Arc internally? No State<'_, T>)
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    let mut store = state.0.lock().await;
    for item in items {
        store.insert(item);
    }

    // Auto-save
    let path = get_vectors_path(&app_handle);
    save_store(&store, &path)?;

    Ok(())
}

#[tauri::command]
pub async fn search_similar(
    vector: Vec<f32>,
    top_k: usize,
    state: State<'_, VectorStoreState>,
) -> Result<Vec<String>, String> {
    let store = state.0.lock().await;
    let results = store.search(&vector, top_k);
    Ok(results.into_iter().map(|(id, _score)| id).collect())
}

#[tauri::command]
pub async fn build_index_cmd(
    files: Vec<String>,
    config: ProviderConfig,
    state: State<'_, VectorStoreState>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    let total = files.len();
    let mut indexed_count = 0;

    for (index, file_path) in files.iter().enumerate() {
        // 1. Read file with fallback encoding support (lossy) to fix Greek file crashes
        if let Ok(bytes) = fs::read(file_path) {
            let content = String::from_utf8_lossy(&bytes);

            // Simple truncation/chunking for now
            let truncated = if content.len() > 8000 {
                &content[0..8000]
            } else {
                &content
            };

            if truncated.trim().is_empty() {
                continue;
            }

            // 2. Get Embedding (async await)
            match ai::get_embedding(truncated, &config)
                .await
                .map_err(|e| e.to_string())
            {
                Ok(vector) => {
                    // 3. Store (Scoped lock to allow other reads if needed, though we are blocking mostly)
                    {
                        let mut store = state.0.lock().await;
                        store.insert(VectorItem {
                            id: file_path.clone(),
                            vector,
                            metadata: Some(HashMap::from([(
                                "path".to_string(),
                                file_path.clone(),
                            )])),
                        });
                    } // Lock released

                    indexed_count += 1;
                }
                Err(e) => {
                    println!("Failed to embed {}: {}", file_path, e);
                }
            }
        }

        // Emit Progress
        app_handle
            .emit(
                "indexing-progress",
                serde_json::json!({
                    "current": index + 1,
                    "total": total
                }),
            )
            .unwrap_or(());
    }

    // Save at the end
    {
        let store = state.0.lock().await;
        let path = get_vectors_path(&app_handle);
        save_store(&store, &path)?;
    }

    println!(
        "Indexing finished. Processed {} files out of {}.",
        indexed_count, total
    );
    Ok(())
}

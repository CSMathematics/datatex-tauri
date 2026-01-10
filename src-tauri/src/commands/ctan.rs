use crate::types::ctan::{CTANPackage, CTANTopic};
use serde::Serialize;
use std::sync::OnceLock;

/// Embedded CTAN package database JSON (compiled into the binary).
const CTAN_DB_JSON: &str = include_str!("../../../src/assets/CTANpackageDatabase.json");

/// Pre-computed search index entry for fast string matching.
struct SearchIndex {
    name_lower: String,
    id_lower: String,
    caption_lower: Option<String>,
    topic_keys: Vec<String>,
}

/// Database with pre-computed search index for O(1) lookups.
struct PackageDatabase {
    packages: Vec<CTANPackage>,
    search_index: Vec<SearchIndex>,
}

/// Static storage for parsed packages with search index.
static CTAN_DB: OnceLock<PackageDatabase> = OnceLock::new();

/// Returns a reference to the package database with search index.
fn get_db() -> &'static PackageDatabase {
    CTAN_DB.get_or_init(|| {
        let mut packages: Vec<CTANPackage> =
            serde_json::from_str(CTAN_DB_JSON).expect("Failed to parse CTAN database");

        // Pre-sort alphabetically by name (case-insensitive)
        packages.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

        // Pre-compute search index (lowercase fields computed once, not per-search)
        let search_index: Vec<SearchIndex> = packages
            .iter()
            .map(|pkg| SearchIndex {
                name_lower: pkg.name.to_lowercase(),
                id_lower: pkg.id.to_lowercase(),
                caption_lower: Some(pkg.caption.to_lowercase()),
                topic_keys: pkg
                    .topics
                    .as_ref()
                    .map(|t| t.iter().map(|topic| topic.key.clone()).collect())
                    .unwrap_or_default(),
            })
            .collect();

        PackageDatabase {
            packages,
            search_index,
        }
    })
}

/// Lightweight struct for list view - only essential fields to minimize IPC payload.
#[derive(Serialize, Clone)]
pub struct PackageListItem {
    pub id: String,
    pub name: String,
    pub caption: String,
    pub version: String,
    pub home: Option<String>,
    pub ctan: Option<String>,
}

impl PackageListItem {
    fn from_package(pkg: &CTANPackage) -> Self {
        Self {
            id: pkg.id.clone(),
            name: pkg.name.clone(),
            caption: pkg.caption.clone(),
            version: pkg.version.clone(),
            home: pkg.home.clone(),
            ctan: pkg.ctan.clone(),
        }
    }
}

/// Response structure for paginated package queries.
#[derive(Serialize)]
pub struct PackageResponse {
    /// Total number of packages matching the filter (before pagination).
    pub total: usize,
    /// Paginated list of lightweight package items for fast rendering.
    pub packages: Vec<PackageListItem>,
}

/// Fetches packages with optional filtering, pagination, and alphabetical sorting.
/// Uses pre-computed search index for fast string matching.
#[tauri::command]
pub fn get_packages(
    query: Option<String>,
    topic: Option<String>,
    limit: Option<usize>,
    offset: Option<usize>,
) -> PackageResponse {
    use std::time::Instant;
    let start = Instant::now();

    let db = get_db();
    let query_lower = query.clone().map(|q| q.to_lowercase()).unwrap_or_default();
    let topic_key = topic.clone().unwrap_or_default();

    // Filter using pre-computed index (no allocations during search)
    let filtered_indices: Vec<usize> = db
        .search_index
        .iter()
        .enumerate()
        .filter(|(_, idx)| {
            // Match query against pre-computed lowercase fields
            let matches_query = query_lower.is_empty() || {
                idx.name_lower.contains(&query_lower)
                    || idx.id_lower.contains(&query_lower)
                    || idx
                        .caption_lower
                        .as_ref()
                        .map(|c| c.contains(&query_lower))
                        .unwrap_or(false)
            };

            // Match topic by key
            let matches_topic =
                topic_key.is_empty() || idx.topic_keys.iter().any(|k| k == &topic_key);

            matches_query && matches_topic
        })
        .map(|(i, _)| i)
        .collect();

    let total = filtered_indices.len();
    let skip = offset.unwrap_or(0);
    let take = limit.unwrap_or(100);

    // Convert to lightweight list items for fast IPC
    let result_packages: Vec<PackageListItem> = filtered_indices
        .into_iter()
        .skip(skip)
        .take(take)
        .map(|i| PackageListItem::from_package(&db.packages[i]))
        .collect();

    let elapsed = start.elapsed();
    println!(
        "[CTAN] get_packages(query={:?}, topic={:?}) -> {} results in {:?}",
        query, topic, total, elapsed
    );

    PackageResponse {
        total,
        packages: result_packages,
    }
}

/// Returns all unique topics from the package database, sorted by key.
#[tauri::command]
pub fn get_all_topics() -> Vec<CTANTopic> {
    let db = get_db();
    let mut topics_map = std::collections::HashMap::new();

    for pkg in &db.packages {
        if let Some(pkg_topics) = &pkg.topics {
            for t in pkg_topics {
                topics_map
                    .entry(t.key.clone())
                    .or_insert_with(|| CTANTopic {
                        key: t.key.clone(),
                        details: t.details.clone(),
                    });
            }
        }
    }

    let mut topics: Vec<CTANTopic> = topics_map.into_values().collect();
    topics.sort_by(|a, b| a.key.cmp(&b.key));
    topics
}

/// Fetches a single package by its ID.
#[tauri::command]
pub fn get_package_by_id(id: String) -> Option<CTANPackage> {
    let db = get_db();
    // Use index for faster lookup
    let id_lower = id.to_lowercase();
    db.search_index
        .iter()
        .position(|idx| idx.id_lower == id_lower)
        .map(|i| db.packages[i].clone())
}

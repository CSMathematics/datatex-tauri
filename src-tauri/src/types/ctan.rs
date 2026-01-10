use serde::{Deserialize, Serialize};

/// Topic information for package categorization.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CTANTopic {
    pub details: String,
    pub key: String,
}

/// Optimized CTAN package structure (minimal fields for fast loading).
/// Full details available via CTAN/home links.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CTANPackage {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub caption: String,
    #[serde(default)]
    pub version: String,
    pub topics: Option<Vec<CTANTopic>>,
    pub home: Option<String>,
    pub ctan: Option<String>,
}

use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite, migrate::MigrateDatabase, Row};
use std::path::Path;

pub struct DatabaseManager {
    pub pool: Pool<Sqlite>,
}

impl DatabaseManager {
    pub async fn new(data_dir: &str) -> Result<Self, sqlx::Error> {
        let db_path = format!("{}/project.db", data_dir);
        let db_url = format!("sqlite://{}", db_path);

        if !Sqlite::database_exists(&db_url).await.unwrap_or(false) {
            Sqlite::create_database(&db_url).await?;
        }

        let pool = SqlitePoolOptions::new()
            .connect(&db_url)
            .await?;

        // Execute initialization script
        let init_script = include_str!("../migrations/init.sql");

        // Robust SQL splitter handling BEGIN ... END blocks for triggers
        let mut statements = Vec::new();
        let mut current_stmt = String::new();
        let mut in_block = 0;

        for line in init_script.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() || trimmed.starts_with("--") {
                continue;
            }
            
            current_stmt.push_str(line);
            current_stmt.push('\n');

            let upper = trimmed.to_uppercase();
            if upper.starts_with("CREATE TRIGGER") {
                 // Triggers often start blocks, but explicit BEGIN is what matters for splitting
            }
            if upper.contains("BEGIN") {
                in_block += 1;
            }
            
            if upper.ends_with("END;") {
                in_block -= 1;
            }

            if in_block <= 0 && trimmed.ends_with(';') {
                statements.push(current_stmt.clone());
                current_stmt.clear();
                in_block = 0;
            }
        }

        for stmt in statements {
            let stmt = stmt.trim();
            if !stmt.is_empty() {
                match sqlx::query(stmt).execute(&pool).await {
                    Ok(_) => {},
                    Err(e) => {
                        eprintln!("SQL Error executing: {}", stmt);
                        eprintln!("Error: {}", e);
                         // Don't return error immediately, allowing partial init? 
                         // Better to fail if critical. But for existing tables it might error "exists".
                         // sqlx doesn't error on "IF NOT EXISTS" usually.
                         // But if syntax is wrong, it fails.
                        return Err(e);
                    }
                }
            }
        }

        // Debug: print counts for key tables to verify sample data insertion
        let tables = ["resources", "documents", "bibliography"];
        for tbl in &tables {
            let q = format!("SELECT COUNT(*) as c FROM {}", tbl);
            match sqlx::query(&q).fetch_one(&pool).await {
                Ok(row) => {
                    let cnt: i64 = row.try_get("c").unwrap_or(0);
                    println!("[DB DEBUG] table '{}' count = {}", tbl, cnt);
                }
                Err(e) => {
                    eprintln!("[DB DEBUG] failed to query count for {}: {}", tbl, e);
                }
            }
        }

        Ok(Self { pool })
    }

    // Helper to validate table and column names to prevent SQL injection
    async fn validate_identifier(&self, table: &str, column: Option<&str>) -> bool {
        // Simple check: allowed characters (alphanumeric + underscore)
        // A more robust check would be querying the schema.
        let is_valid_name = |s: &str| s.chars().all(|c| c.is_ascii_alphanumeric() || c == '_');
        
        if !is_valid_name(table) { return false; }
        if let Some(col) = column {
            if !is_valid_name(col) { return false; }
        }

        // Check if table exists
        let query = "SELECT name FROM sqlite_master WHERE type='table' AND name = ?";
        let exists: bool = sqlx::query(query)
            .bind(table)
            .fetch_optional(&self.pool)
            .await
            .unwrap_or(None)
            .is_some();
            
        if !exists { return false; }

        if let Some(col) = column {
             // Check if column exists
             let col_query = format!("PRAGMA table_info({})", table);
             let rows = sqlx::query(&col_query).fetch_all(&self.pool).await.unwrap_or_default();
             let col_exists = rows.iter().any(|r| {
                 let name: String = r.get("name");
                 name == col
             });
             if !col_exists { return false; }
        }

        true
    }

    pub async fn get_table_data(
        &self,
        table_name: String,
        page: i64,
        page_size: i64,
        search: String,
        search_cols: Vec<String>,
    ) -> Result<(Vec<serde_json::Value>, i64, Vec<String>), String> {
        if !self.validate_identifier(&table_name, None).await {
             return Err("Invalid table name".to_string());
        }

        // 1. Get Schema (Columns)
        let schema_query = format!("PRAGMA table_info({})", table_name);
        let schema_rows = sqlx::query(&schema_query)
            .fetch_all(&self.pool)
            .await
            .map_err(|e| e.to_string())?;

        let columns: Vec<String> = schema_rows.iter().map(|r| r.get("name")).collect();

        // 2. Build Where Clause
        let mut where_clause = String::new();
        let mut params: Vec<String> = Vec::new();

        if !search.is_empty() && !search_cols.is_empty() {
            let conditions: Vec<String> = search_cols
                .iter()
                .filter(|c| columns.contains(c)) // Only allow existing columns
                .map(|c| format!("{} LIKE ?", c))
                .collect();
            
            if !conditions.is_empty() {
                where_clause = format!("WHERE {}", conditions.join(" OR "));
                for _ in 0..conditions.len() {
                    params.push(format!("%{}%", search));
                }
            }
        }

        // 3. Count Query
        let count_query = format!("SELECT COUNT(*) as count FROM {} {}", table_name, where_clause);
        let mut count_q = sqlx::query(&count_query);
        for p in &params {
            count_q = count_q.bind(p);
        }
        let count_row = count_q.fetch_one(&self.pool).await.map_err(|e| e.to_string())?;
        let total_count: i64 = count_row.get("count");

        // 4. Data Query
        let offset = (page - 1) * page_size;
        let data_query = format!("SELECT * FROM {} {} LIMIT ? OFFSET ?", table_name, where_clause);
        
        let mut data_q = sqlx::query(&data_query);
        for p in &params {
            data_q = data_q.bind(p);
        }
        data_q = data_q.bind(page_size).bind(offset);

        let rows = data_q.fetch_all(&self.pool).await.map_err(|e| e.to_string())?;

        // 5. Convert to JSON
        let mut result_data = Vec::new();
        for row in rows {
            let mut map = serde_json::Map::new();
            for col in &columns {
                 // Try to get as string, int, etc. SQLite is loosely typed.
                 // For simplicity, we try common types or fallback to string.
                 // Better: Use sqlx::Column type checks if needed.
                 // Here we cheat a bit: try string, if null check others.
                 
                 // Note: sqlx generic row access is strict.
                 // We can use `try_get_unchecked` or just try specific types.
                 // Since we don't know the types ahead of time easily without schema parsing types...
                 // A trick: inspect the column type in row?
                 
                 let val_res: Result<String, _> = row.try_get(col.as_str());
                 if let Ok(v) = val_res {
                     map.insert(col.clone(), serde_json::Value::String(v));
                 } else {
                     let int_res: Result<i64, _> = row.try_get(col.as_str());
                     if let Ok(v) = int_res {
                         map.insert(col.clone(), serde_json::Value::Number(v.into()));
                     } else {
                         // Fallback or Null
                         map.insert(col.clone(), serde_json::Value::Null);
                     }
                 }
            }
            result_data.push(serde_json::Value::Object(map));
        }

        Ok((result_data, total_count, columns))
    }

    pub async fn update_cell(
        &self,
        table_name: String,
        id: i64,
        column: String,
        value: String,
    ) -> Result<(), String> {
         if !self.validate_identifier(&table_name, Some(&column)).await {
             println!("Validation failed for table: {}, col: {}", table_name, column);
             return Err("Invalid table or column name".to_string());
        }

        let query = format!("UPDATE {} SET {} = ? WHERE id = ?", table_name, column);
        sqlx::query(&query)
            .bind(value)
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| e.to_string())?;

        Ok(())

    }
}

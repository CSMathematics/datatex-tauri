use tauri::{State, Manager};
use tokio::sync::Mutex;
use directories::ProjectDirs;
use std::fs;

mod compiler;
mod db; // Import το module της βάσης
use db::DatabaseManager;

// 1. Το State για τη βάση δεδομένων
struct AppState {
    db_manager: Mutex<Option<DatabaseManager>>,
}

// 2. Η εντολή για άνοιγμα Project - Πλέον δεν αλλάζει βάση δεδομένων
#[tauri::command]
async fn open_project(path: String, _state: State<'_, AppState>) -> Result<String, String> {
    println!("Setting active project path to: {}", path);
    // Εδώ θα μπορούσαμε να αποθηκεύσουμε το path ως "active working directory"
    // αλλά η βάση δεδομένων είναι πλέον Global και έχει φορτωθεί στο startup.
    Ok("Project path set (Global DB in use)".to_string())
}

#[tauri::command]
fn get_db_path() -> Result<String, String> {
    let proj_dirs = ProjectDirs::from("", "", "datatex");
    if let Some(proj_dirs) = proj_dirs {
        let db_path = proj_dirs.data_dir().join("project.db");
        Ok(db_path.to_string_lossy().to_string())
    } else {
        Err("Could not determine project directories".to_string())
    }
}

// ... Οι υπάρχουσες εντολές σου ...
#[tauri::command]
fn compile_tex(file_path: String, engine: String, args: Vec<String>, output_dir: String) -> Result<String, String> {
    compiler::compile(&file_path, &engine, args, &output_dir)
}

#[tauri::command]
fn run_synctex_command(args: Vec<String>, cwd: String) -> Result<String, String> {
    compiler::run_synctex(args, &cwd)
}

#[tauri::command]
fn run_texcount_command(args: Vec<String>, cwd: String) -> Result<String, String> {
    compiler::run_texcount(args, &cwd)
}

#[tauri::command]
fn get_system_fonts() -> Vec<String> {
    use std::process::Command;
    // ... (ο κώδικας για τα fonts παραμένει ίδιος όπως τον είχες)
    let output = if cfg!(target_os = "linux") {
        Command::new("fc-list").arg(":").arg("family").output().ok()
    } else {
        None
    };

    if let Some(output) = output {
        if output.status.success() {
            let stdout = String::from_utf8_lossy(&output.stdout);
            let mut fonts: Vec<String> = stdout
                .lines()
                .flat_map(|line| line.split(','))
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect();
            fonts.sort();
            fonts.dedup();
            return fonts;
        }
    }
    vec![
        "Consolas".to_string(), "Monaco".to_string(), "Courier New".to_string(),
        "monospace".to_string(), "Arial".to_string(),
    ]
}

#[derive(serde::Serialize)]
struct TableDataResponse {
    data: Vec<serde_json::Value>,
    total_count: i64,
    columns: Vec<String>,
}

#[tauri::command]
async fn get_table_data_cmd(
    table_name: String,
    page: i64,
    page_size: i64,
    search: String,
    search_cols: Vec<String>,
    state: State<'_, AppState>,
) -> Result<TableDataResponse, String> {
    let db_guard = state.db_manager.lock().await;
    if let Some(db) = &*db_guard {
        let (data, total_count, columns) = db.get_table_data(table_name, page, page_size, search, search_cols).await?;
        Ok(TableDataResponse { data, total_count, columns })
    } else {
        Err("Database not initialized".to_string())
    }
}

#[tauri::command]
async fn update_cell_cmd(
    table_name: String,
    id: i64,
    column: String,
    value: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let db_guard = state.db_manager.lock().await;
    if let Some(db) = &*db_guard {
         db.update_cell(table_name, id, column, value).await
    } else {
        Err("Database not initialized".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // 3. Αρχικοποίηση του State
        .manage(AppState {
            db_manager: Mutex::new(None),
        })
        .setup(|app| {
            // Εύρεση του φακέλου δεδομένων
            let proj_dirs = ProjectDirs::from("", "", "datatex");
            let data_dir = if let Some(proj_dirs) = proj_dirs {
                let dir = proj_dirs.data_dir().to_path_buf();
                // Δημιουργία του φακέλου αν δεν υπάρχει
                if let Err(e) = fs::create_dir_all(&dir) {
                    eprintln!("Error creating data directory: {}", e);
                    return Err(Box::new(e));
                }
                dir
            } else {
                // Fallback (θα μπορούσε να είναι το current dir ή panic)
                eprintln!("Could not determine project directories");
                return Err("Could not determine project directories".into());
            };

            let data_dir_str = data_dir.to_string_lossy().to_string();
            println!("Initializing Global DB at: {}", data_dir_str);

            // Ασύγχρονη αρχικοποίηση της βάσης
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                match DatabaseManager::new(&data_dir_str).await {
                    Ok(manager) => {
                        let state = app_handle.state::<AppState>();
                        let mut db_guard = state.db_manager.lock().await;
                        *db_guard = Some(manager);
                        println!("Global database initialized successfully.");
                    }
                    Err(e) => {
                        eprintln!("Failed to initialize global database: {}", e);
                    }
                }
            });

            Ok(())
        })
        // 4. Τα Plugins σου (για να δουλεύουν οι διάλογοι)
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        // .plugin(tauri_plugin_sql::Builder::default().build()) // REMOVED
        // 5. Καταχώρηση ΟΛΩΝ των εντολών
        .invoke_handler(tauri::generate_handler![
            open_project,      // Η νέα εντολή
            get_db_path,
            compile_tex,
            run_synctex_command,
            run_texcount_command,
            get_system_fonts,
            get_table_data_cmd,
            update_cell_cmd
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

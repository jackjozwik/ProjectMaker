// src-tauri/src/main.rs
use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct ProjectConfig {
    project_ref: String,
    artist_ref: String,
    base_path: String,
}

#[tauri::command]
async fn create_project_structure(config: ProjectConfig) -> Result<String, String> {
    let project_dir = format!("{}{}_{}", 
        config.base_path,
        config.project_ref,
        config.artist_ref
    );

    let base_path = PathBuf::from(&project_dir);

    // Create main directories
    let directories = vec![
        "adobe",
        "Deliveries",
        "houdini",
        "maya/assets",
        "maya/cache/ncache",
        "maya/cache/particles",
        "maya/cache/alembic",
        "maya/images",
        "maya/scenes",
        "maya/scripts",
        "maya/sourceimages",
        "nuke/scripts",
        "nuke/renders",
        "nuke/Plates",
        "nuke/Reference",
        "zbrush"
    ];

    for dir in directories {
        let path = base_path.join(dir);
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }

    Ok(format!("Project structure created at {}", project_dir))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![create_project_structure])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
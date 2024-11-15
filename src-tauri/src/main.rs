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


#[derive(Debug, Serialize)]
struct DirEntry {
    name: String,
    path: String,
    children: Vec<DirEntry>,
    is_directory: bool,
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

#[tauri::command]
async fn get_directory_structure(path: String) -> Result<DirEntry, String> {
    println!("Reading directory: {}", path);
    read_dir_recursive(&PathBuf::from(path))
        .map_err(|e| e.to_string())
}

fn read_dir_recursive(path: &PathBuf) -> Result<DirEntry, std::io::Error> {
    let metadata = fs::metadata(path)?;
    let name = path.file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("")
        .to_string();
    
    if metadata.is_dir() {
        println!("Processing directory: {}", path.display());
        let mut children = Vec::new();
        
        for entry in fs::read_dir(path)? {
            let entry = entry?;
            let child_path = entry.path();
            println!("Found child: {}", child_path.display());
            
            children.push(read_dir_recursive(&child_path)?);
        }
        
        // Sort children (directories first, then alphabetically)
        children.sort_by(|a, b| {
            match (a.is_directory, b.is_directory) {
                (true, false) => std::cmp::Ordering::Less,
                (false, true) => std::cmp::Ordering::Greater,
                _ => a.name.cmp(&b.name),
            }
        });

        Ok(DirEntry {
            name,
            path: path.to_string_lossy().into_owned(),
            children,
            is_directory: true,
        })
    } else {
        Ok(DirEntry {
            name,
            path: path.to_string_lossy().into_owned(),
            children: Vec::new(),
            is_directory: false,
        })
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            create_project_structure,
            get_directory_structure
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
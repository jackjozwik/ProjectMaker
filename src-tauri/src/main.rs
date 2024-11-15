// src-tauri/src/main.rs
use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
struct ProjectConfig {
    project_ref: String,
    artist_ref: String,
    base_path: String,
    template_path: Option<String>, // New: path to template JSON file
}

// Keep the original DirEntry struct
#[derive(Debug, Serialize)]
struct DirEntry {
    name: String,
    path: String,
    children: Vec<DirEntry>,
    is_directory: bool,
}

// Add new template structs
#[derive(Debug, Serialize, Deserialize)]
struct ProjectTemplate {
    name: String,
    description: String,
    directories: Vec<String>,
    base_files: Vec<BaseFile>,
}

#[derive(Debug, Serialize, Deserialize)]
struct BaseFile {
    source: String,
    destination: String,
}

// New command to read template
#[tauri::command]
async fn read_template(path: String) -> Result<ProjectTemplate, String> {
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read template file: {}", e))?;
    
    serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse template JSON: {}", e))
}

#[tauri::command]
async fn create_project_structure(config: ProjectConfig) -> Result<String, String> {
    let project_dir = format!("{}{}_{}", 
        config.base_path,
        config.artist_ref,
        config.project_ref
    );

    let base_path = PathBuf::from(&project_dir);

    // Get directories from template if provided, otherwise use defaults
    let directories = if let Some(ref template_path) = config.template_path {
        let template = read_template(template_path.to_string()).await?;
        template.directories
    } else {
        vec![
            "adobe".to_string(),
            "Deliveries".to_string(),
            "houdini".to_string(),
            "maya/assets".to_string(),
            "maya/cache/ncache".to_string(),
            "maya/cache/particles".to_string(),
            "maya/cache/alembic".to_string(),
            "maya/images".to_string(),
            "maya/scenes".to_string(),
            "maya/scripts".to_string(),
            "maya/sourceimages".to_string(),
            "nuke/scripts".to_string(),
            "nuke/renders".to_string(),
            "nuke/Plates".to_string(),
            "nuke/Reference".to_string(),
            "zbrush".to_string()
        ]
    };

    // Create directories
    for dir in directories {
        let path = base_path.join(dir);
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }

    // Copy base files if template was provided
    if let Some(ref template_path) = config.template_path {
        let template = read_template(template_path.to_string()).await?;
        for file in template.base_files {
            let source = PathBuf::from(file.source);
            let destination = base_path.join(file.destination);

            // Ensure parent directory exists
            if let Some(parent) = destination.parent() {
                fs::create_dir_all(parent)
                    .map_err(|e| format!("Failed to create parent directory: {}", e))?;
            }

            // Copy the file
            fs::copy(&source, &destination)
                .map_err(|e| format!("Failed to copy file from {} to {}: {}", 
                    source.display(), destination.display(), e))?;
        }
    }

    Ok(format!("Project structure created at {}", project_dir))
}

// Keep the original directory reading functionality
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
            get_directory_structure,
            read_template
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
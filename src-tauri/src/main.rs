// src-tauri/src/main.rs
use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use tauri::Manager; // This gives us access to the window API
use std::process::Command;


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
    // Normalize the base path
    let base_path = normalize_path(&config.base_path);
    
    
    let project_dir = format!("{}/{}_{}",
        base_path,
        config.artist_ref,
        config.project_ref
    );
    let project_path_buf = PathBuf::from(&project_dir);


    // Get directories from template if provided, otherwise use defaults
    let directories = if let Some(ref template_path) = config.template_path {
        let template = read_template(template_path.to_string()).await?;
        template.directories
    } else {
        vec![
            "adobe".to_string(),
            "Deliveries".to_string(),
            "houdini".to_string(),
            "maya".to_string(),
            "maya/assets".to_string(),
            "maya/autosave".to_string(),
            "maya/cache".to_string(),
            "maya/clips".to_string(),
            "maya/data".to_string(),
            "maya/images".to_string(),
            "maya/movies".to_string(),
            "maya/renderData".to_string(),
            "maya/sceneAssembly".to_string(),
            "maya/scenes".to_string(),
            "maya/scenes/global".to_string(),
            "maya/scripts".to_string(),
            "maya/scripts/global".to_string(),
            "maya/sound".to_string(),
            "maya/sourceImages".to_string(),
            "maya/Time Editor".to_string(),
            "nuke".to_string(),
            "Plates".to_string(),
            "Reference".to_string(),
            "zbrush".to_string()
        ]
    };

    // Create directories
    for dir in directories {
        let path = project_path_buf.join(dir);
        fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    }

    // Copy base files if template was provided
    if let Some(ref template_path) = config.template_path {
        let template = read_template(template_path.to_string()).await?;
        for file in template.base_files {
            let source = PathBuf::from(file.source);
            let destination = project_path_buf.join(file.destination);

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
    let normalized_path = normalize_path(&path);
    read_dir_recursive(&PathBuf::from(normalized_path))
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
            
            // Only process directories
            if entry.metadata()?.is_dir() {
                println!("Found directory: {}", child_path.display());
                children.push(read_dir_recursive(&child_path)?);
            }
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

fn normalize_path(path: &str) -> String {
    let path_buf = PathBuf::from(path);
    path_buf.to_string_lossy()
        .replace("\\", "/")
        .trim_end_matches('/')
        .to_string()
}

#[tauri::command]
async fn create_folder(path: String, create_parents: bool) -> Result<String, String> {

    let normalized_path = normalize_path(&path);
    println!("  - Normalized path: {}", normalized_path);


    println!("Creating folder:");
    println!("  - Full path: {}", path);
    println!("  - Create parents: {}", create_parents);
    
    let path_buf = PathBuf::from(&normalized_path);
    println!("  - Absolute path: {}", path_buf.canonicalize().unwrap_or(path_buf.clone()).display());
    
    if create_parents {
        match fs::create_dir_all(&path_buf) {
            Ok(_) => {
                println!("  - Successfully created directory and parents");
                println!("  - Verifying creation...");
                if path_buf.exists() {
                    println!("  - Verified: Directory exists");
                } else {
                    println!("  - Warning: Directory does not exist after creation");
                }
            },
            Err(e) => {
                println!("  - Error creating directory: {}", e);
                return Err(format!("Failed to create directory: {}", e));
            }
        }
    } else {
        fs::create_dir(&path_buf)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    
    Ok(format!("Directory created successfully at {}", path_buf.display()))
}

#[tauri::command]
async fn copy_to_clipboard(text: String) -> Result<(), String> {
    let mut clipboard = arboard::Clipboard::new()
        .map_err(|e| format!("Failed to access clipboard: {}", e))?;
    
    clipboard.set_text(text)
        .map_err(|e| format!("Failed to copy text: {}", e))?;
    
    Ok(())
}

#[tauri::command]
async fn open_in_explorer(path: String) -> Result<(), String> {
    // Platform-specific commands
    #[cfg(target_os = "windows")]
    {
        Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open explorer: {}", e))?;
    }
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open finder: {}", e))?;
    }
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open file manager: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
async fn debug_log(message: String) {
    println!("Debug: {}", message);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            create_project_structure,
            get_directory_structure,
            read_template,
            create_folder,
            debug_log,
            copy_to_clipboard, 
            open_in_explorer

        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
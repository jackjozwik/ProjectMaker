// src-tauri/src/main.rs

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use tauri::Manager; // This gives us access to the window API

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
    let content =
        fs::read_to_string(&path).map_err(|e| format!("Failed to read template file: {}", e))?;

    serde_json::from_str(&content).map_err(|e| format!("Failed to parse template JSON: {}", e))
}

#[tauri::command]
async fn create_project_structure(config: ProjectConfig) -> Result<String, String> {
    // Normalize the base path
    let base_path = normalize_path(&config.base_path);

    let project_dir = format!("{}/{}_{}", base_path, config.artist_ref, config.project_ref);
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
            "zbrush".to_string(),
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
            fs::copy(&source, &destination).map_err(|e| {
                format!(
                    "Failed to copy file from {} to {}: {}",
                    source.display(),
                    destination.display(),
                    e
                )
            })?;
        }
    }

    Ok(format!("Project structure created at {}", project_dir))
}

// Keep the original directory reading functionality
#[tauri::command]
async fn get_directory_structure(path: String) -> Result<DirEntry, String> {
    // println!("Reading directory: {}", path);
    let normalized_path = normalize_path(&path);
    read_dir_recursive(&PathBuf::from(normalized_path)).map_err(|e| e.to_string())
}

fn read_dir_recursive(path: &PathBuf) -> Result<DirEntry, std::io::Error> {
    let metadata = fs::metadata(path)?;
    let name = path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("")
        .to_string();

    if metadata.is_dir() {
        // println!("Processing directory: {}", path.display());
        let mut children = Vec::new();

        for entry in fs::read_dir(path)? {
            let entry = entry?;
            let child_path = entry.path();
            // println!("Found child: {}", child_path.display());

            // Only process directories
            if entry.metadata()?.is_dir() {
                // println!("Found directory: {}", child_path.display());
                children.push(read_dir_recursive(&child_path)?);
            }
        }

        // Sort children (directories first, then alphabetically)
        children.sort_by(|a, b| match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.cmp(&b.name),
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
    path_buf
        .to_string_lossy()
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
    println!(
        "  - Absolute path: {}",
        path_buf
            .canonicalize()
            .unwrap_or(path_buf.clone())
            .display()
    );

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
            }
            Err(e) => {
                println!("  - Error creating directory: {}", e);
                return Err(format!("Failed to create directory: {}", e));
            }
        }
    } else {
        fs::create_dir(&path_buf).map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    Ok(format!(
        "Directory created successfully at {}",
        path_buf.display()
    ))
}

#[tauri::command]
async fn copy_to_clipboard(text: String) -> Result<(), String> {
    println!("Copying to clipboard - Original path: {}", text);
    let mut clipboard =
        arboard::Clipboard::new().map_err(|e| format!("Failed to access clipboard: {}", e))?;

    // Split path into components and remove duplicates
    let components: Vec<&str> = text.split('/').filter(|&x| !x.is_empty()).collect();

    // Build path without duplicates
    let mut clean_components = Vec::new();
    for component in components {
        if clean_components.is_empty() || clean_components.last() != Some(&component) {
            clean_components.push(component);
        }
    }

    // Reconstruct the path
    let clean_path = if cfg!(windows) {
        // Ensure drive letter is formatted correctly with single colon
        let drive = clean_components[0].trim_end_matches(':');
        format!("{}:/{}", drive, clean_components[1..].join("/"))
    } else {
        format!("/{}", clean_components.join("/"))
    };

    println!("Cleaned path for clipboard: {}", clean_path);

    clipboard
        .set_text(clean_path)
        .map_err(|e| format!("Failed to copy text: {}", e))?;

    println!("Successfully copied to clipboard");
    Ok(())
}

#[tauri::command]
async fn open_in_explorer(path: String) -> Result<(), String> {
    println!("Opening in explorer - Original path: {}", path);

    // Split path into components and remove duplicates
    let components: Vec<&str> = path.split('/').filter(|&x| !x.is_empty()).collect();

    // Build path without duplicates
    let mut clean_components = Vec::new();
    for component in components {
        if clean_components.is_empty() || clean_components.last() != Some(&component) {
            clean_components.push(component);
        }
    }

    // Reconstruct the path
    let clean_path = if cfg!(windows) {
        // Fix: Ensure drive letter is formatted correctly with single colon
        let drive = clean_components[0].trim_end_matches(':'); // Remove any existing colons
        format!("{}:/{}", drive, clean_components[1..].join("/"))
    } else {
        format!("/{}", clean_components.join("/"))
    };

    println!("Cleaned path: {}", clean_path);

    #[cfg(target_os = "windows")]
    {
        let windows_path = clean_path.replace("/", "\\");
        println!("Windows formatted path: {}", windows_path);
        Command::new("explorer")
            .args(["/select,", &windows_path])
            .spawn()
            .map_err(|e| format!("Failed to open explorer: {}", e))?;
    }
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg("-R")
            .arg(&clean_path)
            .spawn()
            .map_err(|e| format!("Failed to open finder: {}", e))?;
    }
    #[cfg(target_os = "linux")]
    {
        if let Some(parent) = std::path::Path::new(&clean_path).parent() {
            Command::new("xdg-open")
                .arg(parent)
                .spawn()
                .map_err(|e| format!("Failed to open file manager: {}", e))?;
        }
    }

    Ok(())
}

fn clean_path(path: &str) -> String {
    // Store the normalized path first
    let normalized = path.replace("\\", "/");
    
    // Split path into components and remove empties
    let components: Vec<&str> = normalized
        .split('/')
        .filter(|&x| !x.is_empty())
        .collect();

    if components.is_empty() {
        return String::new();
    }

    // Handle Windows drive letter
    let (drive, rest) = if components[0].ends_with(':') {
        // Remove any colons from drive letter and add back a single one
        let drive = components[0].trim_end_matches(':');
        (format!("{}:", drive), &components[1..])
    } else {
        (components[0].to_string(), &components[1..])
    };

    // Build clean path without duplicates
    let mut clean_components = Vec::new();
    for component in rest {
        if clean_components.is_empty() || clean_components.last() != Some(component) {
            clean_components.push(*component);
        }
    }

    // Reconstruct path
    if clean_components.is_empty() {
        drive
    } else {
        format!("{}/{}", drive, clean_components.join("/"))
    }
}

#[tauri::command]
async fn rename_folder(old_path: String, new_name: String) -> Result<(), String> {
    println!("Renaming folder: {} to {}", old_path, new_name);

    // Clean the incoming path
    let clean_old_path = clean_path(&old_path);
    println!("Cleaned path: {}", clean_old_path);

    let path = PathBuf::from(&clean_old_path);

    // Create the new path by replacing just the last component
    let new_path = path
        .parent()
        .ok_or_else(|| "Could not get parent directory".to_string())?
        .join(&new_name);

    println!(
        "Clean paths - Old: {}, New: {}",
        path.display(),
        new_path.display()
    );

    // Don't allow renaming project root folders (ABC_XYZ pattern)
    if let Some(folder_name) = path.file_name().and_then(|n| n.to_str()) {
        if folder_name.len() == 7 && folder_name.chars().nth(3) == Some('_') {
            return Err("Cannot rename project root folder".to_string());
        }
    }

    // Check if folder contains files
    let has_files = fs::read_dir(&path)
        .map_err(|e| format!("Failed to read directory: {}", e))?
        .any(|entry| entry.ok().map(|e| e.path().is_file()).unwrap_or(false));

    if has_files {
        return Err(
            "Folder contains files. Please ensure folder is empty before renaming.".to_string(),
        );
    }

    // Get all matching folders in the project structure
    let folder_name = path
        .file_name()
        .ok_or_else(|| "Could not get folder name".to_string())?
        .to_str()
        .ok_or_else(|| "Invalid folder name".to_string())?;

    // Find project root by looking for ABC_XYZ pattern
    let root_path = path
        .ancestors()
        .find(|p| {
            p.file_name()
                .and_then(|n| n.to_str())
                .map(|n| n.len() == 7 && n.chars().nth(3) == Some('_'))
                .unwrap_or(false)
        })
        .ok_or_else(|| "Could not find project root".to_string())?;

    // Find all folders with matching name in project
    let folders_to_rename = find_matching_folders(root_path, folder_name)?;

    // Rename each matching folder
    for folder in folders_to_rename {
        let new_path = folder
            .parent()
            .ok_or_else(|| "Could not get parent path".to_string())?
            .join(&new_name);

        if new_path.exists() {
            return Err(format!(
                "Destination already exists: {}",
                new_path.display()
            ));
        }

        fs::rename(&folder, &new_path)
            .map_err(|e| format!("Failed to rename {}: {}", folder.display(), e))?;
    }

    Ok(())
}

#[tauri::command]
async fn delete_folder(path: String) -> Result<(), String> {
    println!("Deleting folder: {}", path);
    
    // Clean the incoming path
    let clean_path_str = clean_path(&path);
    println!("Cleaned path: {}", clean_path_str);
    
    let path = PathBuf::from(clean_path_str);
    
    // Don't allow deleting project root folders
    if let Some(folder_name) = path.file_name().and_then(|n| n.to_str()) {
        if folder_name.len() == 7 && folder_name.chars().nth(3) == Some('_') {
            return Err("Cannot delete project root folder".to_string());
        }
    }

    let folder_name = path
        .file_name()
        .ok_or_else(|| "Could not get folder name".to_string())?
        .to_str()
        .ok_or_else(|| "Invalid folder name".to_string())?;

    let root_path = path
        .ancestors()
        .find(|p| {
            p.file_name()
                .and_then(|n| n.to_str())
                .map(|n| n.len() == 7 && n.chars().nth(3) == Some('_'))
                .unwrap_or(false)
        })
        .ok_or_else(|| "Could not find project root".to_string())?;

    // Find all folders with matching name
    let folders_to_delete = find_matching_folders(root_path, folder_name)?;

    // Delete each folder and its contents
    for folder in folders_to_delete {
        fs::remove_dir_all(&folder)
            .map_err(|e| format!("Failed to delete {}: {}", folder.display(), e))?;
    }

    Ok(())
}

fn find_matching_folders(root: &Path, target_name: &str) -> Result<Vec<PathBuf>, String> {
    let mut matching_folders = Vec::new();

    visit_dirs(root, target_name, &mut matching_folders)?;

    Ok(matching_folders)
}

fn visit_dirs(dir: &Path, target: &str, folders: &mut Vec<PathBuf>) -> Result<(), String> {
    if dir.is_dir() {
        for entry in fs::read_dir(dir).map_err(|e| format!("Failed to read directory: {}", e))? {
            let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
            let path = entry.path();

            if path.is_dir() {
                if path
                    .file_name()
                    .and_then(|n| n.to_str())
                    .map(|n| n == target)
                    .unwrap_or(false)
                {
                    folders.push(path.clone());
                }
                visit_dirs(&path, target, folders)?;
            }
        }
    }
    Ok(())
}

#[tauri::command]
async fn debug_log(message: String) {
    // println!("Debug: {}", message);
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
            open_in_explorer,
            rename_folder,
            delete_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

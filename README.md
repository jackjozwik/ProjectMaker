# Project Maker

A desktop application built with Tauri (Rust) and React for managing VFX project directories. Creates standardized project folders following the naming pattern: `<3 letter artist code>_<3 letter project code>`.

![Project Maker Screenshot](screenshot.png)

## Features

- Create standardized VFX project directories
- Dark/Light mode support with persistent theme settings
- Context menu for quick actions:
  - Copy path
  - Open in Explorer
  - Add Asset/R&D/Shot with standardized sub-directories
- Directory tree visualization
- Template system for custom project structures
- Split panel interface with resizable panels
- Custom frameless window with Windows-style controls

## Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Rust + Tauri
- **UI Components**: 
  - Lucide Icons
  - shadcn/ui components
  - Custom TitleBar
  - React Split Panels

## Development Prerequisites

- Node.js LTS (22.11.0 required - newer versions may have issues)
- Rust (latest stable)
- Windows Build Tools (for Windows development)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/project-maker.git
cd project-maker
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Run in development mode:
```bash
npm run tauri:dev
```

## Building

1. Ensure you have the correct Node.js version:
```bash
# Install nvm-windows if needed
nvm install 22.11.0
nvm use 22.11.0
node -v  # Should be v22.11.0
```

2. Place your icon in the correct location:
```
src-tauri/icons/icon.png  # For application icon
src/assets/icon.png       # For title bar icon
```

3. Build the application:
```bash
npm run tauri:build
```

The built application will be available in:
- NSIS Installer: `src-tauri/target/release/bundle/nsis/`
- MSI Installer: `src-tauri/target/release/bundle/msi/`
- Executable: `src-tauri/target/release/`

## Template System

Project Maker supports custom templates via JSON files. Two example templates are provided:

### Standard VFX Template
```json
{
    "name": "Standard VFX Template",
    "description": "Default VFX project structure",
    "directories": [
        "maya/assets",
        "maya/scenes",
        // ... other directories
    ],
    "base_files": [
        {
            "source": "path/to/template.ma",
            "destination": "maya/scenes/template.ma"
        }
    ]
}
```

### Empty Template
```json
{
    "name": "Empty Template",
    "description": "Minimal template with no predefined structure",
    "directories": [],
    "base_files": []
}
```

**Note**: Template JSON files must not contain trailing commas.

## Project Structure

```
project-maker/
├── src/
│   ├── assets/           # Frontend assets (icons, images)
│   ├── components/       # React components
│   │   ├── ActionButtons.jsx
│   │   ├── ContextMenu.jsx
│   │   ├── Layout.jsx
│   │   ├── ThemeToggle.jsx
│   │   └── TitleBar.jsx
│   ├── hooks/           # Custom React hooks
│   └── types/           # Type definitions
├── src-tauri/
│   ├── icons/           # Application icons
│   └── src/             # Rust backend code
│       └── main.rs      # Core functionality
├── public/              # Static assets
└── package.json        # Project configuration
```

## Known Issues & Solutions

1. Node.js Version:
   - Must use Node.js 22.11.0 LTS
   - Newer versions may cause build issues
   - Use nvm-windows to manage Node.js versions

2. Icon Requirements:
   - Application icon: `src-tauri/icons/icon.png`
   - Title bar icon: `src/assets/icon.png`
   - Minimum size: 512x512 pixels

3. Template JSON:
   - Must not contain trailing commas
   - Requires all properties even if empty
   - Paths should use forward slashes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Your License Here]

## Acknowledgments

- The Tauri Team for the framework
- Lucide for icons
- React Split for the panel system
- shadcn/ui for UI components

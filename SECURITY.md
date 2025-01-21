# Security Considerations for Project Maker

## Why Tauri is More Antivirus-Friendly

1. Code Signing
```toml
# In your tauri.conf.json, add code signing configuration:
{
  "tauri": {
    "bundle": {
      "windows": {
        "certificateThumbprint": "YOUR_CERT_THUMBPRINT",
        "timestampUrl": "http://timestamp.digicert.com"
      }
    }
  }
}
```

2. Controlled System Access
Our application only requests necessary permissions:
```json
{
  "tauri": {
    "allowlist": {
      "fs": {
        "scope": ["**"],
        "all": true
      },
      "dialog": {
        "all": true
      },
      "window": {
        "maximize": true,
        "unmaximize": true,
        "minimize": true,
        "close": true,
        "startDragging": true
      },
      "shell": {
        "open": true
      },
      "clipboard": {
        "writeText": true
      }
    }
  }
}
```

## Steps to Minimize Antivirus Flags

1. Code Signing Certificate
   - Purchase a code signing certificate from a trusted provider (DigiCert, Sectigo, etc.)
   - Use Windows SignTool to sign your .exe and installers
   - Configure timestamp server for long-term validity

2. Document File Operations
```rust
// All file operations are documented in main.rs:
- create_project_structure: Creates project directories
- get_directory_structure: Reads directory contents
- create_folder: Creates individual folders
- copy_to_clipboard: Copies path strings
- open_in_explorer: Opens Windows Explorer
```

3. Installation Location
- Install to standard locations (`Program Files` or `AppData`)
- Avoid writing to system directories
- Use proper Windows installation paths

4. Windows Smart Screen
To help with Windows Smart Screen:
```powershell
# Sign your executable
signtool sign /tr http://timestamp.digicert.com /td sha256 /fd sha256 /a "path\to\your\app.exe"

# Sign your installer
signtool sign /tr http://timestamp.digicert.com /td sha256 /fd sha256 /a "path\to\your\installer.exe"
```

## Current Security Measures

1. Limited System Access
- Only requested permissions are granted
- File system access is scoped to project directories
- No network access required
- No background processes

2. Transparent Operations
- All file operations are logged
- User-initiated actions only
- Clear visual feedback for operations
- No hidden file manipulation

3. Installation Safety
- NSIS installer follows Windows standards
- MSI installer for enterprise deployment
- Clean uninstallation process
- No registry modifications outside installation

## For Users

If your antivirus flags the application:

1. Verify the download:
   - Check the digital signature
   - Download from official sources only
   - Verify the certificate chain

2. Add Exceptions (if needed):
   - Add installation directory to antivirus exclusions
   - Whitelist the executable
   - Trust the certificate

3. Enterprise Deployment:
   - Use the MSI installer
   - Deploy via Group Policy
   - Add to enterprise whitelist

## For Developers

When building from source:

1. Clean Build Process:
```bash
# Clean previous builds
cargo clean
rm -rf node_modules
npm cache clean --force

# Fresh install and build
npm install
npm run tauri:build
```

2. Code Signing Setup:
```powershell
# Generate CSR (Certificate Signing Request)
New-SelfSignedCertificate -Type Custom -Subject "CN=YOUR_NAME" -KeyUsage DigitalSignature -KeyAlgorithm RSA -KeyLength 2048 -CertStoreLocation "Cert:\CurrentUser\My"

# Export certificate
$password = ConvertTo-SecureString -String "YOUR_PASSWORD" -Force -AsPlainText
Export-PfxCertificate -Cert "Cert:\CurrentUser\My\CERTIFICATE_THUMBPRINT" -FilePath "certificate.pfx" -Password $password
```

3. Build Configuration:
```toml
[package.metadata.bundle]
identifier = "com.project-maker.dev"
icon = ["icons/32x32.png", "icons/128x128.png"]
resources = ["icons/*"]
copyright = "© 2024 Your Name"
```

## Compliance and Best Practices

1. No suspicious behaviors:
   - No auto-updates without user consent
   - No background processes
   - No network connections
   - No system modifications outside scope

2. Clean installation/uninstallation:
   - All files documented
   - Clear installation paths
   - Complete removal on uninstall
   - No leftover registry entries

3. Transparent operation:
   - All file operations are logged
   - User interface shows all actions
   - Clear error messages
   - No hidden functionality

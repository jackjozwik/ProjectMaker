// Project template type definitions in plain JS
// These serve as documentation for the expected shape of our data

/**
 * @typedef {Object} ProjectTemplate
 * @property {string} name - Template name
 * @property {string} description - Template description
 * @property {string[]} directories - Array of directory paths
 * @property {BaseFile[]} baseFiles - Array of files to copy
 */

/**
 * @typedef {Object} BaseFile
 * @property {string} source - Source path of the file to copy
 * @property {string} destination - Relative path within project structure
 */

// Example template object structure:
const exampleTemplate = {
    name: "Default VFX Template",
    description: "Standard VFX project structure with basic directories",
    directories: [
        "adobe",
        "Deliveries",
        "houdini",
        "maya/assets",
        // ... other directories
    ],
    baseFiles: [
        {
            source: "C:/Templates/maya/default.ma",
            destination: "maya/scenes/default.ma"
        }
    ]
};

export default exampleTemplate; // This is just for reference, not actual use
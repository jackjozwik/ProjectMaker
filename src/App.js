// src/App.jsx
import { useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { open } from '@tauri-apps/api/dialog'

function App() {
  const [projectRef, setProjectRef] = useState('')
  const [artistRef, setArtistRef] = useState('')
  const [basePath, setBasePath] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [showDirectoryView, setShowDirectoryView] = useState(true)

  // Example directory structure (you'll need to populate this based on your actual structure)
  const [directoryStructure, setDirectoryStructure] = useState({
    name: 'Project Root',
    children: [
      {
        name: 'adobe',
        children: []
      },
      {
        name: 'Deliveries',
        children: []
      },
      {
        name: 'maya',
        children: [
          { name: 'assets', children: [] },
          { name: 'cache', children: [] },
          { name: 'scenes', children: [] }
        ]
      }
    ]
  })

  const handleBasePathSelect = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      })
      if (selected) {
        setBasePath(selected)
      }
    } catch (err) {
      console.error('Failed to select directory:', err)
    }
  }

  const validateInputs = () => {
    const errors = {}
    if (projectRef.length !== 3) {
      errors.projectRef = 'Project reference must be exactly 3 characters'
    }
    if (artistRef.length !== 3) {
      errors.artistRef = 'Artist reference must be exactly 3 characters'
    }
    return errors
  }

  // Add this function back where all the other functions are defined
const createProject = async () => {
  try {
    setIsLoading(true)
    // Normalize the path
    const normalizedPath = normalizePath(basePath)
    const response = await invoke('create_project_structure', {
      config: {
        project_ref: projectRef.toUpperCase(),
        artist_ref: artistRef.toUpperCase(),
        base_path: normalizedPath
      }
    })
    setMessage(response)
    // After successful creation, you might want to update the directory view
    // We can add this functionality later
  } catch (error) {
    setMessage(`Error: ${error}`)
  } finally {
    setIsLoading(false)
  }
}

// And add this function if it's not there
const normalizePath = (path) => {
  if (!path) return '';
  // Replace backslashes with forward slashes
  path = path.replace(/\\/g, '/');
  // Add trailing slash if not present
  return path.endsWith('/') ? path : `${path}/`;
}

  const handleCreateProject = () => {
    const errors = validateInputs()
    if (Object.keys(errors).length === 0) {
      createProject()
    } else {
      setValidationErrors(errors)
    }
  }

  // Directory Tree Component
  const DirectoryTree = ({ node, depth = 0 }) => (
    <div className="ml-4">
      <div className="flex items-center text-sm py-1">
        <span className="mr-2">📁</span>
        {node.name}
      </div>
      {node.children && node.children.map((child, index) => (
        <DirectoryTree key={index} node={child} depth={depth + 1} />
      ))}
    </div>
  )

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Main Form Panel */}
      <div className="flex-1 py-8 px-4 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Maker</h1>
            <p className="text-gray-600">Create project directories with ease</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            {/* Project Reference Input */}
            <div>
              <label htmlFor="projectRef" className="block text-sm font-medium text-gray-700 mb-1">
                Project Reference
              </label>
              <input
                id="projectRef"
                type="text"
                placeholder="e.g., CPS"
                value={projectRef}
                onChange={(e) => setProjectRef(e.target.value.toUpperCase())}
                onBlur={() => {
                  if (projectRef && projectRef.length !== 3) {
                    setValidationErrors(prev => ({
                      ...prev,
                      projectRef: 'Must be exactly 3 characters'
                    }))
                  } else {
                    setValidationErrors(prev => {
                      const { projectRef, ...rest } = prev
                      return rest
                    })
                  }
                }}
                className={`uppercase w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                  ${validationErrors.projectRef ? 'border-red-500' : 'border-gray-300'}`}
                maxLength={3}
              />
              {validationErrors.projectRef && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.projectRef}</p>
              )}
            </div>

            {/* Artist Reference Input */}
            <div>
              <label htmlFor="artistRef" className="block text-sm font-medium text-gray-700 mb-1">
                Artist Reference
              </label>
              <input
                id="artistRef"
                type="text"
                placeholder="e.g., NDH"
                value={artistRef}
                onChange={(e) => setArtistRef(e.target.value.toUpperCase())}
                onBlur={() => {
                  if (artistRef && artistRef.length !== 3) {
                    setValidationErrors(prev => ({
                      ...prev,
                      artistRef: 'Must be exactly 3 characters'
                    }))
                  } else {
                    setValidationErrors(prev => {
                      const { artistRef, ...rest } = prev
                      return rest
                    })
                  }
                }}
                className={`uppercase w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                  ${validationErrors.artistRef ? 'border-red-500' : 'border-gray-300'}`}
                maxLength={3}
              />
              {validationErrors.artistRef && (
                <p className="mt-1 text-xs text-red-500">{validationErrors.artistRef}</p>
              )}
            </div>

            {/* Base Path Input */}
            <div>
              <label htmlFor="basePath" className="block text-sm font-medium text-gray-700 mb-1">
                Base Path
              </label>
              <div className="flex gap-2">
                <input
                  id="basePath"
                  type="text"
                  placeholder="e.g., C:/Projects/"
                  value={basePath}
                  onChange={(e) => setBasePath(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleBasePathSelect}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Browse
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCreateProject}
                disabled={isLoading || !projectRef || !artistRef || !basePath}
                className={`w-full py-2 px-4 rounded-md text-white font-medium 
                  ${isLoading || !projectRef || !artistRef || !basePath 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  } transition-colors duration-200`}
              >
                {isLoading ? 'Creating...' : 'Create Project Structure'}
              </button>

              <div className="grid grid-cols-3 gap-3">
                <button className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Add Asset
                </button>
                <button className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  Add RnD
                </button>
                <button className="w-full py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                  Add Shot
                </button>
              </div>
            </div>

            {message && (
              <div className={`mt-4 p-4 rounded-md ${
                message.includes('Error') 
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Directory View Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Directory Structure</h2>
            <button 
              onClick={() => setShowDirectoryView(!showDirectoryView)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showDirectoryView ? '→' : '←'}
            </button>
          </div>
          <DirectoryTree node={directoryStructure} />
        </div>
      </div>
    </div>
  )
}

export default App
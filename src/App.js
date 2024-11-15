// src/App.jsx
import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import { open } from '@tauri-apps/api/dialog'
import { readDir } from '@tauri-apps/api/fs'

function App() {
  const [artistRef, setArtistRef] = useState(() => 
    localStorage.getItem('artistRef') || ''
  )
  const [projectRef, setProjectRef] = useState('')
  const [basePath, setBasePath] = useState(() => 
    localStorage.getItem('lastBasePath') || ''
  )
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [directoryStructure, setDirectoryStructure] = useState({
    name: 'Project Root',
    children: []
  })
  const [expandedNodes, setExpandedNodes] = useState(new Set())
  const [isProjectFolder, setIsProjectFolder] = useState(true)

  // Load artist reference from localStorage
  useEffect(() => {
    const savedArtistRef = localStorage.getItem('artistRef')
    if (savedArtistRef) {
      setArtistRef(savedArtistRef)
    }
  }, [])

  // Save artist reference to localStorage when it changes
  useEffect(() => {
    if (artistRef) {
      localStorage.setItem('artistRef', artistRef)
    }
  }, [artistRef])

  // Save and load base path
  useEffect(() => {
    if (basePath) {
      localStorage.setItem('lastBasePath', basePath)
      loadDirectoryStructure()
    }
  }, [basePath])

  const normalizePath = (path) => {
    if (!path) return '';
    path = path.replace(/\\/g, '/');
    return path.endsWith('/') ? path : `${path}/`;
  }

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

  const loadDirectoryStructure = async () => {
    try {
      if (!basePath) return
      const entries = await readDir(basePath, { recursive: true })
      const structure = {
        name: basePath,
        children: entries.map(entry => ({
          name: entry.name,
          children: []
        }))
      }
      setDirectoryStructure(structure)
    } catch (error) {
      console.error('Failed to load directory structure:', error)
      setMessage('Failed to load directory structure')
    }
  }

  const createProject = async () => {
    try {
      setIsLoading(true)
      const normalizedPath = normalizePath(basePath)
      const response = await invoke('create_project_structure', {
        config: {
          project_ref: projectRef.toUpperCase(),
          artist_ref: artistRef.toUpperCase(),
          base_path: normalizedPath
        }
      })
      setMessage(response)
      loadDirectoryStructure() // Reload directory structure after creation
    } catch (error) {
      setMessage(`Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = () => {
    const errors = validateInputs()
    if (Object.keys(errors).length === 0) {
      createProject()
    } else {
      setValidationErrors(errors)
    }
  }

  const toggleNode = (path) => {
    setExpandedNodes(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  // Directory Tree Component with collapsible nodes
  const DirectoryTree = ({ node, path = '' }) => {
    if (!node) return null;
    
    const fullPath = path ? `${path}/${node.name}` : node.name
    const isExpanded = expandedNodes.has(fullPath)

    return (
      <div className="ml-4">
        <div 
          className="flex items-center text-sm py-1 cursor-pointer hover:bg-gray-100"
          onClick={() => node.children?.length && toggleNode(fullPath)}
        >
          {node.children?.length > 0 && (
            <span className="mr-1">{isExpanded ? '▼' : '▶'}</span>
          )}
          <span className="mr-2">📁</span>
          {node.name}
        </div>
        {isExpanded && node.children && (
          <div className="ml-4">
            {node.children.map((child, index) => (
              <DirectoryTree 
                key={index} 
                node={child} 
                path={fullPath}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Global Message Banner */}
      {message && (
        <div className={`w-full p-4 ${
          message.includes('Error') 
            ? 'bg-red-50 text-red-700 border-b border-red-200'
            : 'bg-green-50 text-green-700 border-b border-green-200'
        }`}>
          {message}
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Form Panel */}
        <div className="flex-1 py-8 px-4 overflow-y-auto">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Maker</h1>
              <p className="text-gray-600">Create project directories with ease</p>
            </div>

            {/* Artist Reference at Top */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
              <div className="mb-4">
                <label htmlFor="artistRef" className="block text-sm font-medium text-gray-700 mb-1">
                  Artist Reference
                </label>
                <input
                  id="artistRef"
                  type="text"
                  placeholder="e.g., NDH"
                  value={artistRef}
                  onChange={(e) => setArtistRef(e.target.value.toUpperCase())}
                  className="uppercase w-full px-3 py-2 border border-gray-300 rounded-md"
                  maxLength={3}
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
              {/* Project Type Toggle */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={isProjectFolder} 
                    onChange={(e) => setIsProjectFolder(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative w-10 h-6 transition-colors duration-200 ease-in-out rounded-full ${
                    isProjectFolder ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    <div className={`absolute left-1 top-1 w-4 h-4 transition-transform duration-200 ease-in-out bg-white rounded-full ${
                      isProjectFolder ? 'transform translate-x-4' : 'transform translate-x-0'
                    }`} />
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    Project Folder
                  </span>
                </label>
              </div>

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
                  className="uppercase w-full px-3 py-2 border border-gray-300 rounded-md"
                  maxLength={3}
                />
                {validationErrors.projectRef && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.projectRef}</p>
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    onClick={handleBasePathSelect}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-200"
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
                  className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                    isLoading || !projectRef || !artistRef || !basePath 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? 'Creating...' : 'Create Project Structure'}
                </button>

                {isProjectFolder && (
                  <div className="grid grid-cols-3 gap-3">
                    <button className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700">
                      Add Asset
                    </button>
                    <button className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                      Add RnD
                    </button>
                    <button className="w-full py-2 px-4 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                      Add Shot
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Directory View Sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Directory Structure</h2>
            </div>
            {directoryStructure && <DirectoryTree node={directoryStructure} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
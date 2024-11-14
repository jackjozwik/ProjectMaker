// src/App.jsx
import { useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'
import React from 'react'
import './index.css'  // Make sure this line exists!


function App() {
  const [projectRef, setProjectRef] = useState('')
  const [artistRef, setArtistRef] = useState('')
  const [basePath, setBasePath] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const createProject = async () => {
    try {
      setIsLoading(true)
      const response = await invoke('create_project_structure', {
        config: {
          project_ref: projectRef,
          artist_ref: artistRef,
          base_path: basePath
        }
      })
      setMessage(response)
    } catch (error) {
      setMessage(`Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Maker</h1>
          <p className="text-gray-600">Create project directories with ease</p>
        </div>

        {/* Form Card */}
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
              onChange={(e) => setProjectRef(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Three capital letters/numbers that represent the project</p>
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
              onChange={(e) => setArtistRef(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Three character code that represents you</p>
          </div>

          {/* Base Path Input */}
          <div>
            <label htmlFor="basePath" className="block text-sm font-medium text-gray-700 mb-1">
              Base Path
            </label>
            <input
              id="basePath"
              type="text"
              placeholder="e.g., C:/Projects/"
              value={basePath}
              onChange={(e) => setBasePath(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Root directory where project will be created</p>
          </div>

          {/* Create Button */}
          <button
            onClick={createProject}
            disabled={isLoading || !projectRef || !artistRef || !basePath}
            className={`w-full py-2 px-4 rounded-md text-white font-medium 
              ${isLoading || !projectRef || !artistRef || !basePath 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              } transition-colors duration-200`}
          >
            {isLoading ? 'Creating...' : 'Create Project Structure'}
          </button>

          {/* Message Display */}
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
  )
}

export default App
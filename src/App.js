// src/App.jsx
import { useState } from 'react'
import { invoke } from '@tauri-apps/api/tauri'

function App() {
  const [projectRef, setProjectRef] = useState('')
  const [artistRef, setArtistRef] = useState('')
  const [basePath, setBasePath] = useState('')
  const [message, setMessage] = useState('')

  const createProject = async () => {
    try {
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
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Project Maker</h1>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Project Reference (e.g., CPS)"
          value={projectRef}
          onChange={(e) => setProjectRef(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Artist Reference (e.g., NDH)"
          value={artistRef}
          onChange={(e) => setArtistRef(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Base Path"
          value={basePath}
          onChange={(e) => setBasePath(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={createProject}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create Project Structure
        </button>
        {message && (
          <div className="p-4 bg-gray-100 rounded">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
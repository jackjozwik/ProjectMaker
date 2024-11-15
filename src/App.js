// src/App.jsx
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import { readDir } from '@tauri-apps/api/fs';
import Split from 'react-split';
import './index.css';
import Toast from './components/Toast';
import { SidebarToggle, Sidebar } from './components/Layout';
import useAppFunctions from './hooks/useAppFunctions.jsx';

function App() {
  const { state, actions } = useAppFunctions();
  const {
    artistRef,
    projectRef,
    basePath,
    isLoading,
    validationErrors,
    directoryStructure,
    expandedNodes,
    isProjectFolder,
    showSidebar,
    toastMessage
  } = state;

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => actions.setToastMessage('')}
          type={toastMessage.includes('Error') ? 'error' : 'success'}
        />
      )}

      {/* Sidebar Toggle Button */}
      <SidebarToggle
        showSidebar={showSidebar}
        onToggle={() => actions.setShowSidebar(!showSidebar)}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Split
          sizes={showSidebar ? [70, 30] : [100, 0]}
          minSize={showSidebar ? [400, 200] : [400, 0]}
          expandToMin={false}
          gutterSize={10}
          snapOffset={30}
          dragInterval={1}
          className="split flex w-full"
        >

          {/* Main Form Panel */}
          <div className="flex-1 py-8 px-4 overflow-y-auto min-w-0">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Maker</h1>
                <p className="text-gray-600">Create project directories with ease</p>
              </div>

              {/* Artist Reference Section */}
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
                    onChange={(e) => actions.setArtistRef(e.target.value.toUpperCase())}
                    className="uppercase w-full px-3 py-2 border border-gray-300 rounded-md"
                    maxLength={3}
                  />
                </div>
              </div>

              {/* Project Settings Section */}
              <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
                {/* Project Type Toggle */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isProjectFolder}
                      onChange={(e) => actions.setIsProjectFolder(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`relative w-10 h-6 transition-colors duration-200 ease-in-out rounded-full ${isProjectFolder ? 'bg-blue-600' : 'bg-gray-200'
                      }`}>
                      <div className={`absolute left-1 top-1 w-4 h-4 transition-transform duration-200 ease-in-out bg-white rounded-full ${isProjectFolder ? 'transform translate-x-4' : 'transform translate-x-0'
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
                    onChange={(e) => actions.setProjectRef(e.target.value.toUpperCase())}
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
                      onChange={(e) => actions.setBasePath(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <button
                      onClick={actions.handleBasePathSelect}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-200"
                    >
                      Browse
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={actions.handleCreateProject}
                    disabled={isLoading || !projectRef || !artistRef || !basePath}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium ${isLoading || !projectRef || !artistRef || !basePath
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
          <div className={`${showSidebar ? 'block' : 'hidden'} bg-white border-l border-gray-200 overflow-y-auto min-w-0`}>
            <Sidebar
              showSidebar={showSidebar}
              directoryStructure={directoryStructure}
              expandedNodes={expandedNodes}
              onToggleNode={actions.toggleNode}
            />
          </div>
        </Split>
      </div>
    </div>
  );
}

export default App;
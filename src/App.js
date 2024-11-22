import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import Split from 'react-split';
import './index.css';
import Toast from './components/Toast';
import { SidebarToggle, Sidebar } from './components/Layout.jsx';
import useAppFunctions from './hooks/useAppFunctions.jsx';
import { useState, useEffect } from 'react';
import { FileText, FolderPlus } from 'lucide-react';
import ActionButtons from './components/ActionButtons';
import { Moon, Sun } from 'lucide-react';
import TitleBar from './components/TitleBar';

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

  // Template state
  const [templatePath, setTemplatePath] = useState(null);
  const [templatePreview, setTemplatePreview] = useState(null);
  const [splitSizes, setSplitSizes] = useState([40, 60]);
  const [menuHandler, setMenuHandler] = useState(null);
  const [activeMenuHandler, setActiveMenuHandler] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() =>
    localStorage.getItem('darkMode') === 'true'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);


  const handleMenuAction = async (type) => {
    await invoke('debug_log', { message: `Action button clicked with type: ${type}` });
    await invoke('debug_log', { message: `Active handler exists: ${!!activeMenuHandler}` });

    if (activeMenuHandler) {
      activeMenuHandler(type);
    }
  };

  const handleTemplateSelect = async () => {
    try {
      const selected = await open({
        filters: [{
          name: 'Template',
          extensions: ['json']
        }]
      });

      if (selected) {
        setTemplatePath(selected);
        const template = await invoke('read_template', { path: selected });
        setTemplatePreview(template);
      }
    } catch (err) {
      console.error('Failed to select template:', err);
      actions.setToastMessage('Failed to load template file');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      <TitleBar isDarkMode={isDarkMode} />

      {/* Header Bar */}
      {/* <div className="titlebar bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 transition-colors"> */}
      <div className="pt-8 flex-1 flex flex-col">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Project Maker</h1>
          </div>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isDarkMode ?
              <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" /> :
              <Moon className="w-5 h-5 text-gray-500" />
            }
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => actions.setToastMessage('')}
          type={toastMessage.includes('Error') ? 'error' : 'success'}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Split
          sizes={splitSizes} //%'s of the container ex 40% left, 60% right
          minSize={[300, 400]}  // Minimum sizes for each panel
          maxSize={[500, Infinity]}  // Maximum sizes - allows right panel to grow
          expandToMin={false}
          gutterSize={8}
          snapOffset={30}
          dragInterval={1}
          className="split flex h-full "
          style={{ display: 'flex' }}
          onDragEnd={(sizes) => setSplitSizes(sizes)} // Save sizes when drag ends
        >
          {/* Settings Panel */}
          <div className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">

            <div className="p-4 space-y-6">
              {/* Base Path */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-200">
                  Base Path
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., C:/Projects/"
                    value={basePath}
                    onChange={(e) => actions.setBasePath(e.target.value)}
                    // className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900"
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                  <button
                    onClick={actions.handleBasePathSelect}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
                  >
                    Browse
                  </button>
                </div>
              </div>

              {/* Artist Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-200">
                  Artist Code
                </label>
                <input
                  type="text"
                  placeholder="e.g., NDH"
                  value={artistRef}
                  onChange={actions.handleArtistRefChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                  maxLength={3}
                />
                {validationErrors.artistRef && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.artistRef}</p>
                )}
              </div>

              {/* Project Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-200">
                  Project Code
                </label>
                <input
                  type="text"
                  placeholder="e.g., CPS"
                  value={projectRef}
                  onChange={actions.handleProjectRefChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                  maxLength={3}
                />
                {validationErrors.projectRef && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.projectRef}</p>
                )}
              </div>

              {/* Template Selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Project Template
                  </label>
                  <button
                    onClick={handleTemplateSelect}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 
    transition-colors duration-150 flex items-center gap-1"
                  >
                    <FileText className="w-4 h-4" /> Browse Template
                  </button>
                </div>

                {templatePreview ? (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md 
                  border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-700 hover:text-red-700 dark:text-gray-200 dark:text-red-400 dark:hover:text-red-300">
                        {templatePreview.name}
                      </h4>
                      <button
                        onClick={() => {
                          setTemplatePath(null);
                          setTemplatePreview(null);
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Clear
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 dark:text-gray-400">{templatePreview.description}</p>
                    <div className="text-xs text-gray-600">
                      <strong>Directories:</strong>
                      <pre className="mt-1 overflow-auto max-h-32 bg-white p-2 rounded border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                        {templatePreview.directories.join('\n')}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md border border-gray-200 dark:bg-gray-900/50 dark:border-gray-700 dark:text-gray-400">
                    No template selected (optional)
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <button
                  onClick={() => actions.handleCreateProject(templatePath)}
                  disabled={isLoading || !projectRef || !artistRef || !basePath}
                  className={`w-full py-2 px-4 rounded-md text-white font-medium ${isLoading || !projectRef || !artistRef || !basePath
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  {isLoading ? 'Creating...' : 'Create Project Structure'}
                </button>

                {/* Add a divider when buttons are visible */}
                {state.selectedFolder && (
                  <>
                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 py-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                          Quick Actions
                        </span>
                      </div>
                    </div>

                    <ActionButtons
                      selectedFolder={state.selectedFolder}
                      onAction={handleMenuAction}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Directory View */}
          <div className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">

            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 dark:text-gray-200">Directory Structure</h2>

              <div className="mb-4">
                <p className="text-sm text-gray-500 break-all font-mono">
                  {basePath}
                </p>
              </div>

              <Sidebar
                showSidebar={true}
                directoryStructure={directoryStructure}
                expandedNodes={expandedNodes}
                onToggleNode={actions.toggleNode}
                onRefresh={actions.refreshAfterAction}
                basePath={basePath}
                setToastMessage={actions.setToastMessage}  // Add this prop
                selectedFolder={state.selectedFolder}
                setSelectedFolder={actions.setSelectedFolder}
                setMenuHandler={setActiveMenuHandler}
              />

            </div>
          </div>
        </Split>
      </div>
    </div>
  </div>
  );
}

export default App;
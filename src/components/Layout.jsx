import { ChevronLeft, ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './Dialog';
import ContextMenu from './ContextMenu';

// Sidebar toggle button component
const SidebarToggle = ({ showSidebar, onToggle }) => (
  <button
    onClick={onToggle}
    className="fixed right-4 bottom-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-all duration-200"
  >
    {showSidebar ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
  </button>
);

// DirectoryTree component
// Update only the DirectoryTree component in Layout.jsx
const DirectoryTree = ({ node, path = '', onToggle, expandedNodes, onRefresh, setToastMessage, basePath, selectedFolder, setSelectedFolder, setMenuHandler, isDarkMode }) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(null); // 'create', 'rename', 'delete'
  const [newFolderType, setNewFolderType] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleMenuSelect = useCallback(async (type) => {
    await invoke('debug_log', { message: `Menu select called with type: ${type}` });

    if (type === 'rename') {
      setDialogMode('rename');
      setNewFolderName(node.name);
      setIsDialogOpen(true);
    } else if (type === 'delete') {
      setDialogMode('delete');
      setIsDialogOpen(true);
    } else {
      setDialogMode('create');
      setNewFolderType(type);
      setNewFolderName('');
      setIsDialogOpen(true);
    }
    setContextMenu(null);
  }, [node]);

  const handleRename = async () => {
    try {
      setIsLoading(true);
      await invoke('rename_folder', {
        oldPath: getAbsolutePath(),
        newName: newFolderName
      });
      setToastMessage(`Successfully renamed folder to ${newFolderName}`);
      await onRefresh();
    } catch (error) {
      setToastMessage(`Error: Failed to rename folder - ${error}`);
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await invoke('delete_folder', {
        path: getAbsolutePath()
      });
      setToastMessage('Successfully deleted folder');
      await onRefresh();
    } catch (error) {
      setToastMessage(`Error: Failed to delete folder - ${error}`);
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  // Move these up before the hooks
  const fullPath = path ? `${path}/${node.name}` : node.name;
  const isProjectFolder = /^[A-Z]{3}_[A-Z]{3}$/.test(node.name);

  const getAbsolutePath = () => {
    return basePath ? `${basePath}/${fullPath}` : fullPath;
  };

  useEffect(() => {
    const logPaths = async () => {
      await invoke('debug_log', { message: `Comparing nodePath: ${fullPath} with selectedFolder: ${selectedFolder}` });

      if (node && isProjectFolder && fullPath === selectedFolder) {
        await invoke('debug_log', { message: `Setting menu handler for ${fullPath}` });
        setMenuHandler(() => handleMenuSelect);
      }
    };

    logPaths();
  }, [node, selectedFolder, isProjectFolder, handleMenuSelect, setMenuHandler, fullPath]);

  if (!node) return null;

  const isExpanded = expandedNodes.has(fullPath);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedFolder === fullPath;

  const handleContextMenu = async (e) => {
    // Stop the event from bubbling up to parent directories
    e.stopPropagation();
    e.preventDefault();

    // Check if we clicked directly on this directory item
    const directoryItem = e.currentTarget.closest('.directory-item');
    if (!directoryItem || !directoryItem.contains(e.target)) {
      return;
    }

    const absolutePath = getAbsolutePath();
    await invoke('debug_log', { message: `Context menu triggered for: ${absolutePath}` });

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      path: absolutePath,
      isProjectFolder: isProjectFolder
    });
  };


  // In the DirectoryTree component:
  const createFolders = async () => {
    try {
      setIsLoading(true);
      const projectPath = node.path.replace(/\\/g, '/').replace(/\/$/, '');
      const projectFolderName = node.name; // This will be your ABC_XYZ format


      // Define complete folder structures for each type
      const getFolderStructure = (type, name) => {
        const folderName = name;
        switch (type) {
          case 'asset':
            return [
              // Maya folders
              `maya/assets/${folderName}`,
              `maya/cache/${folderName}/alembic`,
              `maya/cache/${folderName}/fbx`,
              `maya/cache/${folderName}/nCache`,
              `maya/cache/${folderName}/obj`,
              `maya/cache/${folderName}/particles`,
              `maya/data/${folderName}/atom`,
              `maya/data/${folderName}/skinCluster`,
              `maya/images/${folderName}`,
              `maya/scripts/${folderName}`,
              `maya/sourceImages/${folderName}/substance`,
              `maya/sourceImages/${folderName}/zbrush`,

              // Houdini folders
              `houdini/${folderName}/abc`,
              `houdini/${folderName}/audio`,
              `houdini/${folderName}/comp`,
              `houdini/${folderName}/desk`,
              `houdini/${folderName}/flip`,
              `houdini/${folderName}/geo/fbx`,
              `houdini/${folderName}/geo/obj`,
              `houdini/${folderName}/hda`,
              `houdini/${folderName}/otls`,
              `houdini/${folderName}/render`,
              `houdini/${folderName}/scripts`,
              `houdini/${folderName}/sim`,
              `houdini/${folderName}/tex`,
              `houdini/${folderName}/video`,

              // Nuke folders
              `nuke/${folderName}/renders`,
              `nuke/${folderName}/scripts`
            ];
          case 'rnd':
            return [
              // Maya folders
              `maya/cache/${folderName}/alembic`,
              `maya/cache/${folderName}/fbx`,
              `maya/cache/${folderName}/nCache`,
              `maya/cache/${folderName}/obj`,
              `maya/cache/${folderName}/particles`,
              `maya/data/${folderName}/atom`,
              `maya/data/${folderName}/skinCluster`,
              `maya/images/${folderName}`,
              `maya/scenes/${folderName}`,
              `maya/scripts/${folderName}`,
              `maya/sourceImages/${folderName}/substance`,
              `maya/sourceImages/${folderName}/zbrush`,

              // Houdini folders
              `houdini/${folderName}/abc`,
              `houdini/${folderName}/audio`,
              `houdini/${folderName}/comp`,
              `houdini/${folderName}/desk`,
              `houdini/${folderName}/flip`,
              `houdini/${folderName}/geo/fbx`,
              `houdini/${folderName}/geo/obj`,
              `houdini/${folderName}/hda`,
              `houdini/${folderName}/otls`,
              `houdini/${folderName}/render`,
              `houdini/${folderName}/scripts`,
              `houdini/${folderName}/sim`,
              `houdini/${folderName}/tex`,
              `houdini/${folderName}/video`,

              // Nuke folders
              `nuke/${folderName}/renders`,
              `nuke/${folderName}/scripts`
            ];
          case 'shot':
            return [
              // Maya folders
              `maya/cache/${folderName}/alembic`,
              `maya/cache/${folderName}/fbx`,
              `maya/cache/${folderName}/nCache`,
              `maya/cache/${folderName}/obj`,
              `maya/cache/${folderName}/particles`,
              `maya/data/${folderName}/atom`,
              `maya/data/${folderName}/skinCluster`,
              `maya/images/${folderName}`,
              `maya/scenes/${folderName}`,
              `maya/scripts/${folderName}`,

              // Houdini folders
              `houdini/${folderName}/abc`,
              `houdini/${folderName}/audio`,
              `houdini/${folderName}/comp`,
              `houdini/${folderName}/desk`,
              `houdini/${folderName}/flip`,
              `houdini/${folderName}/geo/fbx`,
              `houdini/${folderName}/geo/obj`,
              `houdini/${folderName}/hda`,
              `houdini/${folderName}/otls`,
              `houdini/${folderName}/render`,
              `houdini/${folderName}/scripts`,
              `houdini/${folderName}/sim`,
              `houdini/${folderName}/tex`,
              `houdini/${folderName}/video`,

              // Nuke folders
              `nuke/${folderName}/renders`,
              `nuke/${folderName}/scripts`
            ];
          default:
            return [];
        }
      };

      const foldersToCreate = getFolderStructure(newFolderType, newFolderName);

      // Create each folder
      for (const folder of foldersToCreate) {
        // Normalize the path joining
        const fullFolderPath = `${projectPath}/${folder}`
          .replace(/\\/g, '/')  // Convert backslashes to forward slashes
          .replace(/\/+/g, '/'); // Remove any double slashes

        try {
          await invoke('debug_log', {
            message: `Creating folder: ${fullFolderPath}`
          });

          await invoke('create_folder', {
            path: fullFolderPath,
            createParents: true
          });
        } catch (error) {
          await invoke('debug_log', {
            message: `Error creating folder ${fullFolderPath}: ${error}`
          });
        }
      }

      const successMessages = {
        'asset': `Asset "${newFolderName}" created in ${projectFolderName}`,
        'rnd': `R&D "${newFolderName}" created in ${projectFolderName}`,
        'shot': `Shot "${newFolderName}" created in ${projectFolderName}`
      };


      if (onRefresh) {
        await onRefresh();
      }
      setIsDialogOpen(false);
      setToastMessage(successMessages[newFolderType]);
    } catch (error) {
      console.error('Error in createFolders:', error);
      setToastMessage(`Error: Failed to create ${newFolderType}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && newFolderName && !isLoading) {
      createFolders();
    }
    if (e.key === 'Escape') {
      setIsDialogOpen(false);
    }
  };

  const handleClick = async (e) => {
    if (hasChildren) {
      onToggle(fullPath);
    }
    if (isProjectFolder) {
      await invoke('debug_log', { message: `Selected folder: ${fullPath}` });
      setSelectedFolder(fullPath);
    }
  };

  return (
    <div className="directory-tree dark:bg-gray-800 dark:border-gray-700" onContextMenu={handleContextMenu}>
      {node.name && (
        <div
          className={`directory-item px-2 py-1 rounded cursor-pointer flex items-center gap-1.5 transition-colors
          ${isSelected ?
              'bg-blue-100 dark:bg-emerald-900/20 dark:border-l-2 hover:bg-blue-200 dark:hover:bg-emerald-800/40 dark:border-emerald-600' :
              'hover:bg-gray-100 dark:hover:bg-gray-700/50'
            }`}
          onClick={handleClick}
          onContextMenu={handleContextMenu} // Move context menu handler here

        >
          <span className="directory-icon flex items-center justify-center w-4 h-4 text-gray-400 dark:text-gray-500">
            {hasChildren && (
              isExpanded ?
                <ChevronDown size={16} className="shrink-0" /> :
                <ChevronRight size={16} className="shrink-0" />
            )}
          </span>

          <span className="directory-icon flex items-center">
            {isExpanded ?
              <FolderOpen
                size={16}
                className="shrink-0"
                stroke={isDarkMode ? "#eab308" : "#e4b650"}  // Dark: Yellow-500
                strokeWidth={2}
                fill={isDarkMode ? "#ca8a04" : "#f6cc57"}    // Dark: Yellow-600
              /> :
              <Folder
                size={16}
                className="shrink-0"
                stroke={isDarkMode ? "#eab308" : "#e4b650"}  // Dark: Yellow-500
                strokeWidth={2}
                fill={isDarkMode ? "#ca8a04" : "#f6cc57"}    // Dark: Yellow-600
              />
            }
          </span>

          <span className="directory-name truncate text-sm text-gray-700 dark:text-gray-200">
            {node.name}
          </span>
        </div>
      )}

      {(isExpanded || !path) && hasChildren && (
        <div className="ml-4">
          {node.children
            .sort((a, b) => {
              if (a.children?.length && !b.children?.length) return -1;
              if (!a.children?.length && b.children?.length) return 1;
              return a.name.localeCompare(b.name);
            })
            .map((child, index) => (
              <DirectoryTree
                key={`${fullPath}-${child.name}-${index}`}
                node={child}
                path={fullPath}
                onToggle={onToggle}
                expandedNodes={expandedNodes}
                onRefresh={onRefresh}
                setToastMessage={setToastMessage}
                selectedFolder={selectedFolder}
                setSelectedFolder={setSelectedFolder}
                setMenuHandler={setMenuHandler}
                basePath={basePath}
                isDarkMode={isDarkMode}  // Make sure this is being passed
              />
            ))}
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          path={contextMenu.path}
          isProjectFolder={contextMenu.isProjectFolder}
          onClose={() => setContextMenu(null)}
          onSelect={handleMenuSelect}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'rename' ? 'Rename Folder' :
                dialogMode === 'delete' ? 'Delete Folder' :
                  `Add ${newFolderType === 'asset' ? 'Asset' : newFolderType === 'rnd' ? 'R&D' : 'Shot'}`}
            </DialogTitle>
          </DialogHeader>

          {dialogMode === 'delete' ? (
            <div className="py-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleDelete();
                } else if (e.key === 'Escape') {
                  setIsDialogOpen(false);
                }
              }}
              tabIndex={0} // Make div focusable
            >
              <p className="text-red-600 dark:text-red-400">
                Are you sure you want to delete this folder and ALL its file contents?
                This action cannot be undone!
              </p>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Note: This will delete all related folders in maya, houdini, nuke, and other project directories.
              </p>
            </div>
          ) : (
            <div className="py-4">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newFolderName) {
                    if (dialogMode === 'rename') {
                      handleRename();
                    } else {
                      createFolders();
                    }
                  } else if (e.key === 'Escape') {
                    setIsDialogOpen(false);
                  }
                }}
                placeholder={dialogMode === 'rename' ? 'New name' :
                  `Enter ${newFolderType === 'asset' ? 'asset' : newFolderType === 'rnd' ? 'R&D' : 'shot'} name`}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-gray-400"
                autoFocus
              />
            </div>
          )}

          <DialogFooter>
            <button
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-gray-400" 
            >
              Cancel
            </button>
            <button
              onClick={dialogMode === 'rename' ? handleRename :
                dialogMode === 'delete' ? handleDelete :
                  createFolders}
              disabled={(!newFolderName && dialogMode !== 'delete') || isLoading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md
                ${dialogMode === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700 dark:hover:bg-emerald-800/40 dark:border-emerald-600 dark:bg-emerald-600/40'} 
                ${(!newFolderName && dialogMode !== 'delete') || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Processing...' :
                dialogMode === 'rename' ? 'Rename' :
                  dialogMode === 'delete' ? 'Delete' : 'Create'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


// Sidebar component
const Sidebar = ({ showSidebar, directoryStructure, expandedNodes, onToggleNode, onRefresh, setToastMessage, basePath, selectedFolder,
  setSelectedFolder, onMenuSelect, setMenuHandler, isDarkMode }) => {
  if (!showSidebar) return null;

  return (
    <div className="bg-white dark:bg-gray-800 dark:border-gray-700 border-l border-gray-200 overflow-y-auto">

      <div className="p-4 dark:bg-gray-800 dark:border-gray-700">
        {directoryStructure && (
          <DirectoryTree
            node={directoryStructure}
            onToggle={onToggleNode}
            expandedNodes={expandedNodes}
            onRefresh={onRefresh}
            basePath={basePath}  // Pass basePath to DirectoryTree
            setToastMessage={setToastMessage}  // Add this prop
            selectedFolder={selectedFolder}
            setSelectedFolder={setSelectedFolder}
            onMenuSelect={onMenuSelect}
            setMenuHandler={setMenuHandler}  // Pass this through
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  );
};

// Export components
export { SidebarToggle, Sidebar, DirectoryTree };
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
const DirectoryTree = ({ node, path = '', onToggle, expandedNodes, onRefresh, setToastMessage, basePath, selectedFolder, setSelectedFolder, setMenuHandler }) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFolderType, setNewFolderType] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleMenuSelect = useCallback((type) => {
    invoke('debug_log', { message: `Menu select called with type: ${type}` });
    setNewFolderType(type);
    setNewFolderName('');
    setIsDialogOpen(true);
    setContextMenu(null);
  }, []);

  // Move these up before the hooks
  const fullPath = path ? `${path}/${node.name}` : node.name;
  const isProjectFolder = /^[A-Z]{3}_[A-Z]{3}$/.test(node.name);

  useEffect(() => {
    // Get the full node path for comparison
    const nodePath = path ? `${path}/${node.name}` : node.name;

    invoke('debug_log', { message: `Comparing nodePath: ${nodePath} with selectedFolder: ${selectedFolder}` });

    if (node && isProjectFolder && nodePath === selectedFolder) {
      invoke('debug_log', { message: `Setting menu handler for ${nodePath}` });
      setMenuHandler(() => handleMenuSelect);
    }
  }, [node, selectedFolder, isProjectFolder, handleMenuSelect, setMenuHandler, path]);

  if (!node) return null;

  const isExpanded = expandedNodes.has(fullPath);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedFolder === fullPath;



  const handleContextMenu = (e) => {
    e.preventDefault();
    if (isProjectFolder) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        path: fullPath
      });
    }
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
    <div className="directory-tree" onContextMenu={handleContextMenu}>
      {node.name && (
        <div
          className={`directory-item px-2 py-1 rounded cursor-pointer flex items-center gap-1.5 transition-colors ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-100'
            }`}
          onClick={handleClick}
        >
          <span className="directory-icon flex items-center justify-center w-4 h-4 text-gray-400">
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
                stroke="#e4b650"  // Slightly darker border
                strokeWidth={2}
                fill="#f6cc57"    // Warm folder color
              /> :
              <Folder
                size={16}
                className="shrink-0"
                stroke="#e4b650"
                strokeWidth={2}
                fill="#f6cc57"
              />
            }
          </span>

          <span className="directory-name truncate text-sm text-gray-700">
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
                selectedFolder={selectedFolder}      // Add this
                setSelectedFolder={setSelectedFolder}// Add this
                setMenuHandler={setMenuHandler}      // Add this
                basePath={basePath}
              />
            ))}
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onSelect={handleMenuSelect}
          isProjectFolder={isProjectFolder}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add {newFolderType === 'asset' ? 'Asset' : newFolderType === 'rnd' ? 'R&D' : 'Shot'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Enter ${newFolderType === 'asset' ? 'asset' : newFolderType === 'rnd' ? 'R&D' : 'shot'} name`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <DialogFooter>
            <button
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={createFolders}
              disabled={!newFolderName || isLoading}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${(!newFolderName || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


// Sidebar component
const Sidebar = ({ showSidebar, directoryStructure, expandedNodes, onToggleNode, onRefresh, setToastMessage, basePath, selectedFolder,
  setSelectedFolder, onMenuSelect, setMenuHandler }) => {
  if (!showSidebar) return null;

  return (
    <div className="bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4">
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

          />
        )}
      </div>
    </div>
  );
};

// Export components
export { SidebarToggle, Sidebar, DirectoryTree };
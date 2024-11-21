import { ChevronLeft, ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import React, { useState } from 'react';
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
const DirectoryTree = ({ node, path = '', onToggle, expandedNodes, onRefresh, basePath }) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFolderType, setNewFolderType] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!node) return null;

  const fullPath = path ? `${path}/${node.name}` : node.name;
  const isExpanded = expandedNodes.has(fullPath);
  const hasChildren = node.children && node.children.length > 0;
  const isProjectFolder = /^[A-Z]{3}_[A-Z]{3}$/.test(node.name);


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

  const handleMenuSelect = (type) => {
    setNewFolderType(type);
    setNewFolderName('');
    setIsDialogOpen(true);
    setContextMenu(null);
  };

  // In the DirectoryTree component:
  const createFolders = async () => {
    try {
      setIsLoading(true);
      const projectPath = node.path.replace(/\\/g, '/').replace(/\/$/, '');

      // Define complete folder structures for each type
      const getFolderStructure = (type, name) => {
        const upperName = name.toUpperCase();
        switch (type) {
          case 'asset':
            return [
              // Maya folders
              `maya/assets/${upperName}`,
              `maya/cache/${upperName}/alembic`,
              `maya/cache/${upperName}/fbx`,
              `maya/cache/${upperName}/nCache`,
              `maya/cache/${upperName}/obj`,
              `maya/cache/${upperName}/particles`,
              `maya/data/${upperName}/atom`,
              `maya/data/${upperName}/skinCluster`,
              `maya/images/${upperName}`,
              `maya/scripts/${upperName}`,
              `maya/sourceImages/${upperName}/substance`,
              `maya/sourceImages/${upperName}/zbrush`,

              // Houdini folders
              `houdini/${upperName}/abc`,
              `houdini/${upperName}/audio`,
              `houdini/${upperName}/comp`,
              `houdini/${upperName}/desk`,
              `houdini/${upperName}/flip`,
              `houdini/${upperName}/geo/fbx`,
              `houdini/${upperName}/geo/obj`,
              `houdini/${upperName}/hda`,
              `houdini/${upperName}/otls`,
              `houdini/${upperName}/render`,
              `houdini/${upperName}/scripts`,
              `houdini/${upperName}/sim`,
              `houdini/${upperName}/tex`,
              `houdini/${upperName}/video`,

              // Nuke folders
              `nuke/${upperName}/renders`,
              `nuke/${upperName}/scripts`
            ];
          case 'rnd':
            return [
              // Maya folders
              `maya/cache/${upperName}/alembic`,
              `maya/cache/${upperName}/fbx`,
              `maya/cache/${upperName}/nCache`,
              `maya/cache/${upperName}/obj`,
              `maya/cache/${upperName}/particles`,
              `maya/data/${upperName}/atom`,
              `maya/data/${upperName}/skinCluster`,
              `maya/images/${upperName}`,
              `maya/scenes/${upperName}`,
              `maya/scripts/${upperName}`,
              `maya/sourceImages/${upperName}/substance`,
              `maya/sourceImages/${upperName}/zbrush`,

              // Houdini folders
              `houdini/${upperName}/abc`,
              `houdini/${upperName}/audio`,
              `houdini/${upperName}/comp`,
              `houdini/${upperName}/desk`,
              `houdini/${upperName}/flip`,
              `houdini/${upperName}/geo/fbx`,
              `houdini/${upperName}/geo/obj`,
              `houdini/${upperName}/hda`,
              `houdini/${upperName}/otls`,
              `houdini/${upperName}/render`,
              `houdini/${upperName}/scripts`,
              `houdini/${upperName}/sim`,
              `houdini/${upperName}/tex`,
              `houdini/${upperName}/video`,

              // Nuke folders
              `nuke/${upperName}/renders`,
              `nuke/${upperName}/scripts`
            ];
          case 'shot':
            return [
              // Maya folders
              `maya/cache/${upperName}/alembic`,
              `maya/cache/${upperName}/fbx`,
              `maya/cache/${upperName}/nCache`,
              `maya/cache/${upperName}/obj`,
              `maya/cache/${upperName}/particles`,
              `maya/data/${upperName}/atom`,
              `maya/data/${upperName}/skinCluster`,
              `maya/images/${upperName}`,
              `maya/scenes/${upperName}`,
              `maya/scripts/${upperName}`,

              // Houdini folders
              `houdini/${upperName}/abc`,
              `houdini/${upperName}/audio`,
              `houdini/${upperName}/comp`,
              `houdini/${upperName}/desk`,
              `houdini/${upperName}/flip`,
              `houdini/${upperName}/geo/fbx`,
              `houdini/${upperName}/geo/obj`,
              `houdini/${upperName}/hda`,
              `houdini/${upperName}/otls`,
              `houdini/${upperName}/render`,
              `houdini/${upperName}/scripts`,
              `houdini/${upperName}/sim`,
              `houdini/${upperName}/tex`,
              `houdini/${upperName}/video`,

              // Nuke folders
              `nuke/${upperName}/renders`,
              `nuke/${upperName}/scripts`
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

      setIsDialogOpen(false);
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Error in createFolders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && newFolderName && !isLoading) {
      createFolders();
    }
  };

  return (
    <div className="directory-tree" onContextMenu={handleContextMenu}>
      {node.name && (
        <div
          className="directory-item px-2 py-1 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-1.5"
          onClick={() => hasChildren && onToggle(fullPath)}
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
              placeholder={`Enter ${newFolderType} name`}
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
const Sidebar = ({ showSidebar, directoryStructure, expandedNodes, onToggleNode, onRefresh, basePath }) => {
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
          />
        )}
      </div>
    </div>
  );
};

// Export components
export { SidebarToggle, Sidebar, DirectoryTree };
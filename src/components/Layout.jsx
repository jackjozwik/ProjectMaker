import { ChevronRight, ChevronLeft } from 'lucide-react';
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
        
        // Get the full path from the node's path property
        const projectPath = node.path;
        
        await invoke('debug_log', { 
            message: `Creating folders with full project path: ${projectPath}`
        });
        
        const baseFolders = ['maya/images', 'houdini'];
        
        for (const baseFolder of baseFolders) {
            const fullFolderPath = `${projectPath}/${baseFolder}/${newFolderName.toUpperCase()}`;
            
            try {
                await invoke('create_folder', {
                    path: fullFolderPath,
                    createParents: true
                });
            } catch (error) {
                console.error(`Error creating folder: ${error}`);
            }
        }

        setIsDialogOpen(false);
        if (onRefresh) {
            await onRefresh(); // This will trigger refreshAfterAction
        }
    } catch (error) {
        console.error('Error in createFolders:', error);
    } finally {
        setIsLoading(false);
    }
};

  return (
    <div className="directory-tree" onContextMenu={handleContextMenu}>
      {node.name && (
        <div
          className="directory-item px-2 py-1 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-1"
          onClick={() => hasChildren && onToggle(fullPath)}
        >
          <span className="directory-icon w-4 text-center">
            {hasChildren ? (isExpanded ? '▼' : '▶') : ''}
          </span>

          <span className="directory-icon">
            {hasChildren ? '📁' : '📄'}
          </span>

          <span className="directory-name truncate">
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
              placeholder={`Enter ${newFolderType} name`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
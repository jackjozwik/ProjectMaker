import { ChevronRight, ChevronLeft } from 'lucide-react';

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
const DirectoryTree = ({ node, path = '', onToggle, expandedNodes }) => {
  if (!node) return null;
  
  const fullPath = path ? `${path}/${node.name}` : node.name;
  const isExpanded = expandedNodes.has(fullPath);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="directory-tree">
      {/* Only render if it's not the root node OR if it has a name */}
      {node.name && (
        <div 
          className="directory-item px-2 py-1 hover:bg-gray-100 rounded cursor-pointer flex items-center gap-1"
          onClick={() => hasChildren && onToggle(fullPath)}
        >
          {/* Expand/Collapse Icon - only show for directories with children */}
          <span className="directory-icon w-4 text-center">
            {hasChildren ? (isExpanded ? '▼' : '▶') : ''}
          </span>

          {/* File/Directory Icon */}
          <span className="directory-icon">
            {hasChildren ? '📁' : '📁'}
          </span>

          {/* File/Directory Name */}
          <span className="directory-name truncate">
            {node.name}
          </span>
        </div>
      )}
      
      {/* Children - only render if expanded or if it's the root node */}
      {(isExpanded || !path) && hasChildren && (
        <div className="ml-4">
          {node.children
            .sort((a, b) => {
              // Directories first, then alphabetical
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
              />
            ))}
        </div>
      )}
    </div>
  );
};


// Sidebar component
const Sidebar = ({ showSidebar, directoryStructure, expandedNodes, onToggleNode }) => {
  if (!showSidebar) return null;

  return (
    <div className="bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Directory Structure</h2>
        {directoryStructure && (
          <DirectoryTree
            node={directoryStructure}
            onToggle={onToggleNode}
            expandedNodes={expandedNodes}
          />
        )}
      </div>
    </div>
  );
};

// Export components
export { SidebarToggle, Sidebar, DirectoryTree };
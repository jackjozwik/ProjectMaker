import React, { useEffect, useRef } from 'react';
import { Plus, Copy, Folder } from 'lucide-react';
import { invoke } from '@tauri-apps/api/tauri';

// MODIFIED:
// - Fixed path handling for menu actions
// - Simplified event handling
// - Added better debugging

const ContextMenu = ({ x, y, onClose, onSelect, isProjectFolder, path }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Check if menu overflows bottom
      if (rect.bottom > viewportHeight) {
        const newY = Math.max(0, viewportHeight - rect.height);
        menu.style.top = `${newY}px`;
      }

      // Check if menu overflows right
      if (rect.right > viewportWidth) {
        const newX = Math.max(0, viewportWidth - rect.width);
        menu.style.left = `${newX}px`;
      }
    }
  }, [x, y]);

  const handleCopyPath = async () => {
    try {
      // Store path in a const to ensure it doesn't change
      const pathToCopy = path;
      await invoke('debug_log', { message: `Menu action - path before copy: ${pathToCopy}` });
      await invoke('copy_to_clipboard', { text: pathToCopy });
      onClose();
    } catch (error) {
      console.error('Failed to copy path:', error);
    }
  };

  const handleOpenInExplorer = async () => {
    try {
      const pathToOpen = path;
      await invoke('debug_log', { message: `Open in Explorer - Using path: ${pathToOpen}` });
      await invoke('open_in_explorer', { path: pathToOpen });
      onClose();
    } catch (error) {
      console.error('Failed to open explorer:', error);
    }
  };

  const menuItems = [
    ...(isProjectFolder ? [
      { id: 'asset', label: 'Add Asset', icon: Plus },
      { id: 'rnd', label: 'Add R&D', icon: Plus },
      { id: 'shot', label: 'Add Shot', icon: Plus },
      { type: 'separator' },
    ] : []),
    { id: 'copy', label: 'Copy Path', icon: Copy, onClick: handleCopyPath },
    { id: 'explore', label: 'Open in Explorer', icon: Folder, onClick: handleOpenInExplorer },
  ];

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${y}px`,
        left: `${x}px`,
        zIndex: 50
      }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg 
        border border-gray-200 dark:border-gray-700 py-1 min-w-[180px]"
    >
      {menuItems.map((item, index) => {
        if (item.type === 'separator') {
          return (
            <div 
              key={`sep-${index}`}
              className="my-1 border-t border-gray-200 dark:border-gray-700" 
            />
          );
        }

        return (
          <button
            key={item.id}
            onClick={async () => {
              await invoke('debug_log', { message: `Menu item clicked: ${item.label}` });
              if (item.onClick) {
                await item.onClick();
              } else {
                onSelect(item.id);
              }
            }}
            className="w-full px-4 py-2 text-left text-sm 
              text-gray-700 dark:text-gray-200 
              hover:bg-gray-100 dark:hover:bg-gray-700 
              flex items-center gap-2 transition-colors"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
};


export default ContextMenu;
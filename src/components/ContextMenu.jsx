import React, { useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';

const ContextMenu = ({ x, y, onClose, onSelect, isProjectFolder }) => {
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

  if (!isProjectFolder) return null;

  const menuItems = [
    { id: 'asset', label: 'Add Asset', icon: Plus },
    { id: 'rnd', label: 'Add R&D', icon: Plus },
    { id: 'shot', label: 'Add Shot', icon: Plus }
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
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[160px]"
    >
      {menuItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 
            hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2
            transition-colors duration-150"
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
};

export default ContextMenu;
import React from 'react';
import { Plus } from 'lucide-react';

const ActionButtons = ({ selectedFolder, onAction }) => {
  // Only show for valid project folders
  if (!selectedFolder || !/[A-Z]{3}_[A-Z]{3}$/.test(selectedFolder)) {
    return null;
  }

  const buttons = [
    { type: 'asset', label: '+ Asset' },
    { type: 'rnd', label: '+ R&D' },
    { type: 'shot', label: '+ Shot' }
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {buttons.map(({ type, label }) => (
        <button
          key={type}
          onClick={() => onAction(type)}
          className="px-3 py-2 text-sm font-medium transition-colors
            text-gray-700 dark:text-gray-200 
            bg-gray-100 dark:bg-gray-800 
            hover:bg-gray-200 dark:hover:bg-gray-700
            border border-gray-200 dark:border-gray-700 
            rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-offset-1 
            focus:ring-gray-400 dark:focus:ring-gray-500
            dark:focus:ring-offset-gray-900"
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default ActionButtons;
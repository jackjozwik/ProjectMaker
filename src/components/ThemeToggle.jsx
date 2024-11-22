import React from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ isDarkMode, onChange }) => {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-7 w-14 items-center rounded-full
        transition-colors duration-300 focus:outline-none
        ${isDarkMode ? 'bg-emerald-600' : 'bg-gray-200'}`}
      role="switch"
      aria-checked={isDarkMode}
    >
      {/* Track */}
      <span className="sr-only">Toggle theme</span>
      
      {/* Sliding circle with icon */}
      <span
        className={`${
          isDarkMode ? 'translate-x-7' : 'translate-x-1'
        } inline-block h-5 w-5 transform rounded-full 
        bg-white transition-transform duration-300 
        flex items-center justify-center`}
      >
        {isDarkMode ? (
          <Moon className="h-3 w-3 text-emerald-600" />
        ) : (
          <Sun className="h-3 w-3 text-gray-400" />
        )}
      </span>

      {/* Static icons on the track */}
      <span className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <Sun className={`h-3 w-3 ${isDarkMode ? 'text-emerald-200' : 'text-transparent'}`} />
        <Moon className={`h-3 w-3 ${isDarkMode ? 'text-transparent' : 'text-gray-400'}`} />
      </span>
    </button>
  );
};

export default ThemeToggle;
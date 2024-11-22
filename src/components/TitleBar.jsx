// src/components/TitleBar.jsx
import React from 'react';
import { appWindow } from '@tauri-apps/api/window';
import { Minus, X, Square, SquareStack, Copy } from 'lucide-react';

const TitleBar = ({ isDarkMode }) => {
    const [isMaximized, setIsMaximized] = React.useState(false);

    const handleMaximize = async () => {
        const maximized = await appWindow.isMaximized();
        if (maximized) {
            await appWindow.unmaximize();
            setIsMaximized(false);
        } else {
            await appWindow.maximize();
            setIsMaximized(true);
        }
    };

    return (
        <div
            data-tauri-drag-region
            className={`h-8 flex justify-between items-center fixed top-0 left-0 right-0 
        ${isDarkMode ? 'bg-gray-900' : 'bg-[#f3f3f3]'} 
        select-none z-50`}
        >
            {/* App Title */}
            <div className="flex items-center px-3 py-1">
                {/* Windows-style app icon */}
                <div className={`w-4 h-4 mr-2 rounded-sm 
          ${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'}`}>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Project Maker
                </span>
            </div>

            {/* Window Controls */}
            <div className="flex h-full">
                <button
                    onClick={() => appWindow.minimize()}
                    className={`inline-flex justify-center items-center w-12 h-full
            hover:bg-black/10 dark:hover:bg-white/10 transition-colors`}
                >
                    <Minus
                        size={14}
                        className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                    />
                </button>
                <button
                    onClick={handleMaximize}
                    className={`inline-flex justify-center items-center w-12 h-full
            hover:bg-black/10 dark:hover:bg-white/10 transition-colors`}
                >

                    {isMaximized ? (
                        <Copy
                            size={14}
                            className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                        />

                    ) : (
                        <Square
                            size={14}
                            className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}
                        />
                    )}
                </button>
                <button
                    onClick={() => appWindow.close()}
                    className={`inline-flex justify-center items-center w-12 h-full
            hover:bg-red-600 transition-colors group`}
                >
                    <X
                        size={16}
                        className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}
              group-hover:text-white`}
                    />
                </button>
            </div>
        </div>
    );
};

export default TitleBar;
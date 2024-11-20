import { useState, useEffect, useCallback, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import { readDir } from '@tauri-apps/api/fs';

const useAppFunctions = () => {
  // State declarations
  const [artistRef, setArtistRef] = useState(() => localStorage.getItem('artistRef') || '');
  const [projectRef, setProjectRef] = useState('');
  const [basePath, setBasePath] = useState(() => localStorage.getItem('lastBasePath') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [directoryStructure, setDirectoryStructure] = useState({
    name: 'Project Root',
    children: []
  });
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [isProjectFolder, setIsProjectFolder] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  // Add a debounced refresh timestamp
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const refreshTimeoutRef = useRef(null);

  // Only update the loadDirectoryStructure function in useAppFunctions.jsx
  // Enhanced loadDirectoryStructure with debouncing
  const loadDirectoryStructure = useCallback(async (force = false) => {
    try {
      if (!basePath) return;

      // Skip if last refresh was less than 500ms ago and not forced
      if (!force && Date.now() - lastRefresh < 500) {
        return;
      }

      const structure = await invoke('get_directory_structure', {
        path: basePath
      });

      setDirectoryStructure(structure);
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Failed to load directory structure:', error);
      setToastMessage('Failed to load directory structure');
    }
  }, [basePath, lastRefresh]);


  // Refresh after actions (with debouncing)
  const refreshAfterAction = useCallback(() => {
    // Clear any pending refresh
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Schedule a new refresh
    refreshTimeoutRef.current = setTimeout(() => {
      loadDirectoryStructure(true); // Force refresh
      refreshTimeoutRef.current = null;
    }, 500);
  }, [loadDirectoryStructure]);

  // Validation function
  const validateInputs = useCallback(() => {
    const errors = {};
    if (projectRef.length !== 3) {
      errors.projectRef = 'Project reference must be exactly 3 characters';
    }
    if (artistRef.length !== 3) {
      errors.artistRef = 'Artist reference must be exactly 3 characters';
    }
    return errors;
  }, [projectRef, artistRef]);

  // Project creation
  const createProject = useCallback(async (templatePath = null) => {
    try {
      setIsLoading(true);
      const response = await invoke('create_project_structure', {
        config: {
          project_ref: projectRef.toUpperCase(),
          artist_ref: artistRef.toUpperCase(),
          base_path: basePath,
          template_path: templatePath // Add template path to config
        }
      });
      setToastMessage(response);
      await loadDirectoryStructure();
    } catch (error) {
      setToastMessage(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }, [projectRef, artistRef, basePath]);

  // Update createProject to use refreshAfterAction
  const handleCreateProject = useCallback((templatePath) => {
    const errors = validateInputs();
    if (Object.keys(errors).length === 0) {
      createProject(templatePath).then(() => {
        refreshAfterAction();
      });
    } else {
      setValidationErrors(errors);
    }
  }, [validateInputs, createProject, refreshAfterAction]);

  const handleBasePathSelect = useCallback(async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });
      if (selected) {
        setBasePath(selected);
      }
    } catch (err) {
      console.error('Failed to select directory:', err);
    }
  }, []);

  const toggleNode = useCallback((path) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  //Use Effects
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadDirectoryStructure();
    }, 5000); // 5 second interval

    return () => clearInterval(intervalId);
  }, [loadDirectoryStructure]);

  useEffect(() => {
    if (basePath) {
      loadDirectoryStructure();
    }
  }, [basePath, loadDirectoryStructure]);

  // Save to localStorage
  useEffect(() => {
    if (artistRef) localStorage.setItem('artistRef', artistRef);
  }, [artistRef]);

  useEffect(() => {
    if (basePath) localStorage.setItem('lastBasePath', basePath);
  }, [basePath]);

  return {
    state: {
      artistRef,
      projectRef,
      basePath,
      isLoading,
      validationErrors,
      directoryStructure,
      expandedNodes,
      isProjectFolder,
      showSidebar,
      toastMessage
    },
    actions: {
      setArtistRef,
      setProjectRef,
      setBasePath,
      setIsProjectFolder,
      setShowSidebar,
      setToastMessage,
      handleBasePathSelect,
      handleCreateProject,
      toggleNode,
      refreshDirectoryStructure: () => loadDirectoryStructure(true), // Add this
      refreshAfterAction,  // Add this
    }
  };
};

export default useAppFunctions;
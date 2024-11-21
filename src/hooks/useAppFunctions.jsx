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

  const normalizePath = useCallback((path) => {
    if (!path) return '';
    // Replace backslashes with forward slashes and remove trailing slash
    return path.replace(/\\/g, '/').replace(/\/$/, '');
  }, []);

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
        path: normalizePath(basePath)
      });

      setDirectoryStructure(structure);
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Failed to load directory structure:', error);
      setToastMessage('Failed to load directory structure');
    }
  }, [basePath, lastRefresh, normalizePath]);


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

    // Regex for alphanumeric validation (letters and numbers)
    const alphanumericRegex = /^[A-Z]{3}$/;

    if (!alphanumericRegex.test(projectRef.toUpperCase())) {
      errors.projectRef = 'Project code must be exactly 3 letters (A-Z)';
    }

    if (!alphanumericRegex.test(artistRef.toUpperCase())) {
      errors.artistRef = 'Artist code must be exactly 3 letters (A-Z)';
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

  // Update basePath handling
  const handleBasePathSelect = useCallback(async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });
      if (selected) {
        const normalizedPath = normalizePath(selected);
        setBasePath(normalizedPath);
        localStorage.setItem('lastBasePath', normalizedPath);
      }
    } catch (err) {
      console.error('Failed to select directory:', err);
    }
  }, [normalizePath]);

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

  // Modify the input handlers to enforce uppercase and allow numbers
  const handleArtistRefChange = useCallback((e) => {
    // Allow only letters
    const value = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase();
    if (value.length <= 3) {
      setArtistRef(value);
      if (/^[A-Z]{3}$/.test(value)) {
        setValidationErrors(prev => ({ ...prev, artistRef: undefined }));
      }
    }
  }, []);

  const handleProjectRefChange = useCallback((e) => {
    // Allow only letters
    const value = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase();
    if (value.length <= 3) {
      setProjectRef(value);
      if (/^[A-Z]{3}$/.test(value)) {
        setValidationErrors(prev => ({ ...prev, projectRef: undefined }));
      }
    }
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

  useEffect(() => {
    // Normalize basePath when loading from localStorage
    const storedPath = localStorage.getItem('lastBasePath');
    if (storedPath) {
      setBasePath(normalizePath(storedPath));
    }
  }, [normalizePath]);

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
      refreshDirectoryStructure: () => loadDirectoryStructure(true),
      refreshAfterAction,
      normalizePath,
      handleArtistRefChange,
      handleProjectRefChange
    }
  };
};

export default useAppFunctions;
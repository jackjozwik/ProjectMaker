import { useState, useEffect, useCallback } from 'react';
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
  
  const handleCreateProject = useCallback((templatePath) => {
    const errors = validateInputs();
    if (Object.keys(errors).length === 0) {
      createProject(templatePath);
    } else {
      setValidationErrors(errors);
    }
  }, [validateInputs, createProject]);

  // Only update the loadDirectoryStructure function in useAppFunctions.jsx
  // Update only the loadDirectoryStructure function in useAppFunctions.jsx
  const loadDirectoryStructure = useCallback(async () => {
    try {
      if (!basePath) return;
      
      // Use the new Rust command for directory reading
      const structure = await invoke('get_directory_structure', {
        path: basePath
      });
      
      // Set the structure directly as it's already in the format we want
      setDirectoryStructure(structure);
    } catch (error) {
      console.error('Failed to load directory structure:', error);
      setToastMessage('Failed to load directory structure');
    }
  }, [basePath]);

  // Effects
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
      toggleNode
    }
  };
};

export default useAppFunctions;
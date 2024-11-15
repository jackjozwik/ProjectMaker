import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';

/**
 * Modal dialog for creating/editing templates
 * @param {Object} props
 * @param {Object} props.template - Template object for editing (null for new template)
 * @param {Function} props.onSave - Save handler
 * @param {Function} props.onClose - Close handler
 */
function TemplateEditor({ template, onSave, onClose }) {
  // State management for form fields
  const [name, setName] = useState(template?.name || '');
  const [description, setDescription] = useState(template?.description || '');
  const [directories, setDirectories] = useState(template?.directories || []);
  const [baseFiles, setBaseFiles] = useState(template?.baseFiles || []);

  // Directory management handlers
  const addDirectory = () => {
    setDirectories([...directories, '']);
  };

  const removeDirectory = (index) => {
    setDirectories(directories.filter((_, i) => i !== index));
  };

  const handleDirectoryChange = (index, value) => {
    const newDirectories = [...directories];
    newDirectories[index] = value;
    setDirectories(newDirectories);
  };

  // Base file management handlers
  const addBaseFile = () => {
    setBaseFiles([...baseFiles, { source: '', destination: '' }]);
  };

  const removeBaseFile = (index) => {
    setBaseFiles(baseFiles.filter((_, i) => i !== index));
  };

  const handleBaseFileChange = (index, field, value) => {
    const newBaseFiles = [...baseFiles];
    newBaseFiles[index] = { ...newBaseFiles[index], [field]: value };
    setBaseFiles(newBaseFiles);
  };

  // Save handler
  const handleSave = () => {
    onSave({
      name,
      description,
      directories,
      baseFiles
    });
  };

  return (
    <Dialog open={true} onClose={onClose}>
      <div className="p-6 max-w-3xl">
        {/* Header */}
        <h2 className="text-lg font-semibold mb-4">
          {template ? 'Edit Template' : 'Create New Template'}
        </h2>

        {/* Basic Info Section */}
        <div className="space-y-4 mb-6">
          {/* Template Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          {/* Template Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Directory Structure Editor */}
        <div className="mb-6">
          <h3 className="text-md font-medium mb-2">Directory Structure</h3>
          <div className="space-y-2">
            {directories.map((dir, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={dir}
                  onChange={(e) => handleDirectoryChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={() => removeDirectory(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addDirectory}
              className="text-blue-600 hover:text-blue-800"
            >
              + Add Directory
            </button>
          </div>
        </div>

        {/* Base Files Section */}
        <div className="mb-6">
          <h3 className="text-md font-medium mb-2">Base Files</h3>
          <div className="space-y-2">
            {baseFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={file.source}
                  placeholder="Source path"
                  onChange={(e) => handleBaseFileChange(index, 'source', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  value={file.destination}
                  placeholder="Destination path"
                  onChange={(e) => handleBaseFileChange(index, 'destination', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={() => removeBaseFile(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addBaseFile}
              className="text-blue-600 hover:text-blue-800"
            >
              + Add Base File
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Template
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export default TemplateEditor;
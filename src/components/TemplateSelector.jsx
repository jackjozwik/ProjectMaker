import React from 'react';

/**
 * Template selection component with preview functionality
 * @param {Object} props
 * @param {string} props.selectedTemplate - Currently selected template id
 * @param {Function} props.onTemplateChange - Handler for template selection change
 * @param {Function} props.onManageTemplates - Handler to open template management
 */
function TemplateSelector({ selectedTemplate, onTemplateChange, onManageTemplates }) {
  return (
    <div className="space-y-4">
      {/* Template Selection Header */}
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Project Template
        </label>
        {/* Management Button */}
        <button
          onClick={onManageTemplates}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Manage Templates
        </button>
      </div>
      
      {/* Template Dropdown */}
      <select
        value={selectedTemplate}
        onChange={(e) => onTemplateChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      >
        <option value="default">Default VFX Template</option>
        <option value="custom1">Custom Template 1</option>
        <option value="custom2">Custom Template 2</option>
      </select>
      
      {/* Directory Structure Preview */}
      <div className="mt-2 p-3 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Template Structure:</h4>
        <pre className="text-xs text-gray-600 overflow-auto max-h-32">
          {/* Template structure would be rendered here */}
        </pre>
      </div>
    </div>
  );
}

export default TemplateSelector;
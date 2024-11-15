import React from 'react';
import { Dialog } from '@/components/ui/dialog';

/**
 * Modal dialog for managing project templates
 * @param {Object} props
 * @param {boolean} props.isOpen - Dialog visibility state
 * @param {Function} props.onClose - Close handler
 * @param {Array} props.templates - Array of template objects
 */
function TemplateManager({ isOpen, onClose, templates = [] }) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <div className="p-6 max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">Manage Project Templates</h2>
        
        {/* Template List */}
        <div className="space-y-4 mb-6">
          <div className="border rounded-lg divide-y">
            {templates.map(template => (
              <div key={template.name} className="p-4 flex justify-between items-center">
                {/* Template Info */}
                <div>
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
                {/* Template Actions */}
                <div className="space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Add Template Button */}
        <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Add New Template
        </button>
      </div>
    </Dialog>
  );
}

export default TemplateManager;
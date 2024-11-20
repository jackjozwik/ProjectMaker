import React from 'react';

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Dialog Content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children }) => (
  <div className="p-6">{children}</div>
);

const DialogHeader = ({ children }) => (
  <div className="mb-4">{children}</div>
);

const DialogTitle = ({ children }) => (
  <h2 className="text-lg font-semibold text-gray-900">{children}</h2>
);

const DialogFooter = ({ children }) => (
  <div className="mt-6 flex justify-end gap-3">{children}</div>
);

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter };
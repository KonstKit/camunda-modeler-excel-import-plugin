import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export const DialogManager = ({ children, onClose }) => {
  return createPortal(
    <div className="dialog-overlay">
      <div className="dialog-container">
        <div className="dialog-header">
          <button className="dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="dialog-content">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export const useDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(null);

  const openDialog = (dialogContent) => {
    setContent(dialogContent);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setContent(null);
  };

  const DialogComponent = isOpen ? (
    <DialogManager onClose={closeDialog}>
      {content}
    </DialogManager>
  ) : null;

  return {
    DialogComponent,
    openDialog,
    closeDialog
  };
};

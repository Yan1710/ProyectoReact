import React from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmar Eliminación',
  message = '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  type = 'danger', // 'danger', 'warning', 'info'
  icon = null
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getModalClass = () => {
    switch (type) {
      case 'danger':
        return 'confirm-modal-danger';
      case 'warning':
        return 'confirm-modal-warning';
      case 'info':
        return 'confirm-modal-info';
      default:
        return 'confirm-modal-danger';
    }
  };

  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'danger':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      case 'warning':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      case 'info':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
      default:
        return null;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'btn-confirm-danger';
      case 'warning':
        return 'btn-confirm-warning';
      case 'info':
        return 'btn-confirm-info';
      default:
        return 'btn-confirm-danger';
    }
  };

  return (
    <div className="confirm-modal-overlay">
      <div className={`confirm-modal-container ${getModalClass()}`}>
        {/* Header */}
        <div className="confirm-modal-header">
          <h3 className="confirm-modal-title">{title}</h3>
          <button 
            className="confirm-modal-close" 
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="confirm-modal-body">
          <div className="confirm-modal-icon">
            {getIcon()}
          </div>
          
          <div className="confirm-modal-content">
            <p className="confirm-modal-message">{message}</p>
            
            <div className="confirm-modal-actions">
              <button 
                className="btn-cancel"
                onClick={onClose}
              >
                {cancelText}
              </button>
              
              <button 
                className={`btn-confirm ${getConfirmButtonClass()}`}
                onClick={handleConfirm}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

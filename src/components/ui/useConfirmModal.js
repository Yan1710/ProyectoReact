import { useState, useEffect } from 'react';

// Hook personalizado para manejar ConfirmModal
export const useConfirmModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const openModal = () => {
    setIsOpen(true);
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsOpen(false);
    // Restaurar scroll del body
    document.body.style.overflow = 'unset';
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return {
    isOpen,
    openModal,
    closeModal
  };
};

// Hook para manejar confirmaciones con callback
export const useConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});

  const confirm = (options) => {
    return new Promise((resolve) => {
      setConfig({
        ...options,
        onConfirm: () => {
          resolve(true);
          setIsOpen(false);
        },
        onCancel: () => {
          resolve(false);
          setIsOpen(false);
        }
      });
      setIsOpen(true);
    });
  };

  const closeModal = () => {
    setIsOpen(false);
    if (config.onCancel) {
      config.onCancel();
    }
  };

  return {
    isOpen,
    config,
    confirm,
    closeModal
  };
};

export default {
  useConfirmModal,
  useConfirmation
};

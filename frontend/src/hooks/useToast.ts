import { useState, useCallback } from 'react';
import { ToastType } from '../components/ui/Toast';

export const useToast = () => {
  const [toast, setToast] = useState<{
    isVisible: boolean;
    type: ToastType;
    message: string;
  }>({
    isVisible: false,
    type: 'success',
    message: ''
  });

  const showToast = useCallback((type: ToastType, message: string) => {
    setToast({ isVisible: true, type, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 5000);
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  return {
    toast,
    showToast,
    hideToast
  };
};
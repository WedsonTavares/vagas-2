'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Button } from './button';

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className='fixed top-4 right-4 z-50 space-y-2'>
      {toasts.map(toast => (
        <ToastComponent key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastComponent({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const getToastStyles = () => {
    const baseStyles =
      'min-w-80 p-4 rounded-lg border shadow-lg bg-[color:var(--color-card)] border-[color:var(--color-border)] animate-in slide-in-from-right duration-300';

    const typeStyles = {
      success: 'border-l-4 border-l-green-500',
      error: 'border-l-4 border-l-red-500',
      warning: 'border-l-4 border-l-yellow-500',
      info: 'border-l-4 border-l-blue-500',
    };

    return `${baseStyles} ${typeStyles[toast.type]}`;
  };

  const getIcon = () => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    };
    return icons[toast.type];
  };

  return (
    <div className={getToastStyles()}>
      <div className='flex items-start gap-3'>
        <span className='text-lg'>{getIcon()}</span>
        <div className='flex-1'>
          <h4 className='font-semibold text-[color:var(--color-card-foreground)]'>
            {toast.title}
          </h4>
          {toast.description && (
            <p className='text-sm text-[color:var(--color-muted-foreground)] mt-1'>
              {toast.description}
            </p>
          )}
        </div>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => onRemove(toast.id)}
          className='h-6 w-6 p-0 hover:bg-[color:var(--color-secondary)]'
        >
          ✕
        </Button>
      </div>
    </div>
  );
}

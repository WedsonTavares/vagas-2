'use client';

import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidthClass?: string; // ex: 'max-w-md', 'max-w-lg'
}

export function Modal({ open, onClose, title, children, maxWidthClass = 'max-w-lg' }: ModalProps) {
  if (!open) return null;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Overlay */}
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' onClick={onClose} />

      {/* Modal */}
      <div className={`relative bg-[color:var(--color-card)] rounded-lg border border-[color:var(--color-border)] shadow-xl w-full ${maxWidthClass} mx-4 animate-in zoom-in-95 duration-200`}>
        {title && (
          <div className='px-6 pt-5 pb-3 border-b border-[color:var(--color-border)]'>
            <h3 className='text-lg font-semibold text-[color:var(--color-card-foreground)]'>{title}</h3>
          </div>
        )}
        <div className='p-6'>{children}</div>
      </div>
    </div>
  );
}

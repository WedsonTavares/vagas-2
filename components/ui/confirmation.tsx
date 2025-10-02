'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Button } from './button'

interface ConfirmationOptions {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  type?: 'default' | 'danger' | 'warning'
}

interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => Promise<boolean>
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined)

export function ConfirmationProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmationOptions | null>(null)
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(options)
      setResolvePromise(() => resolve)
      setIsOpen(true)
    })
  }, [])

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true)
    }
    setIsOpen(false)
    setOptions(null)
    setResolvePromise(null)
  }

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false)
    }
    setIsOpen(false)
    setOptions(null)
    setResolvePromise(null)
  }

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <ConfirmationModal
          options={options}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmationContext.Provider>
  )
}

export function useConfirmation() {
  const context = useContext(ConfirmationContext)
  if (!context) {
    throw new Error('useConfirmation must be used within a ConfirmationProvider')
  }
  return context
}

function ConfirmationModal({
  options,
  onConfirm,
  onCancel
}: {
  options: ConfirmationOptions
  onConfirm: () => void
  onCancel: () => void
}) {
  const getIcon = () => {
    const icons = {
      default: '❓',
      danger: '⚠️',
      warning: '⚠️'
    }
    return icons[options.type || 'default']
  }

  const getConfirmButtonStyle = () => {
    const styles = {
      default: 'bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary)]/90',
      danger: 'bg-red-600 text-white hover:bg-red-700',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700'
    }
    return styles[options.type || 'default']
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-[color:var(--color-card)] rounded-lg border border-[color:var(--color-border)] shadow-xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-2xl">{getIcon()}</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[color:var(--color-card-foreground)] mb-2">
                {options.title}
              </h3>
              <p className="text-sm text-[color:var(--color-muted-foreground)] mb-6">
                {options.description}
              </p>
              
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="min-w-20"
                >
                  {options.cancelLabel || 'Cancelar'}
                </Button>
                <Button
                  onClick={onConfirm}
                  className={`min-w-20 ${getConfirmButtonStyle()}`}
                >
                  {options.confirmLabel || 'Confirmar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
"use client";
// Componente para exibir um item do checklist de um objetivo
// Mostra título, status de conclusão e ações (marcar, editar, excluir)
import React from 'react';
import { ObjectiveChecklist } from '../../types';

export interface ChecklistItemProps extends ObjectiveChecklist {
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({ id, title, completed, onToggle, onDelete }) => {
  const [loading, setLoading] = React.useState(false);
  const handleToggle = async () => {
    setLoading(true);
    await onToggle?.(id);
    setLoading(false);
  };
  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <button
        className={`p-1 rounded ${completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'} disabled:opacity-50`}
        onClick={handleToggle}
        disabled={loading}
        title={completed ? 'Desmarcar' : 'Marcar como concluído'}
      >
        {loading ? (
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /></svg>
        ) : completed ? (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
        ) : (
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
        )}
      </button>
      <span className={`flex-1 ${completed ? 'line-through text-gray-400' : ''}`}>{title}</span>
      <button className="p-1 rounded hover:bg-red-100 text-red-600" onClick={() => onDelete?.(id)} title="Excluir">
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><rect x="5" y="6" width="14" height="14" rx="2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
      </button>
    </div>
  );
};

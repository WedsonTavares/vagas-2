// Componente para exibir um item do checklist de um objetivo
// Mostra título, status de conclusão e ações (marcar, editar, excluir)
import React from 'react';
import { ObjectiveChecklist } from '../../types';

export interface ChecklistItemProps extends ObjectiveChecklist {
  onToggle?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({ id, title, completed, onToggle, onEdit, onDelete }) => {
  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <input type="checkbox" checked={completed} onChange={() => onToggle?.(id)} />
      <span className={`flex-1 ${completed ? 'line-through text-gray-400' : ''}`}>{title}</span>
      <button className="text-blue-600 hover:underline text-xs" onClick={() => onEdit?.(id)}>Editar</button>
      <button className="text-red-600 hover:underline text-xs" onClick={() => onDelete?.(id)}>Excluir</button>
    </div>
  );
};

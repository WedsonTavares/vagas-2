// Componente de card para exibir um objetivo individual
// Mostra título, descrição, status e ações (editar, checklist, excluir)
import React from 'react';
import { Objective } from '../../types';

export interface ObjetivoCardProps extends Objective {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onChecklist?: (id: string) => void;
}

export const ObjetivoCard: React.FC<ObjetivoCardProps> = ({
  id,
  name,
  description,
  status,
  progress,
  onEdit,
  onDelete,
  onChecklist,
}) => {
  return (
    <div className={`rounded-lg border p-4 shadow-sm bg-white flex flex-col gap-2 ${status === 'concluido' ? 'opacity-70' : ''}`}> 
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">{name}</h3>
        <span className={`px-2 py-1 rounded text-xs ${status === 'concluido' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{status === 'concluido' ? 'Concluído' : status === 'em_andamento' ? 'Em andamento' : 'Futuro'}</span>
      </div>
      {description && <p className="text-sm text-gray-600">{description}</p>}
      <div className="flex gap-2 mt-2">
        <button className="text-blue-600 hover:underline" onClick={() => onEdit?.(id)}>Editar</button>
        <button className="text-purple-600 hover:underline" onClick={() => onChecklist?.(id)}>Checklist</button>
        <button className="text-red-600 hover:underline" onClick={() => onDelete?.(id)}>Excluir</button>
      </div>
      <div className="w-full bg-gray-200 h-2 rounded mt-2">
        <div className="bg-blue-500 h-2 rounded" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

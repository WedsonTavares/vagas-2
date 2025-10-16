"use client";
// Componente de card para exibir um objetivo individual
// Mostra título, descrição, status e ações (editar, checklist, excluir)
import React from 'react';
import { Objective } from '../../types';

export interface ObjetivoCardProps extends Objective {
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onChecklist?: (id: string) => void;
  onStart?: (id: string) => void;
  priorityColor?: string;
  children?: React.ReactNode;
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
  onStart,
  priorityColor,
  children,
}) => {
  return (
    <div
      className={`h-full rounded-lg p-4 shadow-sm bg-card flex flex-col gap-2 cursor-pointer transition hover:shadow-md ${status === 'concluido' ? 'opacity-70' : ''}`}
      onClick={e => {
        // Evita abrir checklist ao clicar nos ícones de ação
        if ((e.target as HTMLElement).closest('.card-action')) return;
        onChecklist?.(id);
      }}
    >
      <div className="flex  p-2 items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          {priorityColor && (
            <span
              className="inline-block w-2.5 h-2.5 rounded-full "
              style={{ backgroundColor: priorityColor }}
              aria-label="prioridade"
            />
          )}
          <h3 className="font-bold text-lg text-card-foreground truncate">{name}</h3>
        </div>
        <span className={`px-2 p-1 rounded text-xs font-medium ${status === 'concluido' ? 'bg-green-200 text-green-800' : status === 'em_andamento' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'}`}>{status === 'concluido' ? 'Concluído' : status === 'em_andamento' ? 'Em andamento' : 'A Fazer'}</span>
      </div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {status !== 'futuro' && (
        <div className="w-full bg-gray-200 h-2 rounded overflow-hidden">
          <div
            className="bg-primary h-2 rounded"
            style={{ width: `${status === 'concluido' ? 100 : progress}%` }}
          />
        </div>
      )}
  <div className="flex gap-2 justify-end items-center mt-2">
        {status === 'futuro' && (
          <button
            className="card-action p-1 rounded hover:bg-accent text-emerald-600"
            title="Iniciar"
            onClick={e => { e.stopPropagation(); onStart?.(id); }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        )}
        <button
          className="card-action rounded hover:bg-accent text-blue-600"
          title="Editar"
          onClick={e => { e.stopPropagation(); onEdit?.(id); }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
        </button>
        <button
          className="card-action rounded hover:bg-accent text-red-600"
          title="Excluir"
          onClick={e => { e.stopPropagation(); onDelete?.(id); }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><rect x="5" y="6" width="14" height="14" rx="2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </button>
      </div>
  {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
};

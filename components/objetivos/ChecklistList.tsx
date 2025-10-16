"use client";
// Lista de itens do checklist de um objetivo
// Renderiza uma lista de ChecklistItem e lida com estados de carregamento/vazio
import React from 'react';
import { ChecklistItem } from './ChecklistItem';
import { ObjectiveChecklist } from '../../types';

export interface ChecklistListProps {
  items: ObjectiveChecklist[];
  loading?: boolean;
  onToggle?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ChecklistList: React.FC<ChecklistListProps> = ({ items, loading, onToggle, onDelete }) => {
  if (loading) {
    return <div className=" text-center text-gray-500">Carregando Checklist...</div>;
  }
  if (!items.length) {
    return <div className=" text-center text-gray-500">Nenhum item no checklist.</div>;
  }
  return (
    <div className="flex flex-col gap-1">
      {items.map(item => (
        <ChecklistItem
          key={item.id}
          {...item}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

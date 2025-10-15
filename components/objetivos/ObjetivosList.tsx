// Lista de objetivos do usuário
// Renderiza uma lista de ObjetivoCard e lida com estados de carregamento/vazio
import React from 'react';
import { ObjetivoCard } from './ObjetivoCard';
import { Objective } from '../../types';

export interface ObjetivosListProps {
  objetivos: Objective[];
  loading?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onChecklist?: (id: string) => void;
}

export const ObjetivosList: React.FC<ObjetivosListProps> = ({ objetivos, loading, onEdit, onDelete, onChecklist }) => {
  if (loading) {
    return <div className="p-4 text-center text-gray-500">Carregando objetivos...</div>;
  }
  if (!objetivos.length) {
    return <div className="p-4 text-center text-gray-500">Nenhum objetivo cadastrado.</div>;
  }
  return (
    <div className="grid gap-4">
      {objetivos.map(obj => (
        <ObjetivoCard
          key={obj.id}
          {...obj}
          onEdit={onEdit}
          onDelete={onDelete}
          onChecklist={onChecklist}
        />
      ))}
    </div>
  );
};

import React from 'react';
import { Materia } from '@/types';

interface MateriaCardProps {
  materia: Materia;
  showGrade?: boolean;
}

export default function MateriaCard({ materia, showGrade = true }: MateriaCardProps) {
  const getStatusColor = () => {
    switch (materia.status) {
      case 'concluido':
        return 'bg-[color:var(--color-card)] border-[color:var(--color-border)] hover:border-green-300';
      case 'cursando':
        return 'bg-[color:var(--color-card)] border-[color:var(--color-border)] hover:border-blue-300';
      case 'falta_cursar':
        return 'bg-[color:var(--color-card)] border-[color:var(--color-border)] hover:border-yellow-300';
      default:
        return 'bg-[color:var(--color-card)] border-[color:var(--color-border)]';
    }
  };

  const getStatusBadgeColor = () => {
    switch (materia.status) {
      case 'concluido':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cursando':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'falta_cursar':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getStatusLabel = () => {
    switch (materia.status) {
      case 'concluido':
        return 'Concluída';
      case 'cursando':
        return 'Cursando';
      case 'falta_cursar':
        return 'Falta Cursar';
      default:
        return materia.situacao;
    }
  };

  return (
    <div className={`rounded-lg border p-4 transition-all duration-200 hover:shadow-lg ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-[color:var(--color-card-foreground)] text-sm">
              {materia.codigo}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor()}`}>
              {getStatusLabel()}
            </span>
          </div>
          <h4 className="font-medium text-[color:var(--color-card-foreground)] mb-2 leading-tight">
            {materia.nome}
          </h4>
        </div>
        {showGrade && materia.grau !== null && (
          <div className="text-right ml-4">
            <div className="text-lg font-bold text-[color:var(--color-primary)]">
              {materia.grau.toFixed(1)}
            </div>
            <div className="text-xs text-[color:var(--color-muted-foreground)]">
              Nota
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm">
        {materia.professor && (
          <div className="flex justify-between">
            <span className="text-[color:var(--color-muted-foreground)]">Professor:</span>
            <span className="text-[color:var(--color-card-foreground)] text-right max-w-xs truncate">
              {materia.professor}
            </span>
          </div>
        )}
        
        {materia.titulacao && (
          <div className="flex justify-between">
            <span className="text-[color:var(--color-muted-foreground)]">Titulação:</span>
            <span className="text-[color:var(--color-card-foreground)]">
              {materia.titulacao}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-[color:var(--color-muted-foreground)]">Carga Horária:</span>
          <span className="text-[color:var(--color-card-foreground)]">
            {materia.cargaHoraria}h
          </span>
        </div>

        {materia.periodo && (
          <div className="flex justify-between">
            <span className="text-[color:var(--color-muted-foreground)]">Período:</span>
            <span className="text-[color:var(--color-card-foreground)]">
              {materia.periodo}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
 'use client';

import React, { useMemo } from 'react';
import materiasData from '../../data/materias.json';
import { Materia, MateriaStatus } from '../../types';

type Props = {
  filter: 'concluidas' | 'cursando' | 'falta_cursar';
};

export default function FacultyList({ filter }: Props) {
  const seed = useMemo(() => materiasData as Materia[], []);
  const subjects = useMemo(() => {
    if (filter === 'cursando')
      return seed.filter(s => s.status === MateriaStatus.CURSANDO);

    if (filter === 'concluidas')
      return seed.filter(s => s.status === MateriaStatus.CONCLUIDO);

    return seed.filter(s => s.status === MateriaStatus.FALTA_CURSAR);
  }, [filter, seed]);

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      {subjects.map(s => (
        <div
          key={s.id}
          className={`p-4 rounded border transition-all duration-200 hover:shadow-md ${
            s.status === MateriaStatus.CONCLUIDO
              ? 'bg-[color:var(--color-card)] border-[color:var(--color-border)] hover:border-green-300'
              : s.status === MateriaStatus.CURSANDO
              ? 'bg-[color:var(--color-card)] border-[color:var(--color-border)] hover:border-blue-300'
              : s.status === MateriaStatus.FALTA_CURSAR
              ? 'bg-[color:var(--color-card)] border-[color:var(--color-border)] hover:border-yellow-300'
              : 'bg-[color:var(--color-card)] border-[color:var(--color-border)]'
          }`}
        >
          <h3 className='font-medium'>
            {s.codigo} — {s.nome}
          </h3>
          <p className='text-sm text-[color:var(--color-muted-foreground)]'>
            Professor: {s.professor ?? '—'}
          </p>
          <p className='text-sm text-[color:var(--color-muted-foreground)]'>
            Carga: {s.cargaHoraria ?? '-'}h {' — '} Nota: {s.grau ?? '-'}
          </p>
        </div>
      ))}
    </div>
  );
}

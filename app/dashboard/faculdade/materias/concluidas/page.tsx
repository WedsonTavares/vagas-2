'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Materia, MateriaStatus } from '@/types';
import MateriaCard from '@/components/materias/MateriaCard';
import Pagination from '@/components/ui/pagination';
import materiasData from '@/data/materias.json';
import Loading from '@/components/ui/loading';
import BackButton from '@/components/ui/back-button';

export default function MateriasConcluidasPage() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6; // fixed page size as requested

  // Page transition state (fade out -> switch page -> fade in)
  const [isFadingOut, setIsFadingOut] = useState(false);
  const transitionTimeoutRef = useRef<number | null>(null);

  const handlePageChange = useCallback(
    (p: number) => {
      if (p === currentPage) return;
      // start fade out
      setIsFadingOut(true);
      // after fade-out, change page and trigger fade-in
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
      transitionTimeoutRef.current = window.setTimeout(() => {
        setCurrentPage(p);
        // small delay to ensure new content is mounted, then fade in
        transitionTimeoutRef.current = window.setTimeout(() => {
          setIsFadingOut(false);
        }, 30);
      }, 300);
    },
    [currentPage]
  );

  // Cleanup de timeouts ao desmontar
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const materiasCarregadas = materiasData as Materia[];
    const materiasConcluidas = materiasCarregadas.filter(
      materia => materia.status === MateriaStatus.CONCLUIDO
    );
    
    // Ordenar por período (mais recente primeiro)
    materiasConcluidas.sort((a, b) => {
      if (a.periodo && b.periodo) {
        return b.periodo.localeCompare(a.periodo);
      }
      return 0;
    });

    setMaterias(materiasConcluidas);
    setLoading(false);
  }, []);

  // Pagination calculations
  const totalItems = materias.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const pagedMaterias = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return materias.slice(start, start + pageSize);
  }, [materias, currentPage]);

  if (loading) {
    return <Loading message='Carregando Matérias Concluídas...' />;
  }

  const calcularEstatisticas = () => {
    const total = materias.length;
    const notasValidas = materias.filter(m => m.grau !== null).map(m => m.grau as number);
    const media = notasValidas.length > 0 
      ? notasValidas.reduce((sum, nota) => sum + nota, 0) / notasValidas.length 
      : 0;
    const cargaHoraria = materias.reduce((sum, m) => sum + m.cargaHoraria, 0);
    const melhorNota = notasValidas.length > 0 ? Math.max(...notasValidas) : 0;

    return { total, media, cargaHoraria, melhorNota };
  };

  const stats = calcularEstatisticas();

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BackButton href="/dashboard/faculdade/materias" />
          <div>
            <h1 className="text-2xl font-bold text-green-600">
              Matérias Concluídas
            </h1>
            <p className="text-[color:var(--color-muted-foreground)] mt-1">
              {stats.total} matérias aprovadas
            </p>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-green-300 transition-all duration-200">
          <div className="text-2xl font-bold text-[color:var(--color-card-foreground)]">{stats.total}</div>
          <div className="text-sm text-[color:var(--color-muted-foreground)]">
            Matérias Aprovadas
          </div>
        </div>
        
        <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-green-300 transition-all duration-200">
          <div className="text-2xl font-bold text-[color:var(--color-card-foreground)]">
            {stats.media.toFixed(1)}
          </div>
          <div className="text-sm text-[color:var(--color-muted-foreground)]">
            Média Geral
          </div>
        </div>

        <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-green-300 transition-all duration-200">
          <div className="text-2xl font-bold text-[color:var(--color-card-foreground)]">
            {stats.melhorNota.toFixed(1)}
          </div>
          <div className="text-sm text-[color:var(--color-muted-foreground)]">
            Melhor Nota
          </div>
        </div>

        <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-green-300 transition-all duration-200">
          <div className="text-2xl font-bold text-[color:var(--color-card-foreground)]">
            {stats.cargaHoraria}h
          </div>
          <div className="text-sm text-[color:var(--color-muted-foreground)]">
            Carga Horária
          </div>
        </div>
      </div>

      {/* Lista de Matérias */}
      {materias.length === 0 ? (
        <div className="text-center py-12 bg-[color:var(--color-card)] rounded-lg border border-[color:var(--color-border)]">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2 text-[color:var(--color-card-foreground)]">
            Nenhuma matéria concluída
          </h3>
          <p className="text-[color:var(--color-muted-foreground)]">
            As matérias aprovadas aparecerão aqui
          </p>
        </div>
      ) : (
        <>
          <div 
            className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 transition-opacity duration-300 ${
              isFadingOut ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {pagedMaterias.map(materia => (
              <MateriaCard 
                key={materia.id} 
                materia={materia} 
                showGrade={true}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              pageSize={pageSize}
              totalItems={totalItems}
            />
          )}
        </>
      )}
    </div>
  );
}
'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Materia, MateriaStatus } from '@/types';
import MateriaCard from '@/components/materias/MateriaCard';
import Pagination from '@/components/ui/pagination';
import materiasData from '@/data/materias.json';

export default function MateriasCursandoPage() {
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

  // Cleanup de timeouts ao desmontar para evitar vazamento de memória
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const materiasCarregadas = materiasData as Materia[];
    const materiasCursando = materiasCarregadas.filter(
      materia => materia.status === MateriaStatus.CURSANDO
    );
    
    // Ordenar por período
    materiasCursando.sort((a, b) => {
      if (a.periodo && b.periodo) {
        return a.periodo.localeCompare(b.periodo);
      }
      return 0;
    });

    setMaterias(materiasCursando);
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">📖</div>
          <p>Carregando Matérias em Curso...</p>
        </div>
      </div>
    );
  }

  const calcularEstatisticas = () => {
    const total = materias.length;
    const cargaHoraria = materias.reduce((sum, m) => sum + m.cargaHoraria, 0);
    
    // Agrupar por período
    const periodos = materias.reduce((acc, materia) => {
      if (materia.periodo) {
        acc[materia.periodo] = (acc[materia.periodo] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return { total, cargaHoraria, periodos };
  };

  const stats = calcularEstatisticas();

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/faculdade/materias">
            <Button variant="ghost" size="sm">
              ← Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              Matérias Cursando
            </h1>
            <p className="text-[color:var(--color-muted-foreground)] mt-1">
              {stats.total} matérias em andamento
            </p>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-blue-300 transition-all duration-200">
          <div className="text-2xl font-bold text-[color:var(--color-card-foreground)]">{stats.total}</div>
          <div className="text-sm text-[color:var(--color-muted-foreground)]">
            Matérias Ativas
          </div>
        </div>
        
        <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-blue-300 transition-all duration-200">
          <div className="text-2xl font-bold text-[color:var(--color-card-foreground)]">
            {stats.cargaHoraria}h
          </div>
          <div className="text-sm text-[color:var(--color-muted-foreground)]">
            Carga Horária Atual
          </div>
        </div>

        <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-blue-300 transition-all duration-200">
          <div className="text-2xl font-bold text-[color:var(--color-card-foreground)]">
            {Object.keys(stats.periodos).length}
          </div>
          <div className="text-sm text-[color:var(--color-muted-foreground)]">
            Períodos Ativos
          </div>
        </div>
      </div>

      {/* Lista de Matérias */}
      {materias.length === 0 ? (
        <div className="text-center py-12 bg-[color:var(--color-card)] rounded-lg border border-[color:var(--color-border)]">
          <div className="text-6xl mb-4">📖</div>
          <h3 className="text-xl font-semibold mb-2 text-[color:var(--color-card-foreground)]">
            Nenhuma matéria em curso
          </h3>
          <p className="text-[color:var(--color-muted-foreground)]">
            As matérias que você está cursando aparecerão aqui
          </p>
        </div>
      ) : (
        <>
          <div 
            className={`transition-opacity duration-300 ${
              isFadingOut ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {pagedMaterias.map(materia => (
                <MateriaCard 
                  key={materia.id} 
                  materia={materia} 
                  showGrade={false}
                />
              ))}
            </div>
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
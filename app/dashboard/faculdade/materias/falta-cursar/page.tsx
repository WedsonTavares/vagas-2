'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Materia, MateriaStatus } from '@/types';
import MateriaCard from '@/components/materias/MateriaCard';
import Pagination from '@/components/ui/pagination';
import materiasData from '@/data/materias.json';

export default function MateriasFaltaCursarPage() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    const materiasFaltaCursar = materiasCarregadas.filter(
      materia => materia.status === MateriaStatus.FALTA_CURSAR
    );
    
    // Ordenar alfabeticamente por nome
    materiasFaltaCursar.sort((a, b) => a.nome.localeCompare(b.nome));

    setMaterias(materiasFaltaCursar);
    setLoading(false);
  }, []);

  const materiasFiltradas = useMemo(() => {
    return materias.filter(materia =>
      materia.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      materia.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [materias, searchTerm]);

  // Reset current page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination calculations
  const totalItems = materiasFiltradas.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const pagedMaterias = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return materiasFiltradas.slice(start, start + pageSize);
  }, [materiasFiltradas, currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p>Carregando Matérias Pendentes...</p>
        </div>
      </div>
    );
  }

  const calcularEstatisticas = () => {
    const total = materias.length;
    const cargaHoraria = materias.reduce((sum, m) => sum + m.cargaHoraria, 0);
    
    // Estimar períodos restantes (considerando 5 matérias por período)
    const periodosEstimados = Math.ceil(total / 5);

    return { total, cargaHoraria, periodosEstimados };
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
            <h1 className="text-2xl font-bold text-orange-600">
              Falta Cursar
            </h1>
            <p className="text-[color:var(--color-muted-foreground)] mt-1">
              {stats.total} matérias pendentes
            </p>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-yellow-300 transition-all duration-200">
          <div className="text-2xl font-bold text-[color:var(--color-card-foreground)]">{stats.total}</div>
          <div className="text-sm text-[color:var(--color-muted-foreground)]">
            Matérias Pendentes
          </div>
        </div>
        
        <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-yellow-300 transition-all duration-200">
          <div className="text-2xl font-bold text-[color:var(--color-card-foreground)]">
            {stats.cargaHoraria}h
          </div>
          <div className="text-sm text-[color:var(--color-muted-foreground)]">
            Carga Horária Restante
          </div>
        </div>

        <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-yellow-300 transition-all duration-200">
          <div className="text-2xl font-bold text-[color:var(--color-card-foreground)]">
            ~{stats.periodosEstimados}
          </div>
          <div className="text-sm text-[color:var(--color-muted-foreground)]">
            Períodos Estimados
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Buscar matérias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pr-10 border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-card)] text-[color:var(--color-card-foreground)] placeholder-[color:var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-transparent"
            aria-label="Buscar matérias"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-[color:var(--color-muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
            {materiasFiltradas.length} matérias encontradas
          </p>
        )}
      </div>

      {/* Lista de Matérias */}
      {materiasFiltradas.length === 0 ? (
        <div className="text-center py-12 bg-[color:var(--color-card)] rounded-lg border border-[color:var(--color-border)]">
          <div className="text-6xl mb-4">
            {searchTerm ? '🔍' : '🎉'}
          </div>
          <h3 className="text-xl font-semibold mb-2 text-[color:var(--color-card-foreground)]">
            {searchTerm ? 'Nenhuma matéria encontrada' : 'Parabéns!'}
          </h3>
          <p className="text-[color:var(--color-muted-foreground)]">
            {searchTerm 
              ? 'Tente ajustar os termos de busca'
              : 'Você não tem matérias pendentes!'
            }
          </p>
          {searchTerm && (
            <Button 
              onClick={() => setSearchTerm('')}
              className="mt-4 bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary)]/90"
            >
              Limpar Busca
            </Button>
          )}
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
                showGrade={false}
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
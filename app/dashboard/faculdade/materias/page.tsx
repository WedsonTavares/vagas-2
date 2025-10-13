'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Materia, MateriaStats, MateriaStatus } from '@/types';
import materiasData from '@/data/materias.json';

export default function MateriasPage() {
  const [stats, setStats] = useState<MateriaStats | null>(null);

  useEffect(() => {
    // Carrega as matérias do JSON
    const materiasCarregadas = materiasData as Materia[];

    // Calcula as estatísticas
    const concluidas = materiasCarregadas.filter(m => m.status === MateriaStatus.CONCLUIDO);
    const cursando = materiasCarregadas.filter(m => m.status === MateriaStatus.CURSANDO);
    const faltaCursar = materiasCarregadas.filter(m => m.status === MateriaStatus.FALTA_CURSAR);

    const notasConcluidas = concluidas.filter(m => m.grau !== null).map(m => m.grau as number);
    const mediaNota = notasConcluidas.length > 0 
      ? notasConcluidas.reduce((sum, nota) => sum + nota, 0) / notasConcluidas.length 
      : 0;

    const cargaHorariaConcluida = concluidas.reduce((sum, m) => sum + m.cargaHoraria, 0);
    const cargaHorariaTotal = materiasCarregadas.reduce((sum, m) => sum + m.cargaHoraria, 0);
    const progresso = cargaHorariaTotal > 0 ? (cargaHorariaConcluida / cargaHorariaTotal) * 100 : 0;

    setStats({
      total: materiasCarregadas.length,
      concluidas: concluidas.length,
      cursando: cursando.length,
      faltaCursar: faltaCursar.length,
      mediaNota,
      cargaHorariaConcluida,
      cargaHorariaTotal,
      progresso
    });
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <p>Carregando matérias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--color-primary)]">
            Gestão de Matérias
          </h1>
          <p className="text-[color:var(--color-muted-foreground)] mt-1">
            Ciência da Computação - Centro Universitário Estácio
          </p>
        </div>
        <Link href="/dashboard/faculdade/materias/estatisticas">
          <Button className="bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary)]/90">
            Ver Estatísticas
          </Button>
        </Link>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Concluídas */}
        <Link href="/dashboard/faculdade/materias/concluidas">
          <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-green-300 transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-[color:var(--color-muted-foreground)]">
                  Matérias Concluídas
                </div>
                <div className="text-2xl font-bold text-[color:var(--color-card-foreground)] group-hover:scale-105 transition-transform duration-200 mt-2">
                  {stats.concluidas}
                </div>
                <div className="text-sm text-[color:var(--color-muted-foreground)] group-hover:text-[color:var(--color-card-foreground)] transition-colors duration-200 mt-1">
                  Média: {stats.mediaNota.toFixed(1)}
                </div>
              </div>
              <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
                ✅
              </div>
            </div>
          </div>
        </Link>

        {/* Cursando */}
        <Link href="/dashboard/faculdade/materias/cursando">
          <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-[color:var(--color-muted-foreground)]">
                  Cursando Atualmente
                </div>
                <div className="text-2xl font-bold text-[color:var(--color-card-foreground)] group-hover:scale-105 transition-transform duration-200 mt-2">
                  {stats.cursando}
                </div>
                <div className="text-sm text-[color:var(--color-muted-foreground)] group-hover:text-[color:var(--color-card-foreground)] transition-colors duration-200 mt-1">
                  Em andamento
                </div>
              </div>
              <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
                📖
              </div>
            </div>
          </div>
        </Link>

        {/* Falta Cursar */}
        <Link href="/dashboard/faculdade/materias/falta-cursar">
          <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-yellow-300 transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-[color:var(--color-muted-foreground)]">
                  Falta Cursar
                </div>
                <div className="text-2xl font-bold text-[color:var(--color-card-foreground)] group-hover:scale-105 transition-transform duration-200 mt-2">
                  {stats.faltaCursar}
                </div>
                <div className="text-sm text-[color:var(--color-muted-foreground)] group-hover:text-[color:var(--color-card-foreground)] transition-colors duration-200 mt-1">
                  Pendentes
                </div>
              </div>
              <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
                ⏳
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Resumo do Progresso */}
      <div className="bg-[color:var(--color-card)] rounded-lg border border-[color:var(--color-border)] p-6">
        <h2 className="text-lg font-semibold mb-4">Progresso do Curso</h2>
        
        <div className="space-y-4">
          {/* Barra de Progresso */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso Geral</span>
              <span>{stats.progresso.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[color:var(--color-primary)] h-2 rounded-full transition-all duration-300"
                style={{ width: `${stats.progresso}%` }}
              />
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-[color:var(--color-card-foreground)]">
                {stats.total}
              </div>
              <div className="text-sm text-[color:var(--color-muted-foreground)]">
                Total de Matérias
              </div>
            </div>
            <div>
              <div className="text-lg font-semibold text-[color:var(--color-card-foreground)]">
                {stats.cargaHorariaConcluida}h
              </div>
              <div className="text-sm text-[color:var(--color-muted-foreground)]">
                Horas Concluídas
              </div>
            </div>
            <div>
              <div className="text-lg font-semibold text-[color:var(--color-card-foreground)]">
                {stats.cargaHorariaTotal}h
              </div>
              <div className="text-sm text-[color:var(--color-muted-foreground)]">
                Total de Horas
              </div>
            </div>
            <div>
              <div className="text-lg font-semibold text-[color:var(--color-card-foreground)]">
                {stats.mediaNota.toFixed(1)}
              </div>
              <div className="text-sm text-[color:var(--color-muted-foreground)]">
                Média Geral
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
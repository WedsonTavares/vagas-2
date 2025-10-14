'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Materia, MateriaStatus, Exam } from '@/types';
import materiasData from '@/data/materias.json';

export default function MateriasEstatisticasPage() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examsLoading, setExamsLoading] = useState(true);

  useEffect(() => {
    const materiasCarregadas = materiasData as Materia[];
    setMaterias(materiasCarregadas);
    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchExams = async () => {
      setExamsLoading(true);
      try {
        const res = await fetch('/api/faculdade/provas');
        if (!res.ok) throw new Error('Erro ao buscar provas');
        const data = await res.json();
        setExams(data || []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        setExams([]);
      } finally {
        setExamsLoading(false);
      }
    };

    fetchExams();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p>Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  const calcularEstatisticasDetalhadas = () => {
    const concluidas = materias.filter(m => m.status === MateriaStatus.CONCLUIDO);
    const cursando = materias.filter(m => m.status === MateriaStatus.CURSANDO);
    const faltaCursar = materias.filter(m => m.status === MateriaStatus.FALTA_CURSAR);

    // Notas e médias
    const notasConcluidas = concluidas.filter(m => m.grau !== null).map(m => m.grau as number);
    const mediaNota = notasConcluidas.length > 0 
      ? notasConcluidas.reduce((sum, nota) => sum + nota, 0) / notasConcluidas.length 
      : 0;
    const melhorNota = notasConcluidas.length > 0 ? Math.max(...notasConcluidas) : 0;
    const piorNota = notasConcluidas.length > 0 ? Math.min(...notasConcluidas) : 0;

    // Carga horária
    const cargaTotal = materias.reduce((sum, m) => sum + m.cargaHoraria, 0);
    const cargaConcluida = concluidas.reduce((sum, m) => sum + m.cargaHoraria, 0);
    const cargaCursando = cursando.reduce((sum, m) => sum + m.cargaHoraria, 0);
    const cargaPendente = faltaCursar.reduce((sum, m) => sum + m.cargaHoraria, 0);

    // Progresso
    const progressoPercentual = cargaTotal > 0 ? (cargaConcluida / cargaTotal) * 100 : 0;


    // Notas por faixa
    const faixasNota = {
      excelente: notasConcluidas.filter(n => n >= 9.0).length, // 9.0 - 10.0
      otimo: notasConcluidas.filter(n => n >= 8.0 && n < 9.0).length, // 8.0 - 8.9
      bom: notasConcluidas.filter(n => n >= 7.0 && n < 8.0).length, // 7.0 - 7.9
      regular: notasConcluidas.filter(n => n >= 6.0 && n < 7.0).length, // 6.0 - 6.9
      insuficiente: notasConcluidas.filter(n => n < 6.0).length // < 6.0
    };

    return {
      totais: {
        total: materias.length,
        concluidas: concluidas.length,
        cursando: cursando.length,
        faltaCursar: faltaCursar.length
      },
      notas: {
        media: mediaNota,
        melhor: melhorNota,
        pior: piorNota,
        total: notasConcluidas.length
      },
      cargaHoraria: {
        total: cargaTotal,
        concluida: cargaConcluida,
        cursando: cargaCursando,
        pendente: cargaPendente
      },
      progresso: progressoPercentual,
      faixasNota
    };
  };

  const stats = calcularEstatisticasDetalhadas();

  // calcular estatísticas de provas
  const examStats = (() => {
    const now = new Date();
    const upcoming = exams.filter(e => {
      const d = new Date(e.examDate);
      return d >= now;
    });
    let nextExam: Exam | null = null;
    if (upcoming.length > 0) {
      nextExam = upcoming.reduce((prev, curr) => {
        return new Date(prev.examDate) < new Date(curr.examDate) ? prev : curr;
      });
    }
    return {
      upcomingCount: upcoming.length,
      nextExam,
    };
  })();

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
            <h1 className="text-2xl font-bold text-[color:var(--color-primary)]">
              Estatísticas Ciência da Computação
            </h1>
            <p className="text-[color:var(--color-muted-foreground)] mt-1">
              Análise detalhada do progresso do curso
            </p>
          </div>
        </div>
      </div>

      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-purple-300 transition-all duration-200">
          <div className="text-2xl font-bold text-[color:var(--color-card-foreground)]">
            {stats.progresso.toFixed(1)}%
          </div>
          <div className="text-sm text-[color:var(--color-muted-foreground)]">
            Progresso Geral
          </div>
        </div>

        <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-green-300 transition-all duration-200">
          <div className="text-2xl font-bold text-[color:var(--color-card-foreground)]">
            {stats.totais.concluidas}
          </div>
          <div className="text-sm text-[color:var(--color-muted-foreground)]">
            Matérias Aprovadas
          </div>
        </div>

        <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-blue-300 transition-all duration-200">
          <div className="text-2xl font-bold text-[color:var(--color-card-foreground)]">
            {stats.notas.media.toFixed(2)}
          </div>
          <div className="text-sm text-[color:var(--color-muted-foreground)]">
            Média Geral
          </div>
        </div>

        <div className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-yellow-300 transition-all duration-200">
          <div className="text-2xl font-bold text-[color:var(--color-card-foreground)]">
            {stats.cargaHoraria.concluida}h
          </div>
          <div className="text-sm text-[color:var(--color-muted-foreground)]">
            Horas Concluídas
          </div>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="bg-[color:var(--color-card)] rounded-lg border border-[color:var(--color-border)] p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Progresso do Curso</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso Geral</span>
              <span>{stats.progresso.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-[color:var(--color-primary)] h-3 rounded-full transition-all duration-300"
                style={{ width: `${stats.progresso}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {stats.cargaHoraria.concluida}h
              </div>
              <div className="text-sm text-[color:var(--color-muted-foreground)]">
                Concluída
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {stats.cargaHoraria.cursando}h
              </div>
              <div className="text-sm text-[color:var(--color-muted-foreground)]">
                Em Curso
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-600">
                {stats.cargaHoraria.pendente}h
              </div>
              <div className="text-sm text-[color:var(--color-muted-foreground)]">
                Pendente
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Desempenho por Faixa de Nota */}
        <div className="bg-[color:var(--color-card)] rounded-lg border border-[color:var(--color-border)] p-6">
          <h2 className="text-lg font-semibold mb-4">Desempenho por Faixa de Nota</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Excelente (9.0 - 10.0)</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(stats.faixasNota.excelente / stats.notas.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">
                  {stats.faixasNota.excelente}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Ótimo (8.0 - 8.9)</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(stats.faixasNota.otimo / stats.notas.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">
                  {stats.faixasNota.otimo}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Bom (7.0 - 7.9)</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${(stats.faixasNota.bom / stats.notas.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">
                  {stats.faixasNota.bom}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Regular (6.0 - 6.9)</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${(stats.faixasNota.regular / stats.notas.total) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-8 text-right">
                  {stats.faixasNota.regular}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Provas e Simulados (card ao lado) */}
        <div className="bg-[color:var(--color-card)] rounded-lg border border-[color:var(--color-border)] p-6">
          <h2 className="text-lg font-semibold mb-4">Provas e Simulados</h2>
          {examsLoading ? (
            <div>Carregando provas...</div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Próximas Provas</span>
                <div className="text-sm font-medium w-8 text-right">{examStats.upcomingCount}</div>
              </div>

              <div className="mt-2">
                <div className="text-sm text-[color:var(--color-muted-foreground)]">Próxima</div>
                {examStats.nextExam ? (
                  <div className="text-[color:var(--color-card-foreground)]">
                    <div className="font-semibold">{examStats.nextExam.materia}</div>
                    <div className="text-sm">{new Date(examStats.nextExam.examDate).toLocaleString()}</div>
                    <div className="text-sm">{examStats.nextExam.location || '—'}</div>
                  </div>
                ) : (
                  <div className="text-sm text-[color:var(--color-muted-foreground)]">Nenhuma prova agendada</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
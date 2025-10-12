'use client';
import React, { useEffect, useState } from 'react';
import JobsChart from '@/components/charts/JobsChart';
import StatusCards from '@/components/stats/StatusCardsOptimized';
import { Button } from '@/components/ui/button';
import { getJobStats } from '@/lib/api';
import Loading from '@/components/ui/loading';

const GoalsPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [todayApplications, setTodayApplications] = useState(0);
  const [todayStudies, setTodayStudies] = useState(0);

  const dailyGoal = 20;
  const studyGoal = 2;

  useEffect(() => {
    const fetchData = async () => {
      const data = await getJobStats();
      setStats(data);
      setTodayApplications(data?.recentApplications ?? 0);
      setTodayStudies(data?.byType?.STUDY ?? 0);
    };
    fetchData();
  }, []);

  if (!stats) {
    return <Loading message='Carregando...' />;
  }

  return (
    <div className='max-w-7xl mx-auto p-4 flex flex-col gap-6'>
      {/* Cabeçalho */}
      <div>
        <h1 className='text-2xl font-bold text-[color:var(--color-primary)]'>Dashboard de Metas</h1>
        <p className='text-[color:var(--color-muted-foreground)] mt-1 text-sm'>
          Acompanhe seu progresso diário de candidaturas e estudos
        </p>
      </div>

      {/* Metas Diárias */}
      <div className='bg-[color:var(--color-card)] p-4 rounded-xl border border-[color:var(--color-border)]'>
        <h2 className='text-lg font-semibold mb-3'>Metas diárias</h2>

        <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
          {/* Meta de candidaturas */}
          <div className='flex items-center gap-3'>
            <span className='text-4xl font-bold text-[color:var(--color-primary)]'>
              {todayApplications}
            </span>
            <span className='text-lg'>/ {dailyGoal} vagas</span>
            <span
              className={`ml-2 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                todayApplications >= dailyGoal
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {todayApplications >= dailyGoal ? (
                <span className='inline-flex items-center gap-1'>
                  <svg width='18' height='18' viewBox='0 0 20 20' fill='none'>
                    <circle cx='10' cy='10' r='10' fill='#22c55e' />
                    <path
                      d='M6 10.5l2.5 2.5L14 7.5'
                      stroke='#fff'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                  <span>Meta atingida!</span>
                </span>
              ) : (
                <span className='inline-flex items-center gap-1'>
                  <svg width='18' height='18' viewBox='0 0 20 20' fill='none'>
                    <circle cx='10' cy='10' r='10' fill='#ef4444' />
                    <path
                      d='M7 7l6 6M13 7l-6 6'
                      stroke='#fff'
                      strokeWidth='2'
                      strokeLinecap='round'
                    />
                  </svg>
                  <span>Continue se candidatando!</span>
                </span>
              )}
            </span>
            {todayApplications < dailyGoal && (
              <Button className='ml-3'>Candidatar-se a mais vagas</Button>
            )}
          </div>

          {/* Meta de estudos */}
          <div className='flex items-center gap-3'>
            <span className='text-4xl font-bold text-blue-600'>{todayStudies}</span>
            <span className='text-lg'>/ {studyGoal} estudos</span>
            <span
              className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                todayStudies >= studyGoal
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {todayStudies >= studyGoal
                ? 'Meta de estudos atingida!'
                : 'Estude mais hoje!'}
            </span>
          </div>
        </div>
      </div>

      {/* Cards de Status (agora acima dos gráficos) */}
      <StatusCards stats={stats} />

      {/* Gráficos e Cards abaixo dos Status */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Gráfico de Vagas */}
        <div className='flex flex-col bg-[color:var(--color-card)] rounded-xl border border-[color:var(--color-border)] p-4 w-full h-full'>
          <JobsChart stats={stats} />
        </div>

        {/* Card de Estudos */}
        <div className='bg-[color:var(--color-card)] p-4 rounded-xl border border-[color:var(--color-border)] flex flex-col justify-between w-full'>
          <div className='mb-3'>
            <h3 className='text-lg font-semibold text-[color:var(--color-card-foreground)]'>
              Estudos Realizados
            </h3>
            <p className='text-sm text-[color:var(--color-muted-foreground)]'>
              Total: {stats.byType?.STUDY ?? 0} estudos
            </p>
          </div>
          <div className='flex items-center justify-center flex-1'>
            <span className='text-5xl font-bold text-blue-600'>
              {stats.byType?.STUDY ?? 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;

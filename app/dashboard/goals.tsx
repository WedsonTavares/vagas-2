import React from 'react';
import JobsChart from '@/components/charts/JobsChart';
import StatusCards from '@/components/stats/StatusCardsOptimized';
import { Button } from '@/components/ui/button';

export default function GoalsDashboard() {
  // Meta fixa: 10 candidaturas por dia
  const dailyGoal = 10;
  // Exemplo de progresso (substituir por dados reais)
  const todayApplications = 7;

  return (
    <div className='max-w-7xl mx-auto p-4'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-[color:var(--color-primary)]'>Dashboard de Metas</h1>
        <p className='text-[color:var(--color-muted-foreground)] mt-1 text-sm'>Acompanhe seu progresso diário de candidaturas</p>
      </div>
      <div className='bg-[color:var(--color-card)] p-6 rounded-xl border border-[color:var(--color-border)] mb-6'>
        <h2 className='text-lg font-semibold mb-2'>Meta diária</h2>
        <div className='flex items-center gap-4'>
          <span className='text-4xl font-bold text-[color:var(--color-primary)]'>{todayApplications}</span>
          <span className='text-lg'>/ {dailyGoal} vagas</span>
          <span className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${todayApplications >= dailyGoal ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {todayApplications >= dailyGoal ? 'Meta atingida!' : 'Continue se candidatando!'}
          </span>
        </div>
        <Button className='mt-4'>Candidatar-se a mais vagas</Button>
      </div>
      {/* Cards de status e gráfico de stats */}
      <StatusCards stats={{ byStatus: { APPLIED: 5, TEST_PENDING: 2, TEST_COMPLETED: 1, INTERVIEW: 0, ACCEPTED: 0 } }} />
      <JobsChart stats={{ byStatus: { APPLIED: 5, TEST_PENDING: 2, TEST_COMPLETED: 1, INTERVIEW: 0, ACCEPTED: 0 } }} />
    </div>
  );
}

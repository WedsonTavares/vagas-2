'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface JobStats {
  byStatus: Record<string, number>;
}

interface StatusCardsProps {
  stats: JobStats;
}

const StatusCards: React.FC<StatusCardsProps> = ({ stats }) => {
  const router = useRouter();

  const navigateToJobsWithFilter = (status?: string) => {
    if (status) {
      router.push(`/dashboard/jobs?status=${status}`);
    } else {
      router.push('/dashboard/jobs');
    }
  };

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6'>
      {/* Candidatura Enviada */}
      <button
        onClick={() => navigateToJobsWithFilter('APPLIED')}
        className='bg-[color:var(--color-card)] p-3 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-left group'
      >
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-xs font-medium text-[color:var(--color-muted-foreground)] group-hover:text-blue-600'>
              Candidatura Enviada
            </p>
            <p className='text-2xl font-bold text-blue-600'>
              {stats.byStatus.APPLIED || 0}
            </p>
          </div>
          <div className='text-2xl'>📝</div>
        </div>
      </button>

      {/* Teste Pendente */}
      <button
        onClick={() => navigateToJobsWithFilter('TEST_PENDING')}
        className='bg-[color:var(--color-card)] p-3 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-yellow-300 transition-all duration-200 text-left group'
      >
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-xs font-medium text-[color:var(--color-muted-foreground)] group-hover:text-yellow-600'>
              Teste Pendente
            </p>
            <p className='text-2xl font-bold text-yellow-600'>
              {stats.byStatus.TEST_PENDING || 0}
            </p>
          </div>
          <div className='text-2xl'>⏳</div>
        </div>
      </button>

      {/* Teste Concluído */}
      <button
        onClick={() => navigateToJobsWithFilter('TEST_COMPLETED')}
        className='bg-[color:var(--color-card)] p-3 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-orange-300 transition-all duration-200 text-left group'
      >
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-xs font-medium text-[color:var(--color-muted-foreground)] group-hover:text-orange-600'>
              Teste Concluído
            </p>
            <p className='text-2xl font-bold text-orange-600'>
              {stats.byStatus.TEST_COMPLETED || 0}
            </p>
          </div>
          <div className='text-2xl'>✅</div>
        </div>
      </button>

      {/* Em Entrevista */}
      <button
        onClick={() => navigateToJobsWithFilter('INTERVIEW')}
        className='bg-[color:var(--color-card)] p-3 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-purple-300 transition-all duration-200 text-left group'
      >
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-xs font-medium text-[color:var(--color-muted-foreground)] group-hover:text-purple-600'>
              Em Entrevista
            </p>
            <p className='text-2xl font-bold text-purple-600'>
              {stats.byStatus.INTERVIEW || 0}
            </p>
          </div>
          <div className='text-2xl'>�</div>
        </div>
      </button>

      {/* Aceitas */}
      <button
        onClick={() => navigateToJobsWithFilter('ACCEPTED')}
        className='bg-[color:var(--color-card)] p-3 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-green-300 transition-all duration-200 text-left group'
      >
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-xs font-medium text-[color:var(--color-muted-foreground)] group-hover:text-green-600'>
              Aceitas
            </p>
            <p className='text-2xl font-bold text-green-600'>
              {stats.byStatus.ACCEPTED || 0}
            </p>
          </div>
          <div className='text-2xl'>🎉</div>
        </div>
      </button>
    </div>
  );
};

export default StatusCards;

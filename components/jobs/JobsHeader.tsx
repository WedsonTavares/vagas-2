import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface JobsHeaderProps {
  totalJobs: number;
  filteredJobs: number;
  searchTerm: string;
  statusFilter?: string | null;
}

const JobsHeader: React.FC<JobsHeaderProps> = ({
  totalJobs,
  filteredJobs,
  searchTerm,
  statusFilter,
}) => {
  const router = useRouter();

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      APPLIED: 'Candidatura Enviada',
      TEST_PENDING: 'Teste Pendente',
      TEST_COMPLETED: 'Teste Concluído',
      INTERVIEW: 'Em Entrevista',
      ACCEPTED: 'Aceitas',
      REJECTED: 'Rejeitadas',
    };
    return labels[status] || status;
  };

  const clearFilters = () => {
    router.push('/dashboard/candidaturas/jobs');
  };

  return (
    <div className='flex justify-between items-center mb-8'>
      <div>
        <h1 className='text-3xl font-bold text-[color:var(--color-primary)]'>
          Minhas Vagas
        </h1>
        <div className='mt-2 space-y-1'>
          <p className='text-[color:var(--color-muted-foreground)]'>
            {searchTerm || statusFilter ? (
              <>
                {filteredJobs} de {totalJobs} vaga{totalJobs !== 1 ? 's' : ''}
                {filteredJobs !== totalJobs && (
                  <span className='text-[color:var(--color-primary)]'>
                    {' '}
                    {filteredJobs !== 1 ? 's' : ''}
                  </span>
                )}
              </>
            ) : (
              `${totalJobs} vaga${totalJobs !== 1 ? 's' : ''} encontrada${totalJobs !== 1 ? 's' : ''}`
            )}
          </p>
          {statusFilter && (
            <div className='flex items-center gap-3'>
              <span className='text-xs bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary)] px-3 py-1.5 rounded-full font-medium'>
                {getStatusLabel(statusFilter)}
              </span>
              <button
                onClick={clearFilters}
                className='text-xs bg-[color:var(--color-muted)]/10 hover:bg-[color:var(--color-muted)]/20 text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)] px-3 py-1.5 rounded-full transition-all duration-200 font-medium flex items-center gap-1'
              >
                <span>×</span>
                Limpar filtros
              </button>
            </div>
          )}
        </div>
      </div>
      <Button
        onClick={() => router.push('/dashboard/candidaturas/add-job')}
        className='bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary)]/90'
      >
        + Nova Vaga
      </Button>
    </div>
  );
};

export default JobsHeader;

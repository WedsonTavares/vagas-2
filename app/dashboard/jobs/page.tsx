'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from 'react';
import { getJobs, deleteJob, updateJob } from '@/lib/api';
import { Job, JobStatus } from '@/types';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { useConfirmation } from '@/components/ui/confirmation';
import JobsHeader from '@/components/jobs/JobsHeader';
import JobsSearchAndEmpty from '@/components/jobs/JobsSearchAndEmpty';
import JobCard from '@/components/jobs/JobCard';
import JobEditModal from '@/components/jobs/JobEditModal';
import Loading from '@/components/ui/loading';

// ========================================
// INTERFACES E TIPOS
// ========================================

interface JobsState {
  jobs: Job[];
  searchTerm: string;
  loading: boolean;
  expandedCards: Set<string>;
}

interface EditModalState {
  editingJob: Job | null;
  editFormData: Partial<Job>;
  isOpen: boolean;
}

const JobsPageContent = () => {
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { confirm } = useConfirmation();

  const statusFilter = searchParams ? (searchParams.get('status') as JobStatus | undefined) : undefined;

  const [jobsState, setJobsState] = useState<JobsState>({
    jobs: [],
    loading: true,
    searchTerm: '',
    expandedCards: new Set<string>(),
  });

  const [editModalState, setEditModalState] = useState<EditModalState>({
    editingJob: null,
    editFormData: {},
    isOpen: false,
  });

  const toggleCard = useCallback((jobId: string) => {
    setJobsState(prev => {
      const newExpanded = new Set(prev.expandedCards);
      if (newExpanded.has(jobId)) {
        newExpanded.delete(jobId);
      } else {
        newExpanded.add(jobId);
      }
      return {
        ...prev,
        expandedCards: newExpanded,
      };
    });
  }, []);

  const loadJobs = useCallback(async () => {
    try {
      setJobsState(prev => ({ ...prev, loading: true }));
      const filters = statusFilter ? { status: statusFilter } : {};
      const data = await getJobs(filters);
      setJobsState(prev => ({
        ...prev,
        jobs: data,
        loading: false,
      }));
    } catch {
      setJobsState(prev => ({ ...prev, loading: false }));
      addToast({
        type: 'error',
        title: 'Erro ao carregar vagas',
        description: 'Não foi possível carregar as vagas. Tente novamente.',
      });
    }
  }, [statusFilter, addToast]);

  const filterJobs = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (jobs: Job[], searchTerm: string, statusFilter?: JobStatus): Job[] => {
      let filtered = jobs;
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter((job: Job) => {
          const titleMatch = job.title.toLowerCase().includes(searchLower);
          const companyMatch = job.company.toLowerCase().includes(searchLower);
          const locationMatch =
            job.location?.toLowerCase().includes(searchLower) || false;
          return titleMatch || companyMatch || locationMatch;
        });
      }
      return filtered;
    },
    []
  );

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleStatusChange = useCallback(
    async (jobId: string, newStatus: JobStatus) => {
      try {
        if (newStatus === JobStatus.REJECTED) {
          const job = jobsState.jobs.find((j: Job) => j.id === jobId);
          if (job) {
            const confirmed = await confirm({
              title: 'Rejeitar e Excluir Vaga',
              description: `A vaga "${job.title}" será automaticamente excluída ao ser rejeitada. Esta ação não pode ser desfeita. Deseja continuar?`,
              confirmLabel: 'Sim, Rejeitar e Excluir',
              cancelLabel: 'Cancelar',
              type: 'danger',
            });
            if (confirmed) {
              await deleteJob(jobId);
              await loadJobs();
              addToast({
                type: 'success',
                title: 'Vaga rejeitada e excluída',
                description: `A vaga "${job.title}" foi rejeitada e removida automaticamente.`,
              });
            }
          }
          return;
        }
        await updateJob(jobId, { status: newStatus });
        await loadJobs();
        addToast({
          type: 'success',
          title: 'Status atualizado',
          description: `Status da vaga alterado para "${getStatusLabel(newStatus)}"`,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Erro ao atualizar status:', error);
        addToast({
          type: 'error',
          title: 'Erro ao atualizar status',
          description:
            'Não foi possível atualizar o status da vaga. Tente novamente.',
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jobsState.jobs, confirm, addToast, loadJobs]
  );

  const handleDelete = useCallback(
    async (jobId: string, jobTitle: string) => {
      const job = jobsState.jobs.find((j: Job) => j.id === jobId);
      const isRejected = job?.status === JobStatus.REJECTED;
      const confirmed = await confirm({
        title: isRejected ? 'Remover do Histórico' : 'Excluir Vaga',
        description: isRejected
          ? `Tem certeza que deseja remover a vaga "${jobTitle}" do histórico de rejeitadas? Esta ação não pode ser desfeita.`
          : `Tem certeza que deseja excluir a vaga "${jobTitle}"? Esta ação não pode ser desfeita.`,
        confirmLabel: isRejected ? 'Sim, Remover' : 'Sim, Excluir',
        cancelLabel: 'Cancelar',
        type: 'danger',
      });
      if (confirmed) {
        try {
          await deleteJob(jobId);
          await loadJobs();
          addToast({
            type: 'success',
            title: isRejected ? 'Removida do histórico' : 'Vaga excluída',
            description: isRejected
              ? `A vaga "${jobTitle}" foi removida do histórico com sucesso.`
              : `A vaga "${jobTitle}" foi excluída com sucesso.`,
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Erro ao excluir vaga:', error);
          addToast({
            type: 'error',
            title: isRejected
              ? 'Erro ao remover do histórico'
              : 'Erro ao excluir vaga',
            description: isRejected
              ? 'Não foi possível remover a vaga do histórico. Tente novamente.'
              : 'Não foi possível excluir a vaga. Tente novamente.',
          });
        }
      }
    },
    [jobsState.jobs, confirm, addToast, loadJobs]
  );

  const handleEdit = useCallback((job: Job) => {
    setEditModalState({
      editingJob: job,
      editFormData: job,
      isOpen: true,
    });
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editModalState.editingJob) return;
    try {
      const dataToUpdate = {
        ...editModalState.editFormData,
        appliedAt:
          editModalState.editFormData.appliedAt instanceof Date
            ? editModalState.editFormData.appliedAt.toISOString()
            : editModalState.editFormData.appliedAt,
      };
      await updateJob(editModalState.editingJob.id, dataToUpdate);
      await loadJobs();
      setEditModalState({
        editingJob: null,
        editFormData: {},
        isOpen: false,
      });
      addToast({
        type: 'success',
        title: 'Vaga atualizada',
        description: `A vaga "${editModalState.editFormData.title}" foi atualizada com sucesso.`,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erro ao atualizar vaga:', error);
      addToast({
        type: 'error',
        title: 'Erro ao atualizar vaga',
        description: 'Não foi possível atualizar a vaga. Tente novamente.',
      });
    }
  }, [editModalState, addToast, loadJobs]);

  const handleCancelEdit = useCallback(() => {
    setEditModalState({
      editingJob: null,
      editFormData: {},
      isOpen: false,
    });
  }, []);

  const getStatusLabel = useCallback((status: JobStatus): string => {
    const statusLabels = {
      [JobStatus.APPLIED]: 'Candidatura Enviada',
      [JobStatus.TEST_PENDING]: 'Teste Pendente',
      [JobStatus.TEST_COMPLETED]: 'Teste Concluído',
      [JobStatus.INTERVIEW]: 'Em Entrevista',
      [JobStatus.ACCEPTED]: 'Aceito',
      [JobStatus.REJECTED]: 'Rejeitado',
    };
    return statusLabels[status] || status;
  }, []);

  const handleSearchTermChange = useCallback((term: string) => {
    setJobsState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const filteredJobs = useMemo(() => {
    return filterJobs(
      jobsState.jobs,
      jobsState.searchTerm,
      statusFilter
    );
  }, [jobsState.jobs, jobsState.searchTerm, statusFilter, filterJobs]);

  const totalJobs = useMemo(() => jobsState.jobs.length, [jobsState.jobs]);

  const searchTerm = jobsState.searchTerm;
  const loading = jobsState.loading;
  const expandedCards = jobsState.expandedCards;
  const jobs = jobsState.jobs;

  const setSearchTerm = handleSearchTermChange;
  const editingJob = editModalState.editingJob;
  const editFormData = editModalState.editFormData;
  const isEditModalOpen = editModalState.isOpen;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setEditFormData = useCallback((data: any) => {
    setEditModalState(prev => ({ ...prev, editFormData: data }));
  }, []);

  if (loading) {
    return <Loading message='Carregando...' />;
  }

  return (
    <div className='max-w-7xl mx-auto p-6'>
      <JobsHeader
        totalJobs={totalJobs}
        filteredJobs={filteredJobs.length}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
      />

      <JobsSearchAndEmpty
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        hasJobs={jobs.length > 0}
        filteredJobsCount={filteredJobs.length}
      />

      {filteredJobs.length > 0 && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4'>
          {filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              isExpanded={expandedCards.has(job.id)}
              onToggleCard={toggleCard}
              onStatusChange={handleStatusChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <JobEditModal
        isOpen={isEditModalOpen}
        editingJob={editingJob}
        editFormData={editFormData}
        onFormDataChange={setEditFormData}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    </div>
  );
};

const JobsPageFallback = () => <Loading message='Carregando página...' />;

const JobsPage = () => {
  return (
    <Suspense fallback={<JobsPageFallback />}>
      <JobsPageContent />
    </Suspense>
  );
};

// eslint-disable-next-line prettier/prettier
export default JobsPage;
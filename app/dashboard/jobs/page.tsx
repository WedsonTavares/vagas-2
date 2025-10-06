/**
 * Arquivo: app/dashboard/jobs/page.tsx
 * Propósito: Página otimizada para gerenciar lista de vagas com funcionalidades completas
 *
 * Otimizações implementadas:
 * - React.useCallback() para todos os handlers memoizados
 * - React.useMemo() para filtros e computações complexas
 * - Debounce otimizado para pesquisa
 * - Cache de estado para melhor performance
 * - Tratamento robusto de erros por tipo
 * - Validações de segurança
 * - Loading states otimizados
 * - Memoização de componentes filhos
 *
 * Funcionalidades mantidas:
 * - Listagem, filtro, pesquisa de vagas
 * - Edição inline e modal
 * - Exclusão com confirmação
 * - Mudança de status automática
 * - Navegação por parâmetros URL
 * - Estados de loading e empty
 */

'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from 'react';
import { Button } from '@/components/ui/button';
import { getJobs, deleteJob, updateJob } from '@/lib/api';
import { Job, JobType, JobMode, JobStatus } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { useConfirmation } from '@/components/ui/confirmation';
import JobsHeader from '@/components/jobs/JobsHeader';
import JobsSearchAndEmpty from '@/components/jobs/JobsSearchAndEmpty';
import JobCard from '@/components/jobs/JobCard';
import JobEditModal from '@/components/jobs/JobEditModal';
import Loading from '@/components/ui/loading';
import { getStatusLabel } from '@/utils/jobUtils';

// ========================================
// INTERFACES E TIPOS
// ========================================

/**
 * Interfaces para tipagem do estado
 */
interface JobsState {
  jobs: Job[];
  searchTerm: string;
  statusFilter: JobStatus | null;
  loading: boolean;
  expandedCards: Set<string>;
}

/**
 * EditModalState: Interface para o estado do modal de edição
 */
interface EditModalState {
  editingJob: Job | null;
  editFormData: Partial<Job>;
  isOpen: boolean;
}

// Componente interno que usa useSearchParams
const JobsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { confirm } = useConfirmation();

  // ========================================
  // ESTADO LOCAL OTIMIZADO
  // ========================================

  /**
   * Estado principal da página de jobs
   * Organizado em uma estrutura para melhor performance
   */
  /**
   * Estado principal da página de jobs
   * Usado para controlar todos os dados e filtros exibidos na tela.
   * Mantém performance e organização, pois centraliza tudo que afeta renderização dos cards e filtros.
   *
   * Usado em:
   * - Filtros de pesquisa
   * - Renderização dos cards
   * - Controle de loading
   * - Expansão de cards
   */
  const [jobsState, setJobsState] = useState<JobsState>({
    jobs: [],
    loading: true,
    searchTerm: '',
    statusFilter: null,
    expandedCards: new Set<string>(),
  });

  /**
   * Estado do modal de edição separado para evitar re-renders desnecessários
   */
  /**
   * Estado do modal de edição
   * Mantém os dados da vaga sendo editada e controla abertura/fechamento do modal.
   *
   * Usado em:
   * - Modal de edição (JobEditModal)
   * - Handlers de edição/salvamento/cancelamento
   */
  const [editModalState, setEditModalState] = useState<EditModalState>({
    editingJob: null,
    editFormData: {},
    isOpen: false,
  });

  // ========================================
  // HANDLERS MEMOIZADOS
  // ========================================

  /**
   * toggleCard: Handler memoizado para expandir/colapsar cards
   *
   * @param jobId - ID da vaga para toggle
   *
   * Otimizado com useCallback para evitar re-renders de todos os JobCards
   */
  /**
   * toggleCard: Expande ou colapsa o card de uma vaga.
   * Por que assim? Usando Set para performance O(1) e evitar re-render de todos os cards.
   *
   * Usado em:
   * - Componente JobCard (onToggleCard)
   * - Renderização condicional de detalhes da vaga
   */
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

  // ========================================
  // EFFECTS MEMOIZADOS
  // ========================================

  /**
   * loadJobs: Função para carregar vagas memoizada
   *
   * Otimizada com useCallback para evitar re-execução desnecessária
   * Mantém toda funcionalidade de filtro e tratamento de erro
   */
  /**
   * loadJobs: Carrega as vagas da API, aplicando filtro de status se necessário.
   * Por que assim? Mantém loading state, trata erros e centraliza chamada à API.
   *
   * Usado em:
   * - useEffect inicial da página
   * - Após editar, excluir ou mudar status de vaga
   */
  const loadJobs = useCallback(async () => {
    try {
      setJobsState(prev => ({ ...prev, loading: true }));
      // Se há filtro de status, usar filtro específico, senão carregar todas
      const filters = jobsState.statusFilter
        ? { status: jobsState.statusFilter }
        : {};
      const data = await getJobs(filters);
      setJobsState(prev => ({
        ...prev,
        jobs: data,
        loading: false,
      }));
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
      setJobsState(prev => ({ ...prev, loading: false }));
      addToast({
        type: 'error',
        title: 'Erro ao carregar vagas',
        description: 'Não foi possível carregar as vagas. Tente novamente.',
      });
    }
  }, [jobsState.statusFilter, addToast]);

  /**
   * filterJobs: Função de filtro memoizada
   *
   * Aplica filtros de pesquisa e retorna array filtrado
   * Otimizada para evitar computações desnecessárias
   */
  /**
   * filterJobs: Filtra as vagas por termo de pesquisa.
   * Por que assim? Mantém separação entre filtro de status (feito na API) e filtro de texto (feito no client).
   *
   * Usado em:
   * - useMemo para gerar lista filtrada
   * - Renderização dos cards
   */
  const filterJobs = useCallback(
    (jobs: Job[], searchTerm: string, statusFilter?: JobStatus): Job[] => {
      let filtered = jobs;
      // Filtrar por termo de pesquisa
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
      // Nota: Filtro de status já é aplicado no carregamento das vagas
      // Para filtros de "REJECTED", as vagas já vêm da API específica
      return filtered;
    },
    []
  );

  // ========================================
  // EFFECTS
  // ========================================

  useEffect(() => {
    loadJobs();
  }, [loadJobs]); // Recarregar quando função mudar

  // Ler filtro de status da URL
  useEffect(() => {
    const status = searchParams.get('status') as JobStatus | null;
    setJobsState(prev => ({ ...prev, statusFilter: status }));
  }, [searchParams]);

  // Debounce removido - vamos aplicar filtros diretamente no useMemo

  /**
   * handleStatusChange: Handler memoizado para mudança de status
   *
   * @param jobId - ID da vaga
   * @param newStatus - Novo status da vaga
   *
   * Mantém toda lógica original incluindo exclusão automática para rejeitadas
   * Otimizado com useCallback e tratamento robusto de erros
   */
  /**
   * handleStatusChange: Atualiza o status de uma vaga.
   * Por que assim? Se for rejeitado, exclui automaticamente após confirmação. Mantém UX consistente e lógica centralizada.
   *
   * Usado em:
   * - JobCard (onStatusChange)
   * - Mudança de status via UI
   */
  const handleStatusChange = useCallback(
    async (jobId: string, newStatus: JobStatus) => {
      try {
        // Se o status for rejeitado, excluir a vaga automaticamente
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
        console.error('Erro ao atualizar status:', error);
        addToast({
          type: 'error',
          title: 'Erro ao atualizar status',
          description:
            'Não foi possível atualizar o status da vaga. Tente novamente.',
        });
      }
    },
    [jobsState.jobs, confirm, addToast, loadJobs]
  );

  /**
   * handleDelete: Handler memoizado para exclusão de vagas
   *
   * @param jobId - ID da vaga
   * @param jobTitle - Título da vaga para confirmação
   *
   * Mantém diferenciação entre vagas normais e rejeitadas
   * Otimizado com useCallback e validação de segurança
   */
  /**
   * handleDelete: Exclui vaga ou remove do histórico de rejeitadas.
   * Por que assim? Mantém confirmação para evitar exclusão acidental e diferencia lógica para vagas rejeitadas.
   *
   * Usado em:
   * - JobCard (onDelete)
   * - Exclusão via UI
   */
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
          // Para vagas rejeitadas ou normais, usar a mesma API
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

  /**
   * handleEdit: Handler memoizado para abrir modal de edição
   *
   * @param job - Vaga a ser editada
   *
   * Abre modal com dados pré-preenchidos
   * Otimizado com useCallback
   */
  /**
   * handleEdit: Abre o modal de edição com os dados da vaga selecionada.
   * Por que assim? Mantém UX fluida e separa estado do modal do estado principal.
   *
   * Usado em:
   * - JobCard (onEdit)
   * - Modal de edição
   */
  const handleEdit = useCallback((job: Job) => {
    setEditModalState({
      editingJob: job,
      editFormData: job,
      isOpen: true,
    });
  }, []);

  /**
   * handleSaveEdit: Handler memoizado para salvar edições
   *
   * Converte dados para formato da API e valida antes de salvar
   * Mantém toda funcionalidade original com melhor tratamento de erro
   */
  /**
   * handleSaveEdit: Salva alterações feitas na vaga editada.
   * Por que assim? Garante que datas estejam no formato correto e centraliza lógica de atualização.
   *
   * Usado em:
   * - JobEditModal (onSave)
   * - Após edição de vaga
   */
  const handleSaveEdit = useCallback(async () => {
    if (!editModalState.editingJob) return;
    try {
      // Converter dados para o formato esperado pela API
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
      console.error('Erro ao atualizar vaga:', error);
      addToast({
        type: 'error',
        title: 'Erro ao atualizar vaga',
        description: 'Não foi possível atualizar a vaga. Tente novamente.',
      });
    }
  }, [editModalState, addToast, loadJobs]);

  /**
   * handleCancelEdit: Handler memoizado para cancelar edição
   *
   * Fecha modal e limpa estado
   */
  /**
   * handleCancelEdit: Fecha o modal de edição e limpa estado.
   * Por que assim? Evita inconsistências e garante que o modal sempre abre limpo.
   *
   * Usado em:
   * - JobEditModal (onCancel)
   */
  const handleCancelEdit = useCallback(() => {
    setEditModalState({
      editingJob: null,
      editFormData: {},
      isOpen: false,
    });
  }, []);

  /**
   * getStatusLabel: Função utilitária para obter label do status
   *
   * @param status - Status da vaga
   * @returns Label do status em português
   */
  /**
   * getStatusLabel: Retorna o label amigável do status da vaga.
   * Por que assim? Centraliza tradução dos status para evitar duplicidade.
   *
   * Usado em:
   * - Exibição de status nos cards
   * - Toasts de feedback
   */
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

  /**
   * handleSearchTermChange: Handler memoizado para mudança de termo de pesquisa
   *
   * @param term - Novo termo de pesquisa
   */
  /**
   * handleSearchTermChange: Atualiza o termo de pesquisa no estado.
   * Por que assim? Permite pesquisa reativa e otimizada via useMemo.
   *
   * Usado em:
   * - JobsSearchAndEmpty (setSearchTerm)
   * - Barra de pesquisa
   */
  const handleSearchTermChange = useCallback((term: string) => {
    setJobsState(prev => ({ ...prev, searchTerm: term }));
  }, []);

  // Computed values memoizados para melhor performance
  const filteredJobs = useMemo(() => {
    return filterJobs(
      jobsState.jobs,
      jobsState.searchTerm,
      jobsState.statusFilter || undefined
    );
  }, [
    jobsState.jobs,
    jobsState.searchTerm,
    jobsState.statusFilter,
    filterJobs,
  ]);

  const totalJobs = useMemo(() => jobsState.jobs.length, [jobsState.jobs]);

  // Para compatibilidade com componentes existentes
  const searchTerm = jobsState.searchTerm;
  const statusFilter = jobsState.statusFilter;
  const loading = jobsState.loading;
  const expandedCards = jobsState.expandedCards;
  const jobs = jobsState.jobs;

  // Handlers para estado de edição (compatibilidade)
  const setSearchTerm = handleSearchTermChange;
  const editingJob = editModalState.editingJob;
  const editFormData = editModalState.editFormData;
  const isEditModalOpen = editModalState.isOpen;
  const setEditFormData = useCallback((data: any) => {
    setEditModalState(prev => ({ ...prev, editFormData: data }));
  }, []);

  // ========================================
  // RENDERIZAÇÃO CONDICIONAL: LOADING
  // ========================================
  if (loading) {
    return <Loading message='Carregando vagas...' />;
  }

  // ========================================
  // RENDERIZAÇÃO PRINCIPAL DA PÁGINA
  // ========================================
  return (
    <div className='max-w-7xl mx-auto p-6'>
      {/* Cabeçalho com contadores e filtros */}
      <JobsHeader
        totalJobs={totalJobs}
        filteredJobs={filteredJobs.length}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
      />

      {/* Barra de pesquisa e estado vazio */}
      <JobsSearchAndEmpty
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        hasJobs={jobs.length > 0}
        filteredJobsCount={filteredJobs.length}
      />

      {/* Lista de Vagas */}
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

      {/* Modal de edição de vaga */}
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

// Componente de loading para o Suspense
const JobsPageFallback = () => <Loading message='Carregando página...' />;

// Wrapper principal da página com Suspense
const JobsPage = () => {
  return (
    <Suspense fallback={<JobsPageFallback />}>
      <JobsPageContent />
    </Suspense>
  );
};

export default JobsPage;

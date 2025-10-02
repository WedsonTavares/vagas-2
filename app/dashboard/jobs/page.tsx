'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getJobs, deleteJob, updateJob } from '@/lib/api'
import { Job, JobType, JobMode, JobStatus } from '@/types'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { useConfirmation } from '@/components/ui/confirmation'

const JobsPage = () => {
  const router = useRouter()
  const { addToast } = useToast()
  const { confirm } = useConfirmation()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [totalJobs, setTotalJobs] = useState(0)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<Job>>({})
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const toggleCard = (jobId: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId)
    } else {
      newExpanded.add(jobId)
    }
    setExpandedCards(newExpanded)
  }

  useEffect(() => {
    loadJobs()
  }, [])

  // Debounce para o filtro de pesquisa
  useEffect(() => {
    const timer = setTimeout(() => {
      filterJobs()
    }, 300) // 300ms de debounce

    return () => clearTimeout(timer)
  }, [searchTerm, jobs])

  const loadJobs = async () => {
    try {
      setLoading(true)
      // Carrega todas as vagas sem filtros (otimizado)
      const data = await getJobs({})
      setJobs(data)
      setTotalJobs(data.length)
      setFilteredJobs(data) // Inicialmente mostra todas
    } catch (error) {
      console.error('Erro ao carregar vagas:', error)
      addToast({
        type: 'error',
        title: 'Erro ao carregar vagas',
        description: 'Não foi possível carregar as vagas. Tente novamente.'
      })
    } finally {
      setLoading(false)
    }
  }

  const filterJobs = () => {
    if (!searchTerm.trim()) {
      setFilteredJobs(jobs)
      return
    }

    const filtered = jobs.filter(job => {
      const searchLower = searchTerm.toLowerCase()
      const titleMatch = job.title.toLowerCase().includes(searchLower)
      const companyMatch = job.company.toLowerCase().includes(searchLower)
      return titleMatch || companyMatch
    })

    setFilteredJobs(filtered)
  }

  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    try {
      // Se o status for rejeitado, excluir a vaga automaticamente
      if (newStatus === JobStatus.REJECTED) {
        const job = jobs.find(j => j.id === jobId)
        if (job) {
          const confirmed = await confirm({
            title: 'Rejeitar e Excluir Vaga',
            description: `A vaga "${job.title}" será automaticamente excluída ao ser rejeitada. Esta ação não pode ser desfeita. Deseja continuar?`,
            confirmLabel: 'Sim, Rejeitar e Excluir',
            cancelLabel: 'Cancelar',
            type: 'danger'
          })
          
          if (confirmed) {
            await deleteJob(jobId)
            await loadJobs()
            addToast({
              type: 'success',
              title: 'Vaga rejeitada e excluída',
              description: `A vaga "${job.title}" foi rejeitada e removida automaticamente.`
            })
          }
        }
        return
      }
      
      await updateJob(jobId, { status: newStatus })
      await loadJobs()
      addToast({
        type: 'success',
        title: 'Status atualizado',
        description: `Status da vaga alterado para "${getStatusLabel(newStatus)}"`
      })
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      addToast({
        type: 'error',
        title: 'Erro ao atualizar status',
        description: 'Não foi possível atualizar o status da vaga. Tente novamente.'
      })
    }
  }

  const handleDelete = async (jobId: string, jobTitle: string) => {
    const confirmed = await confirm({
      title: 'Excluir Vaga',
      description: `Tem certeza que deseja excluir a vaga "${jobTitle}"? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Sim, Excluir',
      cancelLabel: 'Cancelar',
      type: 'danger'
    })
    
    if (confirmed) {
      try {
        await deleteJob(jobId)
        await loadJobs()
        addToast({
          type: 'success',
          title: 'Vaga excluída',
          description: `A vaga "${jobTitle}" foi excluída com sucesso.`
        })
      } catch (error) {
        console.error('Erro ao excluir vaga:', error)
        addToast({
          type: 'error',
          title: 'Erro ao excluir vaga',
          description: 'Não foi possível excluir a vaga. Tente novamente.'
        })
      }
    }
  }

  const handleEdit = (job: Job) => {
    setEditingJob(job)
    setEditFormData(job)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingJob) return

    try {
      // Converter dados para o formato esperado pela API
      const dataToUpdate = {
        ...editFormData,
        appliedAt: editFormData.appliedAt instanceof Date 
          ? editFormData.appliedAt.toISOString() 
          : editFormData.appliedAt
      }
      
      await updateJob(editingJob.id, dataToUpdate)
      await loadJobs()
      setIsEditModalOpen(false)
      setEditingJob(null)
      setEditFormData({})
      addToast({
        type: 'success',
        title: 'Vaga atualizada',
        description: `A vaga "${editFormData.title}" foi atualizada com sucesso.`
      })
    } catch (error) {
      console.error('Erro ao atualizar vaga:', error)
      addToast({
        type: 'error',
        title: 'Erro ao atualizar vaga',
        description: 'Não foi possível atualizar a vaga. Tente novamente.'
      })
    }
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
    setEditingJob(null)
    setEditFormData({})
  }

  const getCardBorderColor = (status: JobStatus) => {
    const colors = {
      [JobStatus.PENDING]: 'border-yellow-300 bg-yellow-50/30 dark:border-yellow-600 dark:bg-yellow-900/20',
      [JobStatus.APPLIED]: 'border-blue-300 bg-blue-50/30 dark:border-blue-500 dark:bg-blue-900/20',
      [JobStatus.INTERVIEW]: 'border-purple-300 bg-purple-50/30 dark:border-purple-500 dark:bg-purple-900/20',
      [JobStatus.REJECTED]: 'border-red-300 bg-red-50/30 dark:border-red-500 dark:bg-red-900/20',
      [JobStatus.ACCEPTED]: 'border-green-300 bg-green-50/30 dark:border-green-500 dark:bg-green-900/20',
    }
    return colors[status] || colors[JobStatus.PENDING]
  }

  const getStatusColor = (status: JobStatus) => {
    const colors = {
      [JobStatus.PENDING]: 'text-yellow-600 dark:text-yellow-400',
      [JobStatus.APPLIED]: 'text-blue-600 dark:text-blue-400',
      [JobStatus.INTERVIEW]: 'text-purple-600 dark:text-purple-400',
      [JobStatus.REJECTED]: 'text-red-600 dark:text-red-400',
      [JobStatus.ACCEPTED]: 'text-green-600 dark:text-green-400',
    }
    return colors[status] || colors[JobStatus.PENDING]
  }

  const getStatusLabel = (status: JobStatus) => {
    const labels = {
      [JobStatus.PENDING]: 'Pendente',
      [JobStatus.APPLIED]: 'Candidatura Enviada',
      [JobStatus.INTERVIEW]: 'Em Entrevista',
      [JobStatus.REJECTED]: 'Rejeitado',
      [JobStatus.ACCEPTED]: 'Aceito',
    }
    return labels[status] || status
  }

  const getTypeLabel = (type: JobType) => {
    const labels = {
      [JobType.FULL_TIME]: 'Tempo Integral',
      [JobType.PART_TIME]: 'Meio Período',
      [JobType.CONTRACT]: 'Contrato',
      [JobType.INTERNSHIP]: 'Estágio',
      [JobType.FREELANCE]: 'Freelancer',
    }
    return labels[type] || type
  }

  const getModeLabel = (mode: JobMode) => {
    const labels = {
      [JobMode.REMOTE]: 'Remoto',
      [JobMode.HYBRID]: 'Híbrido',
      [JobMode.ONSITE]: 'Presencial',
    }
    return labels[mode] || mode
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--color-primary)] mx-auto"></div>
          <p className="mt-4 text-[color:var(--color-muted-foreground)]">Carregando vagas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[color:var(--color-primary)]">Minhas Vagas</h1>
          <p className="text-[color:var(--color-muted-foreground)] mt-2">
            {searchTerm ? (
              <>
                {filteredJobs.length} de {totalJobs} vaga{totalJobs !== 1 ? 's' : ''} 
                {filteredJobs.length !== totalJobs && (
                  <span className="text-[color:var(--color-primary)]">
                    (filtrada{filteredJobs.length !== 1 ? 's' : ''})
                  </span>
                )}
              </>
            ) : (
              `${totalJobs} vaga${totalJobs !== 1 ? 's' : ''} encontrada${totalJobs !== 1 ? 's' : ''}`
            )}
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/add-job')}
          className="bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary)]/90"
        >
          + Nova Vaga
        </Button>
      </div>

      {/* Barra de Pesquisa */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-[color:var(--color-muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Pesquisar por nome da vaga ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-[color:var(--color-border)] rounded-md leading-5 bg-[color:var(--color-background)] text-[color:var(--color-foreground)] placeholder-[color:var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] transition-colors"
            />
          </div>
          
          {searchTerm && (
            <Button
              variant="outline"
              onClick={() => setSearchTerm('')}
              className="px-4 py-3 text-sm"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpar
            </Button>
          )}
        </div>
        
        {searchTerm && (
          <div className="mt-3 text-sm text-[color:var(--color-muted-foreground)]">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pesquisando por: <strong>"{searchTerm}"</strong>
            </span>
          </div>
        )}
      </div>

      {/* Lista de Vagas */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-[color:var(--color-card)] rounded-lg border border-[color:var(--color-border)]">
          <div className="text-6xl mb-4">{searchTerm ? '🔍' : '📋'}</div>
          <h3 className="text-xl font-semibold mb-2 text-[color:var(--color-card-foreground)]">
            {searchTerm ? 'Nenhuma vaga encontrada' : 'Nenhuma vaga cadastrada'}
          </h3>
          <p className="text-[color:var(--color-muted-foreground)] mb-6">
            {searchTerm ? (
              <>
                Não encontramos vagas que correspondam à pesquisa 
                <strong>"{searchTerm}"</strong>.
                <br />Tente usar outros termos ou limpe o filtro.
              </>
            ) : (
              'Comece adicionando sua primeira vaga para acompanhar suas candidaturas'
            )}
          </p>
          {searchTerm ? (
            <Button
              onClick={() => setSearchTerm('')}
              variant="outline"
              className="mr-3"
            >
              🔍 Limpar Pesquisa
            </Button>
          ) : null}
          <Button
            onClick={() => router.push('/dashboard/add-job')}
            className="bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary)]/90"
          >
            + {searchTerm ? 'Adicionar Nova Vaga' : 'Adicionar Primeira Vaga'}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredJobs.map((job) => {
            const isExpanded = expandedCards.has(job.id)
            return (
              <div
                key={job.id}
                className={`${isExpanded ? 'md:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-5' : ''} bg-[color:var(--color-card)] rounded-lg border-2 ${getCardBorderColor(job.status)} hover:shadow-lg transition-all duration-200 overflow-hidden`}
              >
                {/* Header Compacto - Sempre Visível */}
                <div 
                  className="p-4 cursor-pointer hover:bg-[color:var(--color-secondary)]/20"
                  onClick={() => toggleCard(job.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`${isExpanded ? 'text-lg' : 'text-sm'} font-semibold text-[color:var(--color-card-foreground)] ${isExpanded ? '' : 'line-clamp-1'}`}>
                      {job.title}
                    </h3>
                    <span className="text-xs text-[color:var(--color-muted-foreground)] ml-2">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </div>
                  
                  <p className={`${isExpanded ? 'text-base' : 'text-sm'} text-[color:var(--color-primary)] font-medium ${isExpanded ? '' : 'line-clamp-1'} mb-2`}>
                    {job.company}
                  </p>
                  
                  {job.location && (
                    <p className={`${isExpanded ? 'text-sm' : 'text-xs'} text-[color:var(--color-muted-foreground)] mb-2 ${isExpanded ? '' : 'line-clamp-1'}`}>
                      📍 {job.location}
                    </p>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {getStatusLabel(job.status)}
                      </span>
                    </div>
                    <span className="text-xs text-[color:var(--color-muted-foreground)]">
                      {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Detalhes Expansíveis - Card Grande */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-[color:var(--color-border)] bg-[color:var(--color-secondary)]/10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                      {/* Coluna Esquerda - Informações Principais */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-[color:var(--color-primary)] mb-2">Informações Básicas</h4>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="px-3 py-1 bg-[color:var(--color-secondary)] text-[color:var(--color-secondary-foreground)] rounded-full text-sm">
                              {getTypeLabel(job.type)}
                            </span>
                            <span className="px-3 py-1 bg-[color:var(--color-secondary)] text-[color:var(--color-secondary-foreground)] rounded-full text-sm">
                              {getModeLabel(job.mode)}
                            </span>
                            {job.salary && (
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium dark:bg-green-900/50 dark:text-green-200">
                                💰 {job.salary}
                              </span>
                            )}
                          </div>
                        </div>

                        {job.description && (
                          <div>
                            <h4 className="text-sm font-semibold text-[color:var(--color-primary)] mb-2">Descrição da Vaga</h4>
                            <p className="text-sm text-[color:var(--color-muted-foreground)] bg-[color:var(--color-background)] p-3 rounded-md">
                              {job.description}
                            </p>
                          </div>
                        )}

                        {job.requirements && (
                          <div>
                            <h4 className="text-sm font-semibold text-[color:var(--color-primary)] mb-2">Requisitos</h4>
                            <p className="text-sm text-[color:var(--color-muted-foreground)] bg-[color:var(--color-background)] p-3 rounded-md">
                              {job.requirements}
                            </p>
                          </div>
                        )}

                        {job.benefits && (
                          <div>
                            <h4 className="text-sm font-semibold text-[color:var(--color-primary)] mb-2">Benefícios</h4>
                            <p className="text-sm text-[color:var(--color-muted-foreground)] bg-[color:var(--color-background)] p-3 rounded-md">
                              {job.benefits}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Coluna Direita - Status e Ações */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-[color:var(--color-primary)] mb-2">Status da Candidatura</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium mb-1 text-[color:var(--color-muted-foreground)]">
                                Alterar Status:
                              </label>
                              <select
                                value={job.status}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  handleStatusChange(job.id, e.target.value as JobStatus)
                                }}
                                className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md text-sm bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                              >
                                <option value={JobStatus.PENDING}>Pendente</option>
                                <option value={JobStatus.APPLIED}>Candidatura Enviada</option>
                                <option value={JobStatus.INTERVIEW}>Em Entrevista</option>
                                <option value={JobStatus.REJECTED}>Rejeitado</option>
                                <option value={JobStatus.ACCEPTED}>Aceito</option>
                              </select>
                            </div>
                            
                            {/* Informações de Data */}
                            <div className="bg-[color:var(--color-background)] p-3 rounded-md border border-[color:var(--color-border)]">
                              <div className="space-y-1 text-xs text-[color:var(--color-muted-foreground)]">
                                <p><strong>Criada em:</strong> {new Date(job.createdAt).toLocaleString('pt-BR')}</p>
                                <p><strong>Última atualização:</strong> {new Date(job.updatedAt).toLocaleString('pt-BR')}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Links da Candidatura */}
                        {(job.applicationUrl || job.applicationEmail) && (
                          <div>
                            <h4 className="text-sm font-semibold text-[color:var(--color-primary)] mb-2">Links da Candidatura</h4>
                            <div className="space-y-2">
                              {job.applicationUrl && (
                                <a
                                  href={job.applicationUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-[color:var(--color-primary)] hover:underline text-sm bg-[color:var(--color-background)] p-2 rounded-md border border-[color:var(--color-border)]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  🔗 Ver Vaga Original
                                </a>
                              )}
                              {job.applicationEmail && (
                                <a
                                  href={`mailto:${job.applicationEmail}`}
                                  className="flex items-center gap-2 text-[color:var(--color-primary)] hover:underline text-sm bg-[color:var(--color-background)] p-2 rounded-md border border-[color:var(--color-border)]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  ✉️ {job.applicationEmail}
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Anotações Pessoais */}
                        {job.notes && (
                          <div>
                            <h4 className="text-sm font-semibold text-[color:var(--color-primary)] mb-2">Anotações Pessoais</h4>
                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md dark:bg-amber-900/30 dark:border-amber-700">
                              <p className="text-sm text-amber-800 dark:text-amber-200">
                                {job.notes}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Botão Excluir - Sempre por último */}
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(job)
                            }}
                            className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                          >
                            ✏️ Editar Vaga
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(job.id, job.title)
                            }}
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            🗑️ Excluir Vaga
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      
      {/* Modal de Edição */}
      {isEditModalOpen && editingJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[color:var(--color-background)] rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[color:var(--color-primary)]">
                  ✏️ Editar Vaga
                </h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)] text-2xl"
                >
                  ×
                </button>
              </div>

              <form className="space-y-6">
                {/* Informações Básicas */}
                <div>
                  <h3 className="text-lg font-semibold text-[color:var(--color-primary)] mb-4">Informações Básicas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[color:var(--color-foreground)]">
                        Título da Vaga *
                      </label>
                      <input
                        type="text"
                        value={editFormData.title || ''}
                        onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                        placeholder="Ex: Desenvolvedor Frontend React"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[color:var(--color-foreground)]">
                        Empresa *
                      </label>
                      <input
                        type="text"
                        value={editFormData.company || ''}
                        onChange={(e) => setEditFormData({...editFormData, company: e.target.value})}
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                        placeholder="Ex: Tech Company LTDA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[color:var(--color-foreground)]">
                        Localização
                      </label>
                      <input
                        type="text"
                        value={editFormData.location || ''}
                        onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                        placeholder="Ex: São Paulo, SP"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[color:var(--color-foreground)]">
                        Salário
                      </label>
                      <input
                        type="text"
                        value={editFormData.salary || ''}
                        onChange={(e) => setEditFormData({...editFormData, salary: e.target.value})}
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                        placeholder="Ex: R$ 8.000 - R$ 12.000"
                      />
                    </div>
                  </div>
                </div>

                {/* Detalhes da Vaga */}
                <div>
                  <h3 className="text-lg font-semibold text-[color:var(--color-primary)] mb-4">Detalhes da Vaga</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[color:var(--color-foreground)]">
                        Descrição da Vaga
                      </label>
                      <textarea
                        value={editFormData.description || ''}
                        onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                        placeholder="Descreva as responsabilidades e atividades da vaga..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[color:var(--color-foreground)]">
                        Requisitos
                      </label>
                      <textarea
                        value={editFormData.requirements || ''}
                        onChange={(e) => setEditFormData({...editFormData, requirements: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                        placeholder="Liste os requisitos técnicos e experiências necessárias..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[color:var(--color-foreground)]">
                        Benefícios
                      </label>
                      <textarea
                        value={editFormData.benefits || ''}
                        onChange={(e) => setEditFormData({...editFormData, benefits: e.target.value})}
                        rows={2}
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                        placeholder="Ex: Vale alimentação, plano de saúde, home office..."
                      />
                    </div>
                  </div>
                </div>

                {/* Informações de Candidatura */}
                <div>
                  <h3 className="text-lg font-semibold text-[color:var(--color-primary)] mb-4">Informações de Candidatura</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[color:var(--color-foreground)]">
                        URL da Vaga
                      </label>
                      <input
                        type="url"
                        value={editFormData.applicationUrl || ''}
                        onChange={(e) => setEditFormData({...editFormData, applicationUrl: e.target.value})}
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                        placeholder="https://empresa.com/vagas/123"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[color:var(--color-foreground)]">
                        Email de Contato
                      </label>
                      <input
                        type="email"
                        value={editFormData.applicationEmail || ''}
                        onChange={(e) => setEditFormData({...editFormData, applicationEmail: e.target.value})}
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                        placeholder="contato@empresa.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Anotações Pessoais */}
                <div>
                  <h3 className="text-lg font-semibold text-[color:var(--color-primary)] mb-4">Anotações Pessoais</h3>
                  <textarea
                    value={editFormData.notes || ''}
                    onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                    placeholder="Suas anotações pessoais sobre esta vaga..."
                  />
                </div>

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={handleSaveEdit}
                    className="flex-1 bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary)]/90"
                  >
                    💾 Salvar Alterações
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex-1"
                  >
                    ❌ Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobsPage

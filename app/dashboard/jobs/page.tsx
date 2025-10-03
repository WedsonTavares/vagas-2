'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getJobs, deleteJob, deleteRejectedJob, updateJob } from '@/lib/api'
import { Job, JobType, JobMode, JobStatus } from '@/types'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { useConfirmation } from '@/components/ui/confirmation'
import JobsHeader from '@/components/jobs/JobsHeader'
import JobsSearchAndEmpty from '@/components/jobs/JobsSearchAndEmpty'
import JobCard from '@/components/jobs/JobCard'
import JobEditModal from '@/components/jobs/JobEditModal'

const JobsPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const { confirm } = useConfirmation()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
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
  }, [statusFilter]) // Recarregar quando statusFilter mudar

  // Ler filtro de status da URL
  useEffect(() => {
    const status = searchParams.get('status')
    setStatusFilter(status)
  }, [searchParams])

  // Debounce para o filtro de pesquisa
  useEffect(() => {
    const timer = setTimeout(() => {
      filterJobs()
    }, 300) // 300ms de debounce

    return () => clearTimeout(timer)
  }, [searchTerm, statusFilter, jobs])

  const loadJobs = async () => {
    try {
      setLoading(true)
      // Se há filtro de status, usar filtro específico, senão carregar todas
      const filters = statusFilter ? { status: statusFilter } : {}
      const data = await getJobs(filters)
      setJobs(data)
      setTotalJobs(data.length)
      setFilteredJobs(data) // Inicialmente mostra todas as carregadas
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
    let filtered = jobs

    // Filtrar por termo de pesquisa
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(job => {
        const titleMatch = job.title.toLowerCase().includes(searchLower)
        const companyMatch = job.company.toLowerCase().includes(searchLower)
        const locationMatch = job.location?.toLowerCase().includes(searchLower) || false
        return titleMatch || companyMatch || locationMatch
      })
    }

    // Nota: Filtro de status já é aplicado no carregamento das vagas
    // Para filtros de "REJECTED", as vagas já vêm da API específica

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
      const statusLabels = {
        [JobStatus.APPLIED]: 'Candidatura Enviada',
        [JobStatus.TEST_PENDING]: 'Teste Pendente',
        [JobStatus.TEST_COMPLETED]: 'Teste Concluído',
        [JobStatus.INTERVIEW]: 'Em Entrevista',
        [JobStatus.ACCEPTED]: 'Aceito',
        [JobStatus.REJECTED]: 'Rejeitado',
      }
      
      addToast({
        type: 'success',
        title: 'Status atualizado',
        description: `Status da vaga alterado para "${statusLabels[newStatus] || newStatus}"`
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
    const job = jobs.find(j => j.id === jobId)
    const isRejected = job?.status === JobStatus.REJECTED
    
    const confirmed = await confirm({
      title: isRejected ? 'Remover do Histórico' : 'Excluir Vaga',
      description: isRejected 
        ? `Tem certeza que deseja remover a vaga "${jobTitle}" do histórico de rejeitadas? Esta ação não pode ser desfeita.`
        : `Tem certeza que deseja excluir a vaga "${jobTitle}"? Esta ação não pode ser desfeita.`,
      confirmLabel: isRejected ? 'Sim, Remover' : 'Sim, Excluir',
      cancelLabel: 'Cancelar',
      type: 'danger'
    })
    
    if (confirmed) {
      try {
        if (isRejected) {
          await deleteRejectedJob(jobId)
        } else {
          await deleteJob(jobId)
        }
        await loadJobs()
        addToast({
          type: 'success',
          title: isRejected ? 'Removida do histórico' : 'Vaga excluída',
          description: isRejected 
            ? `A vaga "${jobTitle}" foi removida do histórico com sucesso.`
            : `A vaga "${jobTitle}" foi excluída com sucesso.`
        })
      } catch (error) {
        console.error('Erro ao excluir vaga:', error)
        addToast({
          type: 'error',
          title: isRejected ? 'Erro ao remover do histórico' : 'Erro ao excluir vaga',
          description: isRejected 
            ? 'Não foi possível remover a vaga do histórico. Tente novamente.'
            : 'Não foi possível excluir a vaga. Tente novamente.'
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

      {/* Lista de Vagas */}
      {filteredJobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filteredJobs.map((job) => (
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
  )
}

export default JobsPage
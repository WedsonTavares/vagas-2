'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getJobStats } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'

interface JobStats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byMode: Record<string, number>;
  recentApplications: number;
  recentJobs: Array<{
    id: string;
    title: string;
    company: string;
    status: string;
    createdAt: string;
  }>;
}

const StatsPage = () => {
  const router = useRouter()
  const { addToast } = useToast()
  const [stats, setStats] = useState<JobStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await getJobStats()
      setStats(data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      addToast({
        type: 'error',
        title: 'Erro ao carregar estatísticas',
        description: 'Não foi possível carregar as estatísticas. Tente novamente.'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'APPLIED': 'bg-blue-100 text-blue-800 border-blue-200',
      'TEST_PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'TEST_COMPLETED': 'bg-orange-100 text-orange-800 border-orange-200',
      'INTERVIEW': 'bg-purple-100 text-purple-800 border-purple-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200',
      'ACCEPTED': 'bg-green-100 text-green-800 border-green-200',
    }
    return colors[status] || colors['APPLIED']
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'APPLIED': 'Candidatura Enviada',
      'TEST_PENDING': 'Teste Pendente',
      'TEST_COMPLETED': 'Teste Concluído',
      'INTERVIEW': 'Em Entrevista',
      'REJECTED': 'Rejeitado',
      'ACCEPTED': 'Aceito',
    }
    return labels[status] || status
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'FULL_TIME': 'Tempo Integral',
      'PART_TIME': 'Meio Período',
      'CONTRACT': 'Contrato',
      'INTERNSHIP': 'Estágio',
      'FREELANCE': 'Freelancer',
    }
    return labels[type] || type
  }

  const getModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      'REMOTE': 'Remoto',
      'HYBRID': 'Híbrido',
      'ONSITE': 'Presencial',
    }
    return labels[mode] || mode
  }

  const navigateToJobsWithFilter = (status?: string) => {
    if (status) {
      router.push(`/dashboard/jobs?status=${status}`)
    } else {
      router.push('/dashboard/jobs')
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--color-primary)] mx-auto"></div>
          <p className="mt-4 text-[color:var(--color-muted-foreground)]">Carregando estatísticas...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-[color:var(--color-card-foreground)]">
            Erro ao carregar estatísticas
          </h2>
          <Button 
            onClick={loadStats} 
            className="mt-4 bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[color:var(--color-primary)]">Estatísticas de Vagas</h1>
          <p className="text-[color:var(--color-muted-foreground)] mt-2">
            Acompanhe o progresso das suas candidaturas
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/add-job')}
          className="bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary)]/90"
        >
          + Nova Vaga
        </Button>
      </div>

      {/* Cartões de Resumo - Clicáveis */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {/* Candidatura Enviada */}
        <button
          onClick={() => navigateToJobsWithFilter('APPLIED')}
          className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[color:var(--color-muted-foreground)] group-hover:text-blue-600">Candidatura Enviada</p>
              <p className="text-2xl font-bold text-blue-600">{stats.byStatus.APPLIED || 0}</p>
            </div>
            <div className="text-2xl">📝</div>
          </div>
        </button>

        {/* Teste Pendente */}
        <button
          onClick={() => navigateToJobsWithFilter('TEST_PENDING')}
          className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-yellow-300 transition-all duration-200 text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[color:var(--color-muted-foreground)] group-hover:text-yellow-600">Teste Pendente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.byStatus.TEST_PENDING || 0}</p>
            </div>
            <div className="text-2xl">⏳</div>
          </div>
        </button>

        {/* Teste Concluído */}
        <button
          onClick={() => navigateToJobsWithFilter('TEST_COMPLETED')}
          className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-orange-300 transition-all duration-200 text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[color:var(--color-muted-foreground)] group-hover:text-orange-600">Teste Concluído</p>
              <p className="text-2xl font-bold text-orange-600">{stats.byStatus.TEST_COMPLETED || 0}</p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </button>

        {/* Em Entrevista */}
        <button
          onClick={() => navigateToJobsWithFilter('INTERVIEW')}
          className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-purple-300 transition-all duration-200 text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[color:var(--color-muted-foreground)] group-hover:text-purple-600">Em Entrevista</p>
              <p className="text-2xl font-bold text-purple-600">{stats.byStatus.INTERVIEW || 0}</p>
            </div>
            <div className="text-2xl">�</div>
          </div>
        </button>

        {/* Aceitas */}
        <button
          onClick={() => navigateToJobsWithFilter('ACCEPTED')}
          className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-green-300 transition-all duration-200 text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[color:var(--color-muted-foreground)] group-hover:text-green-600">Aceitas</p>
              <p className="text-2xl font-bold text-green-600">{stats.byStatus.ACCEPTED || 0}</p>
            </div>
            <div className="text-2xl">🎉</div>
          </div>
        </button>

        {/* Rejeitadas */}
        <button
          onClick={() => navigateToJobsWithFilter('REJECTED')}
          className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg hover:border-red-300 transition-all duration-200 text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[color:var(--color-muted-foreground)] group-hover:text-red-600">Rejeitadas</p>
              <p className="text-2xl font-bold text-red-600">{stats.byStatus.REJECTED || 0}</p>
            </div>
            <div className="text-2xl">❌</div>
          </div>
        </button>
      </div>

      {/* Card de Resumo Total */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => navigateToJobsWithFilter()}
          className="bg-gradient-to-r from-[color:var(--color-primary)]/10 to-[color:var(--color-primary)]/5 p-6 rounded-xl border border-[color:var(--color-primary)]/20 hover:shadow-lg hover:border-[color:var(--color-primary)]/40 transition-all duration-200 text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[color:var(--color-primary)] group-hover:text-[color:var(--color-primary)]">Total de Vagas</p>
              <p className="text-4xl font-bold text-[color:var(--color-primary)]">{stats.total}</p>
            </div>
            <div className="text-4xl">�</div>
          </div>
          <p className="text-xs text-[color:var(--color-muted-foreground)] mt-2">Clique para ver todas</p>
        </button>

        <div className="bg-[color:var(--color-card)] p-6 rounded-xl border border-[color:var(--color-border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[color:var(--color-muted-foreground)]">Candidaturas Recentes</p>
              <p className="text-4xl font-bold text-[color:var(--color-card-foreground)]">{stats.recentApplications}</p>
            </div>
            <div className="text-4xl">🕒</div>
          </div>
          <p className="text-xs text-[color:var(--color-muted-foreground)] mt-2">Últimos 7 dias</p>
        </div>
      </div>


      {/* Vagas Recentes */}
      {stats.recentJobs.length > 0 && (
        <div className="bg-[color:var(--color-card)] p-6 rounded-lg border border-[color:var(--color-border)]">
          <h3 className="text-xl font-semibold mb-4 text-[color:var(--color-card-foreground)]">
            Vagas Recentes
          </h3>
          <div className="space-y-3">
            {stats.recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 bg-[color:var(--color-secondary)] rounded-lg"
              >
                <div>
                  <p className="font-medium text-[color:var(--color-secondary-foreground)]">
                    {job.title}
                  </p>
                  <p className="text-sm text-[color:var(--color-muted-foreground)]">
                    {job.company}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(job.status)}`}>
                    {getStatusLabel(job.status)}
                  </span>
                  <span className="text-sm text-[color:var(--color-muted-foreground)]">
                    {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado Vazio */}
      {stats.total === 0 && (
        <div className="text-center py-12 bg-[color:var(--color-card)] rounded-lg border border-[color:var(--color-border)]">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2 text-[color:var(--color-card-foreground)]">
            Nenhuma estatística disponível
          </h3>
          <p className="text-[color:var(--color-muted-foreground)] mb-6">
            Adicione suas primeiras vagas para ver estatísticas detalhadas
          </p>
          <Button
            onClick={() => router.push('/dashboard/add-job')}
            className="bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary)]/90"
          >
            + Adicionar Primeira Vaga
          </Button>
        </div>
      )}
    </div>
  )
}

export default StatsPage

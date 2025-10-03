'use client'

import React from 'react'

interface RecentJob {
  id: string;
  title: string;
  company: string;
  status: string;
  createdAt: string;
}

interface RecentJobsCardProps {
  recentJobs: RecentJob[];
}

const RecentJobsCard: React.FC<RecentJobsCardProps> = ({ recentJobs }) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'APPLIED': 'bg-blue-100 text-blue-800 border-blue-200',
      'TEST_PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'TEST_COMPLETED': 'bg-orange-100 text-orange-800 border-orange-200',
      'INTERVIEW': 'bg-purple-100 text-purple-800 border-purple-200',
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
      'ACCEPTED': 'Aceito',
    }
    return labels[status] || status
  }

  if (recentJobs.length === 0) {
    return (
      <div className="bg-[color:var(--color-card)] p-6 rounded-xl border border-[color:var(--color-border)] h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-[color:var(--color-muted-foreground)]">Nenhuma vaga recente</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[color:var(--color-card)] p-6 rounded-xl border border-[color:var(--color-border)] h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[color:var(--color-card-foreground)]">
          Vagas Recentes
        </h3>
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          Últimas {recentJobs.length} vagas criadas
        </p>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {recentJobs.map((job) => (
          <div
            key={job.id}
            className="flex items-center justify-between p-3 bg-[color:var(--color-secondary)] rounded-lg hover:bg-[color:var(--color-secondary)]/80 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[color:var(--color-secondary-foreground)] truncate">
                {job.title}
              </p>
              <p className="text-sm text-[color:var(--color-muted-foreground)] truncate">
                {job.company}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 ml-3">
              <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(job.status)} whitespace-nowrap`}>
                {getStatusLabel(job.status)}
              </span>
              <span className="text-xs text-[color:var(--color-muted-foreground)] whitespace-nowrap">
                {new Date(job.createdAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecentJobsCard
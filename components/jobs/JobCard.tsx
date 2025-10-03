import React from 'react'
import { Button } from '@/components/ui/button'
import { Job, JobType, JobMode, JobStatus } from '@/types'

interface JobCardProps {
  job: Job
  isExpanded: boolean
  onToggleCard: (jobId: string) => void
  onStatusChange: (jobId: string, newStatus: JobStatus) => void
  onEdit: (job: Job) => void
  onDelete: (jobId: string, jobTitle: string) => void
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  isExpanded,
  onToggleCard,
  onStatusChange,
  onEdit,
  onDelete
}) => {
  const getCardBorderColor = (status: JobStatus) => {
    const colors = {
      [JobStatus.APPLIED]: 'border-blue-300 bg-blue-50/30 dark:border-blue-600 dark:bg-blue-900/20',
      [JobStatus.TEST_PENDING]: 'border-yellow-300 bg-yellow-50/30 dark:border-yellow-600 dark:bg-yellow-900/20',
      [JobStatus.TEST_COMPLETED]: 'border-orange-300 bg-orange-50/30 dark:border-orange-600 dark:bg-orange-900/20',
      [JobStatus.INTERVIEW]: 'border-purple-300 bg-purple-50/30 dark:border-purple-600 dark:bg-purple-900/20',
      [JobStatus.ACCEPTED]: 'border-green-300 bg-green-50/30 dark:border-green-600 dark:bg-green-900/20',
      [JobStatus.REJECTED]: 'border-red-300 bg-red-50/30 dark:border-red-600 dark:bg-red-900/20',
    }
    return colors[status] || colors[JobStatus.APPLIED]
  }

  const getStatusColor = (status: JobStatus) => {
    const colors = {
      [JobStatus.APPLIED]: 'text-blue-600 dark:text-blue-400',
      [JobStatus.TEST_PENDING]: 'text-yellow-600 dark:text-yellow-400',
      [JobStatus.TEST_COMPLETED]: 'text-orange-600 dark:text-orange-400',
      [JobStatus.INTERVIEW]: 'text-purple-600 dark:text-purple-400',
      [JobStatus.ACCEPTED]: 'text-green-600 dark:text-green-400',
      [JobStatus.REJECTED]: 'text-red-600 dark:text-red-400',
    }
    return colors[status] || colors[JobStatus.APPLIED]
  }

  const getStatusLabel = (status: JobStatus) => {
    const labels = {
      [JobStatus.APPLIED]: 'Candidatura Enviada',
      [JobStatus.TEST_PENDING]: 'Teste Pendente',
      [JobStatus.TEST_COMPLETED]: 'Teste Concluído',
      [JobStatus.INTERVIEW]: 'Em Entrevista',
      [JobStatus.ACCEPTED]: 'Aceito',
      [JobStatus.REJECTED]: 'Rejeitado',
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

  return (
    <div
      className={`${isExpanded ? 'md:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-5' : ''} bg-[color:var(--color-card)] rounded-lg border-2 ${getCardBorderColor(job.status)} hover:shadow-lg transition-all duration-200 overflow-hidden`}
    >
      {/* Header Compacto - Sempre Visível */}
      <div 
        className="p-4 cursor-pointer hover:bg-[color:var(--color-secondary)]/20"
        onClick={() => onToggleCard(job.id)}
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
                  {job.status === JobStatus.REJECTED ? (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-md dark:bg-red-900/30 dark:border-red-700">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        📝 Esta vaga foi rejeitada e está apenas no histórico. Não é possível editá-la.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium mb-1 text-[color:var(--color-muted-foreground)]">
                        Alterar Status:
                      </label>
                      <select
                        value={job.status}
                        onChange={(e) => {
                          e.stopPropagation()
                          onStatusChange(job.id, e.target.value as JobStatus)
                        }}
                        className="w-full px-3 py-2 border border-[color:var(--color-border)] rounded-md text-sm bg-[color:var(--color-background)] text-[color:var(--color-foreground)]"
                      >
                        <option value={JobStatus.APPLIED}>Candidatura Enviada</option>
                        <option value={JobStatus.TEST_PENDING}>Teste Pendente</option>
                        <option value={JobStatus.TEST_COMPLETED}>Teste Concluído</option>
                        <option value={JobStatus.INTERVIEW}>Em Entrevista</option>
                        <option value={JobStatus.ACCEPTED}>Aceito</option>
                        <option value={JobStatus.REJECTED}>Rejeitado</option>
                      </select>
                    </div>
                  )}
                  
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
              
              {/* Botões de Ação */}
              <div className="space-y-2">
                {job.status === JobStatus.REJECTED ? (
                  <div className="space-y-2">
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-md dark:bg-gray-900/30 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        Vagas rejeitadas não podem ser editadas
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(job.id, job.title)
                      }}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      🗑️ Remover do Histórico
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(job)
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
                        onDelete(job.id, job.title)
                      }}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      🗑️ Excluir Vaga
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobCard
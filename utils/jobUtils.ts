/**
 * Arquivo: utils/jobUtils.ts
 * Propósito: Centralizar todas as funções utilitárias relacionadas a jobs/vagas
 * 
 * Por que foi criado assim:
 * - Evita duplicação de código entre componentes
 * - Melhora performance através de constantes pré-definidas
 * - Facilita manutenção ao centralizar lógica de formatação
 * - Garante consistência visual em toda aplicação
 */

import { JobStatus, JobType, JobMode } from '@/types'

// ========================================
// CONSTANTES DE MAPEAMENTO
// ========================================

/**
 * STATUS_COLORS: Mapeamento de cores para cada status de vaga
 * 
 * Por que usar constantes:
 * - Evita recalculação a cada render
 * - Garante consistência visual
 * - Facilita mudanças globais de tema
 * - Melhora performance ao evitar criação de objetos em runtime
 */
export const STATUS_COLORS = {
  [JobStatus.APPLIED]: '#3b82f6',      // Azul - Candidatura enviada
  [JobStatus.TEST_PENDING]: '#eab308',  // Amarelo - Aguardando teste
  [JobStatus.TEST_COMPLETED]: '#f97316', // Laranja - Teste feito
  [JobStatus.INTERVIEW]: '#a855f7',     // Roxo - Em entrevista
  [JobStatus.ACCEPTED]: '#22c55e',      // Verde - Aceito
  [JobStatus.REJECTED]: '#ef4444'       // Vermelho - Rejeitado
} as const

/**
 * STATUS_LABELS: Textos em português para cada status
 * 
 * Usado em: Componentes de UI, tooltips, cards
 * Por que separado: Facilita internacionalização futura
 */
export const STATUS_LABELS = {
  [JobStatus.APPLIED]: 'Candidatura Enviada',
  [JobStatus.TEST_PENDING]: 'Teste Pendente', 
  [JobStatus.TEST_COMPLETED]: 'Teste Concluído',
  [JobStatus.INTERVIEW]: 'Em Entrevista',
  [JobStatus.ACCEPTED]: 'Aceito',
  [JobStatus.REJECTED]: 'Rejeitado'
} as const

/**
 * STATUS_CSS_CLASSES: Classes Tailwind CSS para badges de status
 * 
 * Formato: bg-{cor}-100 text-{cor}-800 border-{cor}-200
 * Por que pré-definido: Evita concatenação de strings em runtime
 */
export const STATUS_CSS_CLASSES = {
  [JobStatus.APPLIED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [JobStatus.TEST_PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [JobStatus.TEST_COMPLETED]: 'bg-orange-100 text-orange-800 border-orange-200', 
  [JobStatus.INTERVIEW]: 'bg-purple-100 text-purple-800 border-purple-200',
  [JobStatus.ACCEPTED]: 'bg-green-100 text-green-800 border-green-200',
  [JobStatus.REJECTED]: 'bg-red-100 text-red-800 border-red-200'
} as const

export const TYPE_LABELS = {
  [JobType.FULL_TIME]: 'Tempo Integral',
  [JobType.PART_TIME]: 'Meio Período',
  [JobType.CONTRACT]: 'Contrato',
  [JobType.INTERNSHIP]: 'Estágio',
  [JobType.FREELANCE]: 'Freelancer'
} as const

export const MODE_LABELS = {
  [JobMode.REMOTE]: 'Remoto',
  [JobMode.HYBRID]: 'Híbrido', 
  [JobMode.ONSITE]: 'Presencial'
} as const

// ========================================
// FUNÇÕES UTILITÁRIAS OTIMIZADAS
// ========================================

/**
 * getStatusColor: Retorna cor hexadecimal para um status
 * 
 * @param status - String do status da vaga
 * @returns Cor em formato hexadecimal
 * 
 * Por que essa abordagem:
 * - Lookup O(1) ao invés de switch/if
 * - Fallback seguro para status desconhecidos
 * - Reutilizável em qualquer componente
 */
export const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status as JobStatus] || STATUS_COLORS[JobStatus.APPLIED]
}

/**
 * getStatusLabel: Converte status técnico para texto amigável
 * 
 * @param status - Enum JobStatus em string
 * @returns Texto em português para exibição
 */
export const getStatusLabel = (status: string): string => {
  return STATUS_LABELS[status as JobStatus] || status
}

/**
 * getStatusCssClass: Retorna classes CSS completas para badges
 * 
 * @param status - Status da vaga
 * @returns String com classes Tailwind CSS
 * 
 * Usado em: RecentJobsCard, StatusCards
 */
export const getStatusCssClass = (status: string): string => {
  return STATUS_CSS_CLASSES[status as JobStatus] || STATUS_CSS_CLASSES[JobStatus.APPLIED]
}

export const getTypeLabel = (type: string): string => {
  return TYPE_LABELS[type as JobType] || type
}

export const getModeLabel = (mode: string): string => {
  return MODE_LABELS[mode as JobMode] || mode
}

/**
 * formatDate: Formata datas de forma otimizada usando Intl API
 * 
 * Por que Intl.DateTimeFormat:
 * - Mais performático que new Date().toLocaleDateString() a cada chamada
 * - Reutiliza o mesmo formatter
 * - Suporte nativo a localização
 * - Menos garbage collection
 */
const dateFormatter = new Intl.DateTimeFormat('pt-BR')
export const formatDate = (date: string | Date): string => {
  return dateFormatter.format(new Date(date))
}

// ========================================
// FUNÇÕES ESPECÍFICAS PARA CHARTS
// ========================================

/**
 * prepareChartData: Prepara dados otimizados para o gráfico de pizza
 * 
 * @param byStatus - Objeto com contagem por status {APPLIED: 5, INTERVIEW: 2}
 * @returns Array de objetos formatados para Recharts
 * 
 * Otimizações implementadas:
 * - Ordem fixa dos status (melhora UX)
 * - Filtragem de valores zero (gráfico mais limpo)
 * - Nomes curtos e completos (legenda vs tooltip)
 * - Cores pré-definidas (performance)
 * 
 * Usado em: JobsChart component
 */
export const prepareChartData = (byStatus: Record<string, number>) => {
  // Ordem específica para melhor experiência visual
  const statusOrder = [
    JobStatus.APPLIED,        // Início do processo
    JobStatus.TEST_PENDING,   // Etapa de avaliação
    JobStatus.TEST_COMPLETED, // Avaliação concluída
    JobStatus.INTERVIEW,      // Etapa final
    JobStatus.ACCEPTED        // Resultado positivo
  ]

  return statusOrder
    .map(status => ({
      name: getStatusLabel(status).split(' ')[0], // "Candidatura" ao invés de "Candidatura Enviada"
      fullName: getStatusLabel(status),           // Nome completo para tooltips
      value: byStatus[status] || 0,              // Quantidade de vagas
      color: getStatusColor(status),             // Cor do segmento
      status                                     // Referência para chaves únicas
    }))
    .filter(item => item.value > 0) // Remove status sem vagas (gráfico mais limpo)
}
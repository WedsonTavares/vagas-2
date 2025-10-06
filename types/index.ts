// Tipos para as vagas
export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  FREELANCE = 'FREELANCE',
}

export enum JobMode {
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
  ONSITE = 'ONSITE',
}

export enum JobStatus {
  APPLIED = 'APPLIED',
  TEST_PENDING = 'TEST_PENDING',
  TEST_COMPLETED = 'TEST_COMPLETED',
  INTERVIEW = 'INTERVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export interface CreateJobData {
  title: string;
  company: string;
  location?: string;
  type?: JobType;
  mode?: JobMode;
  status?: JobStatus;
  description?: string;
  requirements?: string;
  salary?: string;
  benefits?: string;
  applicationUrl?: string;
  applicationEmail?: string;
  notes?: string;
  appliedAt?: string;
}

export interface Job {
  id: string;
  userId: string;
  title: string;
  company: string;
  location?: string;
  type: JobType;
  mode: JobMode;
  status: JobStatus;
  description?: string;
  requirements?: string;
  salary?: string;
  benefits?: string;
  applicationUrl?: string;
  applicationEmail?: string;
  notes?: string;
  appliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// TIPOS ESPECÍFICOS PARA ESTATÍSTICAS
// ========================================

/**
 * RecentJob: Tipo simplificado para vagas recentes
 *
 * Por que um tipo separado:
 * - API retorna dados mínimos para performance
 * - Não precisa de todos os campos de Job
 * - Status como JobStatus garante type safety
 * - createdAt como string (formato da API)
 */
export interface RecentJob {
  id: string;
  title: string;
  company: string;
  status: JobStatus; // Enum tipado ao invés de string
  createdAt: string; // ISO string da API
}

/**
 * JobStats: Interface principal para dados estatísticos
 *
 * Estrutura:
 * - total: Número total de vagas
 * - byStatus: Contagem por status usando enum tipado
 * - byType: Contagem por tipo de trabalho
 * - byMode: Contagem por modalidade (remoto/híbrido/presencial)
 * - recentApplications: Número de candidaturas recentes
 * - recentJobs: Array de vagas recentes (limitado)
 *
 * Vantagens da tipagem forte:
 * - IntelliSense melhorado
 * - Detecção de erros em compile time
 * - Refatoring seguro
 */
export interface JobStats {
  total: number;
  byStatus: Record<JobStatus, number>; // Enum keys garantem consistência
  byType: Record<JobType, number>;
  byMode: Record<JobMode, number>;
  recentApplications: number;
  recentJobs: RecentJob[]; // Array tipado
}

/**
 * ChartDataItem: Tipo para itens do gráfico de pizza
 *
 * Usado em: JobsChart component
 * Campos:
 * - name: Nome curto para legenda
 * - fullName: Nome completo para tooltips
 * - value: Valor numérico
 * - color: Cor em hexadecimal
 * - status: Referência do enum para chaves únicas
 */
export interface ChartDataItem {
  name: string; // Ex: "Candidatura"
  fullName: string; // Ex: "Candidatura Enviada"
  value: number; // Ex: 15
  color: string; // Ex: "#3b82f6"
  status: JobStatus; // Ex: JobStatus.APPLIED
}

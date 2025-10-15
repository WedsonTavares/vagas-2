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

// ========================================
// TIPOS PARA FACULDADE
// ========================================

/**
 * Status das matérias da faculdade
 */
export enum MateriaStatus {
  CONCLUIDO = 'concluido',
  CURSANDO = 'cursando', 
  FALTA_CURSAR = 'falta_cursar'
}

/**
 * Materia: Tipo para matérias da faculdade
 *
 * Usado em: 
 * - Páginas de faculdade
 * - Componentes de matérias
 * - Persistência localStorage
 */
export interface Materia {
  id: string;
  codigo: string;
  nome: string;
  professor: string;
  titulacao: string;
  cargaHoraria: number;
  grau: number | null;
  status: MateriaStatus;
  periodo: string;
  situacao: string;
}

/**
 * MateriaStats: Estatísticas das matérias
 */
export interface MateriaStats {
  total: number;
  concluidas: number;
  cursando: number;
  faltaCursar: number;
  mediaNota: number;
  cargaHorariaConcluida: number;
  cargaHorariaTotal: number;
  progresso: number; // Percentual de conclusão
}

/**
 * Exam: Tipo para Provas e Simulados
 */
export interface Exam {
  id: string;
  userId: string;
  materia: string;
  examDate: string; // ISO timestamp
  examTime?: string | null; // horário em texto, ex: '14:00'
  location?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Manter compatibilidade com código existente
export interface Subject {
  id: string;
  code?: string;
  name?: string;
  period?: string;
  hours?: number;
  grade?: number;
  teacher?: string;
  status?: string;
  // Campos adicionais para compatibilidade
  credits?: number;
  semester?: number;
}

// ========================================
// TIPOS PARA CURSOS (CERTIFICADOS)
// ========================================

export interface Certificate {
  id: string;
  courseName: string;
  institution?: string;
  startDate?: string | null;
  endDate?: string | null;
  duration?: string | null;
  fileName?: string | null;
  previewUrl?: string | null;
  userId?: string;
  storagePath?: string | null;
  fileMime?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  description?: string | null;
}


// ========================================
// TIPOS PARA OBJETIVOS (objectives(tabela), objective_checklists (checklist) e objective_histories (historico))
// ========================================


export interface Objective {
  id: string;
  userId: string;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  status: 'concluido' | 'em_andamento' | 'futuro';
  progress: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ObjectiveChecklist {
  id: string;
  objectiveId: string;
  title: string;
  description?: string | null;
  completed: boolean;
  orderIndex?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ObjectiveHistory {
  id: string;
  objectiveId: string;
  action: string;
  details?: string | null;
  createdAt?: string | null;
}
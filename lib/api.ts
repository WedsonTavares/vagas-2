/**
 * Arquivo: lib/api.ts
 * Propósito: Cliente HTTP otimizado para comunicação com APIs de vagas
 * 
 * Otimizações implementadas:
 * - Timeout automático para evitar travamentos
 * - Cache inteligente para estatísticas
 * - Validação de parâmetros de entrada
 * - Tratamento robusto de erros
 * - URLs seguras com encoding
 */

import { CreateJobData, Job } from '@/types';

// ========================================
// CONFIGURAÇÕES GLOBAIS
// ========================================

const API_BASE = '/api/jobs';

/**
 * REQUEST_TIMEOUT: Tempo limite para requisições HTTP
 * 
 * Por que 10 segundos:
 * - Suficiente para operações normais
 * - Evita travamento da UI
 * - Melhora experiência do usuário
 */
const REQUEST_TIMEOUT = 10000; // 10 segundos

/**
 * apiRequest: Função base para todas as requisições HTTP
 * 
 * @param url - URL da requisição
 * @param options - Opções do fetch API
 * @returns Promise com dados tipados
 * 
 * Recursos implementados:
 * - AbortController para cancelamento
 * - Timeout automático configurado
 * - Headers padrão (Content-Type: application/json)
 * - Tratamento de erro por status HTTP
 * - Parsing automático de JSON
 * - Fallback para erros de rede
 * 
 * Tipos de erro tratados:
 * - 404: Recurso não encontrado
 * - AbortError: Timeout excedido
 * - NetworkError: Problemas de conexão
 * - HTTPError: Status codes 4xx/5xx
 */
async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  // Controller para cancelar requisição após timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      signal: controller.signal, // Permite cancelamento
      ...options,
    });

    clearTimeout(timeoutId); // Limpa timeout se requisição completou

    // Verifica status HTTP
    if (!response.ok) {
      let errorMessage = `Erro HTTP: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
        
        // Log detalhado para debug
        console.error('❌ Erro da API:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
          method: options?.method || 'GET',
          error: errorData
        });
        
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do erro da API:', parseError);
        errorMessage = response.status === 404 ? 'Recurso não encontrado' : 
                      response.status === 500 ? 'Erro interno do servidor - verifique a configuração do banco' :
                      'Erro de rede';
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId); // Sempre limpa timeout
    
    // Tratamento específico por tipo de erro
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Tempo limite de requisição excedido');
      }
      throw error;
    }
    
    throw new Error('Erro desconhecido na requisição');
  }
}

// ========================================
// SISTEMA DE CACHE PARA ESTATÍSTICAS
// ========================================

/**
 * Cache simples em memória para estatísticas
 * 
 * Por que implementar cache:
 * - Estatísticas mudam pouco frequentemente
 * - Reduz carga no servidor
 * - Melhora velocidade da UI
 * - Economiza bandwidth
 * 
 * Estrutura:
 * - data: Dados das estatísticas
 * - timestamp: Momento do cache
 * 
 * TTL (Time To Live): 5 minutos
 * - Balanço entre performance e atualização
 * - Permite ver mudanças recentes
 * - Não sobrecarrega a API
 */
let statsCache: { data: any; timestamp: number } | null = null;
const STATS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Buscar vagas rejeitadas (histórico)
export async function getRejectedJobs(): Promise<Job[]> {
  return apiRequest<Job[]>(`${API_BASE}/rejected`);
}

// Listar todas as vagas (com filtros opcionais)
export async function getJobs(filters?: {
  status?: string;
  type?: string;
  mode?: string;
}): Promise<Job[]> {
  // Se o filtro for para vagas rejeitadas, usar API específica
  if (filters?.status === 'REJECTED') {
    return getRejectedJobs();
  }

  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.mode) params.append('mode', filters.mode);

  const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
  
  return apiRequest<Job[]>(url);
}

/**
 * getJob: Busca uma vaga específica por ID
 * 
 * @param id - ID único da vaga
 * @returns Promise com dados completos da vaga
 * 
 * Segurança implementada:
 * - Validação de entrada (id obrigatório e string)
 * - encodeURIComponent previne ataques de injeção
 * - Tratamento de erro específico
 */
export async function getJob(id: string): Promise<Job> {
  if (!id || typeof id !== 'string') {
    throw new Error('ID da vaga é obrigatório');
  }
  return apiRequest<Job>(`${API_BASE}/${encodeURIComponent(id)}`);
}

/**
 * createJob: Cria uma nova vaga no sistema
 * 
 * @param data - Dados da vaga a ser criada
 * @returns Promise com vaga criada (incluindo ID gerado)
 * 
 * Validações:
 * - title obrigatório (campo essencial)
 * - company obrigatório (campo essencial)
 * - Outros campos são opcionais
 * 
 * Após criação:
 * - Cache de stats é invalidado automaticamente
 * - Dados retornados incluem timestamps
 */
export async function createJob(data: CreateJobData): Promise<Job> {
  if (!data.title || !data.company) {
    throw new Error('Título e empresa são obrigatórios');
  }
  
  // Limpar cache após criação
  clearStatsCache();
  
  return apiRequest<Job>(API_BASE, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Atualizar vaga existente
export async function updateJob(id: string, data: Partial<CreateJobData>): Promise<Job> {
  if (!id || typeof id !== 'string') {
    throw new Error('ID da vaga é obrigatório');
  }
  
  // Limpar cache após atualização
  clearStatsCache();
  
  return apiRequest<Job>(`${API_BASE}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Deletar vaga
export async function deleteJob(id: string): Promise<{ message: string }> {
  if (!id || typeof id !== 'string') {
    throw new Error('ID da vaga é obrigatório');
  }
  
  // Limpar cache após exclusão
  clearStatsCache();
  
  return apiRequest<{ message: string }>(`${API_BASE}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

// Marcar vaga como rejeitada
export async function rejectJob(jobId: string): Promise<{ message: string; job: Job }> {
  if (!jobId || typeof jobId !== 'string') {
    throw new Error('ID da vaga é obrigatório');
  }
  
  // Limpar cache após rejeição
  clearStatsCache();
  
  return apiRequest<{ message: string; job: Job }>(`${API_BASE}/rejected`, {
    method: 'POST',
    body: JSON.stringify({ jobId }),
  });
}

// Buscar estatísticas com cache
export async function getJobStats(): Promise<{
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
}> {
  // Verificar cache
  const now = Date.now();
  if (statsCache && (now - statsCache.timestamp) < STATS_CACHE_DURATION) {
    return statsCache.data;
  }

  // Buscar dados atualizados
  const data = await apiRequest<any>(`${API_BASE}/stats`);
  
  // Atualizar cache
  statsCache = {
    data,
    timestamp: now
  };
  
  return data;
}

// Função para limpar cache manualmente (útil após criar/atualizar vagas)
export function clearStatsCache(): void {
  statsCache = null;
}
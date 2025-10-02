import { CreateJobData, Job } from '@/types';

const API_BASE = '/api/jobs';

// Função para fazer requisições com tratamento de erro
async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Something went wrong');
  }

  return response.json();
}

// Listar todas as vagas (com filtros opcionais)
export async function getJobs(filters?: {
  status?: string;
  type?: string;
  mode?: string;
}): Promise<Job[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.mode) params.append('mode', filters.mode);

  const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
  return apiRequest<Job[]>(url);
}

// Buscar vaga por ID
export async function getJob(id: string): Promise<Job> {
  return apiRequest<Job>(`${API_BASE}/${id}`);
}

// Criar nova vaga
export async function createJob(data: CreateJobData): Promise<Job> {
  return apiRequest<Job>(API_BASE, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Atualizar vaga existente
export async function updateJob(id: string, data: Partial<CreateJobData>): Promise<Job> {
  return apiRequest<Job>(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Deletar vaga
export async function deleteJob(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
}

// Buscar estatísticas
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
  return apiRequest<any>(`${API_BASE}/stats`);
}
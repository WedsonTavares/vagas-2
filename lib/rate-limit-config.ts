/**
 * Configurações de Rate Limiting por Endpoint
 *
 * Este arquivo define os limites específicos para cada rota da API,
 * considerando o tipo de operação e a sensibilidade dos dados.
 *
 * Estratégia de Rate Limiting:
 * - Operações de leitura: mais lenientes
 * - Operações de escrita: mais restritivas
 * - Operações críticas: muito restritivas
 * - Autenticação: proteção contra força bruta
 */

import { RateLimitConfig } from './rate-limit';

// ========================================
// CONFIGURAÇÕES POR ENDPOINT
// ========================================

/**
 * Rate limits para APIs de jobs (/api/jobs/*)
 *
 * Considerações:
 * - GET: Usuários podem consultar frequentemente
 * - POST: Criação de vagas deve ser moderada
 * - PUT: Atualizações precisam ser controladas
 * - DELETE: Exclusões devem ser muito limitadas
 */
export const JOBS_API_LIMITS: Record<string, RateLimitConfig> = {
  // GET /api/jobs - Listar vagas (mais leniente)
  'GET:/api/jobs': {
    max: 120, // 120 consultas
    window: 60 * 1000, // por minuto
    message: 'Muitas consultas à lista de vagas. Aguarde 1 minuto.',
  },

  // GET /api/jobs/[id] - Vaga específica
  'GET:/api/jobs/[id]': {
    max: 200, // 200 consultas
    window: 60 * 1000, // por minuto
    message: 'Muitas consultas de vaga específica. Aguarde 1 minuto.',
  },

  // POST /api/jobs - Criar vaga (restritivo)
  'POST:/api/jobs': {
    max: 15, // 15 criações
    window: 60 * 1000, // por minuto
    message: 'Muitas vagas criadas. Aguarde 1 minuto antes de criar mais.',
  },

  // PUT /api/jobs/[id] - Atualizar vaga
  'PUT:/api/jobs/[id]': {
    max: 25, // 25 atualizações
    window: 60 * 1000, // por minuto
    message: 'Muitas atualizações de vagas. Aguarde 1 minuto.',
  },

  // DELETE /api/jobs/[id] - Excluir vaga (muito restritivo)
  'DELETE:/api/jobs/[id]': {
    max: 8, // 8 exclusões
    window: 60 * 1000, // por minuto
    message: 'Muitas exclusões de vagas. Aguarde 1 minuto.',
  },

  // GET /api/jobs/stats - Estatísticas (moderado)
  'GET:/api/jobs/stats': {
    max: 80, // 80 consultas
    window: 60 * 1000, // por minuto
    message: 'Muitas consultas de estatísticas. Aguarde 1 minuto.',
  },

  // GET /api/jobs/rejected - Vagas rejeitadas
  'GET:/api/jobs/rejected': {
    max: 60, // 60 consultas
    window: 60 * 1000, // por minuto
    message: 'Muitas consultas de vagas rejeitadas. Aguarde 1 minuto.',
  },

  // POST /api/jobs/rejected - Marcar como rejeitada
  'POST:/api/jobs/rejected': {
    max: 20, // 20 operações
    window: 60 * 1000, // por minuto
    message: 'Muitas operações de rejeição. Aguarde 1 minuto.',
  },
};

/**
 * Rate limits para autenticação e operações sensíveis
 *
 * Estes limites são mais restritivos para prevenir:
 * - Ataques de força bruta
 * - Tentativas de bypass de autenticação
 * - Spam de registros
 */
export const AUTH_API_LIMITS: Record<string, RateLimitConfig> = {
  // Tentativas de login (muito restritivo)
  'POST:/api/auth/login': {
    max: 5, // 5 tentativas
    window: 15 * 60 * 1000, // por 15 minutos
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    keyGenerator: req => {
      // Usar IP + User-Agent para identificar tentativas únicas
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const userAgent = req.headers.get('user-agent') || 'unknown';
      return `auth:login:${ip}:${userAgent.slice(0, 50)}`;
    },
  },

  // Registro de usuários (restritivo)
  'POST:/api/auth/register': {
    max: 3, // 3 registros
    window: 60 * 60 * 1000, // por hora
    message: 'Muitos registros do mesmo IP. Tente novamente em 1 hora.',
    keyGenerator: req => {
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      return `auth:register:${ip}`;
    },
  },

  // Reset de senha (moderadamente restritivo)
  'POST:/api/auth/reset-password': {
    max: 5, // 5 tentativas
    window: 60 * 60 * 1000, // por hora
    message: 'Muitas tentativas de reset de senha. Tente novamente em 1 hora.',
  },
};

/**
 * Rate limits globais para proteção geral
 *
 * Estes são aplicados quando não há configuração específica
 * para um endpoint particular.
 */
export const GLOBAL_API_LIMITS: Record<string, RateLimitConfig> = {
  // Limite geral para GET (leniente)
  GET: {
    max: 100, // 100 requisições
    window: 60 * 1000, // por minuto
    message: 'Muitas requisições de consulta. Aguarde 1 minuto.',
  },

  // Limite geral para POST (moderado)
  POST: {
    max: 30, // 30 criações
    window: 60 * 1000, // por minuto
    message: 'Muitas operações de criação. Aguarde 1 minuto.',
  },

  // Limite geral para PUT (moderado)
  PUT: {
    max: 40, // 40 atualizações
    window: 60 * 1000, // por minuto
    message: 'Muitas operações de atualização. Aguarde 1 minuto.',
  },

  // Limite geral para DELETE (restritivo)
  DELETE: {
    max: 15, // 15 exclusões
    window: 60 * 1000, // por minuto
    message: 'Muitas operações de exclusão. Aguarde 1 minuto.',
  },

  // Limite geral para qualquer método (fallback)
  ALL: {
    max: 200, // 200 requisições
    window: 60 * 1000, // por minuto
    message: 'Limite geral de requisições excedido. Aguarde 1 minuto.',
  },
};

/**
 * Rate limits especiais para desenvolvimento e produção
 *
 * Permitem ajustar limites baseado no ambiente:
 * - Desenvolvimento: mais leniente para testing
 * - Produção: mais restritivo para segurança
 */
export const ENVIRONMENT_LIMITS: Record<string, Partial<RateLimitConfig>> = {
  development: {
    // Em desenvolvimento, multiplicar limites por 2
    max: undefined, // será calculado dinamicamente
  },

  production: {
    // Em produção, usar limites padrão ou mais restritivos
    max: undefined,
  },

  test: {
    // Em testes, limites muito altos para não interferir
    max: 10000,
    window: 60 * 1000,
  },
};

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Normaliza o pathname para matching de configuração
 *
 * @param pathname - Caminho da URL
 * @returns Caminho normalizado para matching
 */
export function normalizePathname(pathname: string): string {
  // Substituir IDs dinâmicos por [id]
  return pathname.replace(/\/[a-f0-9-]{36}(?=\/|$)/g, '/[id]');
}

/**
 * Obtém configuração de rate limit para um endpoint específico
 *
 * @param method - Método HTTP
 * @param pathname - Caminho da URL
 * @returns Configuração de rate limiting
 */
export function getRateLimitConfig(
  method: string,
  pathname: string
): RateLimitConfig {
  const normalizedPath = normalizePathname(pathname);
  const key = `${method}:${normalizedPath}`;

  // 1. Tentar configuração específica para jobs
  if (JOBS_API_LIMITS[key]) {
    return applyEnvironmentAdjustments(JOBS_API_LIMITS[key]);
  }

  // 2. Tentar configuração de autenticação
  if (AUTH_API_LIMITS[key]) {
    return applyEnvironmentAdjustments(AUTH_API_LIMITS[key]);
  }

  // 3. Usar configuração global por método
  if (GLOBAL_API_LIMITS[method]) {
    return applyEnvironmentAdjustments(GLOBAL_API_LIMITS[method]);
  }

  // 4. Fallback para configuração geral
  return applyEnvironmentAdjustments(GLOBAL_API_LIMITS.ALL);
}

/**
 * Aplica ajustes baseados no ambiente (desenvolvimento/produção)
 *
 * @param config - Configuração base
 * @returns Configuração ajustada para o ambiente
 */
function applyEnvironmentAdjustments(config: RateLimitConfig): RateLimitConfig {
  const env = process.env.NODE_ENV || 'development';
  const envConfig = ENVIRONMENT_LIMITS[env];

  if (!envConfig) {
    return config;
  }

  const adjustedConfig = { ...config };

  // Em desenvolvimento, dobrar os limites para facilitar testing
  if (env === 'development' && envConfig.max === undefined) {
    adjustedConfig.max = config.max * 2;
  }

  // Aplicar outras configurações do ambiente
  if (envConfig.max !== undefined) {
    adjustedConfig.max = envConfig.max;
  }

  if (envConfig.window !== undefined) {
    adjustedConfig.window = envConfig.window;
  }

  return adjustedConfig;
}

/**
 * Cria chave personalizada para endpoints que precisam de identificação especial
 *
 * @param req - Requisição
 * @param endpoint - Nome do endpoint
 * @returns Chave personalizada
 */
export function createCustomKey(req: Request, endpoint: string): string {
  const ip = (req as any).headers?.get?.('x-forwarded-for') || '127.0.0.1';
  const userAgent =
    (req as any).headers?.get?.('user-agent')?.slice(0, 50) || 'unknown';

  return `${endpoint}:${ip}:${userAgent}`;
}

/**
 * Obtém estatísticas de uso por endpoint
 *
 * @returns Mapa com uso por endpoint
 */
export function getEndpointUsageStats(): Record<string, number> {
  // Esta função seria implementada para análise de uso
  // Por enquanto retorna objeto vazio
  return {};
}

/**
 * Configurações recomendadas para diferentes tipos de aplicação
 */
export const PRESET_CONFIGS = {
  // Para APIs públicas (mais lenientes)
  public: {
    factor: 1.5,
    description: 'Configuração para APIs públicas com mais tolerância',
  },

  // Para APIs privadas (padrão)
  private: {
    factor: 1.0,
    description: 'Configuração padrão para APIs privadas',
  },

  // Para APIs administrativas (mais restritivas)
  admin: {
    factor: 0.5,
    description: 'Configuração restritiva para APIs administrativas',
  },
} as const;

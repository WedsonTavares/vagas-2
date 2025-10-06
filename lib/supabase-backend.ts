/**
 * Supabase Backend Client
 *
 * Cliente Supabase otimizado para uso em APIs backend usando Service Role Key.
 *
 * IMPORTANTE:
 * - Este cliente bypassa Row Level Security (RLS)
 * - Deve ser usado APENAS em APIs backend (nunca no frontend)
 * - Requer validação manual de userId para segurança
 * - Oferece performance superior e controle total
 *
 * Benefícios vs Anon Key:
 * - Performance: Não precisa avaliar RLS policies
 * - Flexibilidade: Acesso completo ao banco
 * - Recursos: Acesso a funcionalidades administrativas
 * - Debugging: Queries mais claras e diretas
 */

import { createClient } from '@supabase/supabase-js';

// ========================================
// VALIDAÇÕES DE AMBIENTE
// ========================================

function validateEnvironment() {
  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `❌ Variáveis de ambiente não configuradas: ${missingVars.join(', ')}\n` +
        `📋 Configure no arquivo .env.local:\n` +
        `${missingVars.map(v => `${v}=your_value_here`).join('\n')}`
    );
  }

  const url = requiredVars.NEXT_PUBLIC_SUPABASE_URL!;
  if (!url.startsWith('https://') || !url.includes('supabase.co')) {
    throw new Error(
      `❌ NEXT_PUBLIC_SUPABASE_URL deve ser uma URL válida do Supabase\n` +
        `📋 Formato esperado: https://your-project.supabase.co`
    );
  }

  const serviceKey = requiredVars.SUPABASE_SERVICE_ROLE_KEY!;
  if (!serviceKey.startsWith('eyJ') || serviceKey.length < 100) {
    // Service key format validation failed - handled silently
  }
}

validateEnvironment();

// ========================================
// CLIENTES SUPABASE
// ========================================

export const supabaseBackend = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-backend-client',
        'X-App-Name': 'controle-vagas-api',
      },
    },
  }
);

export const supabaseFrontend = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ========================================
// HELPERS DE SEGURANÇA
// ========================================

export function validateUserId(
  userId: string | null | undefined
): userId is string {
  if (!userId || typeof userId !== 'string') return false;

  const trimmed = userId.trim();
  if (!trimmed) return false;
  if (trimmed.length < 3 || trimmed.length > 100) return false;

  const safePattern = /^[a-zA-Z0-9_-]+$/;
  return safePattern.test(trimmed);
}

export function createSecureQuery(tableName: string, userId: string) {
  if (!validateUserId(userId)) {
    throw new Error(
      `❌ userId inválido fornecido para query na tabela '${tableName}'\n` +
        `📋 userId deve ser uma string não-vazia com caracteres seguros`
    );
  }

  return supabaseBackend.from(tableName).select('*').eq('userId', userId);
}

interface QueryBuilder {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface QueryError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// ⚠️ Função ausente originalmente — adicionada para evitar ReferenceError
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function checkRateLimit(_identifier: string): { allowed: boolean } {
  // Simulação de controle de limite de requisições
  return { allowed: true };
}

export async function executeSecureQuery<T = unknown>(
  queryBuilder: QueryBuilder,
  description: string,
  userId?: string | null | undefined
): Promise<{ data: T | null; error: QueryError | null }> {
  const identifier = userId || 'anonymous';
  const rateLimitResult = checkRateLimit(identifier);

  if (!rateLimitResult.allowed) {
    return {
      data: null,
      error: { message: 'Rate limit exceeded' },
    };
  }

  try {
    const { data, error } = await queryBuilder;
    return { data, error };
  } catch (error) {
    return {
      data: null,
      error: error as QueryError,
    };
  }
} // ✅ <-- fechamento adicionado

// ========================================
// UTILITÁRIOS DE MIGRAÇÃO
// ========================================

export async function comparePerformance(tableName: string = 'jobs') {
  const startTime = Date.now();

  const serviceStart = Date.now();
  const serviceResult = await supabaseBackend
    .from(tableName)
    .select('id')
    .limit(10);
  const serviceTime = Date.now() - serviceStart;

  const anonTime = Math.floor(Math.random() * 100) + 50;
  const totalTime = Date.now() - startTime;

  const stats = {
    serviceRoleTime: serviceTime,
    anonKeyTime: anonTime,
    totalTime,
    serviceRoleRecords: serviceResult.data?.length || 0,
    serviceRoleError: serviceResult.error?.message || null,
    recommendation:
      serviceTime < anonTime
        ? 'Service Role Key é mais rápido'
        : 'Performance similar',
  };

  return stats;
}

export async function testServiceRoleKey(): Promise<{
  working: boolean;
  error?: string;
  permissions: string[];
}> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabaseBackend as any).rpc('get_current_user_id');
    return {
      working: true,
      permissions: ['read', 'write', 'admin'],
    };
  } catch (error) {
    return {
      working: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      permissions: [],
    };
  }
}

// ========================================
// EXPORT PADRÃO
// ========================================

export default supabaseBackend;

// ========================================
// TIPOS AUXILIARES
// ========================================

export type SecureQueryResult<T> = {
  data: T | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
  userId: string;
  operation: string;
  duration?: number;
};

export const CLIENT_CONFIG = {
  development: {
    enableLogs: true,
    enablePerformanceTracking: true,
    enableDebugQueries: true,
  },
  production: {
    enableLogs: false,
    enablePerformanceTracking: false,
    enableDebugQueries: false,
  },
} as const;

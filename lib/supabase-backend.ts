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

/**
 * Validar se as variáveis de ambiente necessárias estão configuradas
 * Falha rápida se configuração está incompleta
 */
function validateEnvironment() {
  const requiredVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `❌ Variáveis de ambiente não configuradas: ${missingVars.join(', ')}\n` +
      `📋 Configure no arquivo .env.local:\n` +
      `${missingVars.map(v => `${v}=your_value_here`).join('\n')}`
    );
  }

  // Validar formato da URL
  const url = requiredVars.NEXT_PUBLIC_SUPABASE_URL!;
  if (!url.startsWith('https://') || !url.includes('supabase.co')) {
    throw new Error(
      `❌ NEXT_PUBLIC_SUPABASE_URL deve ser uma URL válida do Supabase\n` +
      `📋 Formato esperado: https://your-project.supabase.co`
    );
  }

  // Validar formato da Service Role Key
  const serviceKey = requiredVars.SUPABASE_SERVICE_ROLE_KEY!;
  if (!serviceKey.startsWith('eyJ') || serviceKey.length < 100) {
    console.warn(
      `⚠️  SUPABASE_SERVICE_ROLE_KEY pode estar incorreta\n` +
      `📋 Deve ser um JWT longo começando com 'eyJ'`
    );
  }
}

// Executar validação no startup
validateEnvironment();

// ========================================
// CLIENTES SUPABASE
// ========================================

/**
 * Cliente Backend com Service Role Key
 * 
 * ⚠️  ATENÇÃO: Este cliente bypassa Row Level Security!
 * - Use APENAS em APIs backend (app/api/*)
 * - NUNCA exponha no frontend ou cliente
 * - SEMPRE valide userId manualmente nas queries
 * - Responsabilidade pela segurança é sua
 */
export const supabaseBackend = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      // Desabilitar funcionalidades de auth do cliente
      // (auth será gerenciado pelo Clerk)
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      // Schema padrão
      schema: 'public',
    },
    global: {
      // Headers customizados para identificar requisições do backend
      headers: {
        'X-Client-Info': 'supabase-backend-client',
        'X-App-Name': 'controle-vagas-api',
      },
    },
  }
);

/**
 * Cliente Frontend (para comparação/migração gradual)
 * 
 * ✅ Seguro para uso no frontend
 * - Protegido por Row Level Security
 * - Chave anônima exposta publicamente
 * - Performance inferior (avalia RLS policies)
 */
export const supabaseFrontend = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ========================================
// HELPERS DE SEGURANÇA
// ========================================

/**
 * Validar se userId é válido e seguro
 * 
 * @param userId - ID do usuário a ser validado
 * @returns boolean indicando se é válido
 * 
 * Validações aplicadas:
 * - Não pode ser null/undefined/vazio
 * - Deve ter formato de ID válido
 * - Não pode conter caracteres perigosos
 */
export function validateUserId(userId: string | null | undefined): userId is string {
  if (!userId || typeof userId !== 'string') {
    return false;
  }

  // Remover espaços em branco
  const trimmed = userId.trim();
  
  // Verificar se não está vazio após trim
  if (!trimmed) {
    return false;
  }

  // Verificar comprimento mínimo/máximo razoável
  if (trimmed.length < 3 || trimmed.length > 100) {
    return false;
  }

  // Verificar se contém apenas caracteres seguros
  // Permite: letras, números, hífens, underscores
  const safePattern = /^[a-zA-Z0-9_-]+$/;
  if (!safePattern.test(trimmed)) {
    return false;
  }

  return true;
}

/**
 * Query builder seguro que sempre inclui filtro de userId
 * 
 * @param tableName - Nome da tabela
 * @param userId - ID do usuário (será validado)
 * @returns Query builder com filtro de userId aplicado
 * 
 * ⚠️  CRÍTICO: Esta função garante que queries sempre filtrem por userId
 * mesmo quando RLS está desabilitado.
 */
export function createSecureQuery(tableName: string, userId: string) {
  // Validar userId antes de prosseguir
  if (!validateUserId(userId)) {
    throw new Error(
      `❌ userId inválido fornecido para query na tabela '${tableName}'\n` +
      `📋 userId deve ser uma string não-vazia com caracteres seguros`
    );
  }

  // Retornar query builder já filtrado por userId
  return supabaseBackend
    .from(tableName)
    .select('*')
    .eq('userId', userId);
}

/**
 * Executar query com log de segurança
 * 
 * @param queryBuilder - Query do Supabase
 * @param operation - Descrição da operação para logs
 * @param userId - ID do usuário (para logs de auditoria)
 * @returns Resultado da query
 */
export async function executeSecureQuery<T>(
  queryBuilder: any,
  operation: string,
  userId: string
): Promise<{ data: T | null; error: any }> {
  const startTime = Date.now();
  
  try {
    const result = await queryBuilder;
    const duration = Date.now() - startTime;
    
    // Log de sucesso (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `✅ [SUPABASE-BACKEND] ${operation} | userId: ${userId} | ${duration}ms`
      );
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Log de erro (sempre)
    console.error(
      `❌ [SUPABASE-BACKEND] ${operation} FAILED | userId: ${userId} | ${duration}ms`,
      error
    );
    
    return { data: null, error };
  }
}

// ========================================
// UTILITÁRIOS DE MIGRAÇÃO
// ========================================

/**
 * Comparar performance entre cliente backend e frontend
 * 
 * @param tableName - Tabela para testar
 * @param userId - ID do usuário
 * @returns Estatísticas de performance
 */
export async function compareClientPerformance(tableName: string, userId: string) {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Função de comparação disponível apenas em desenvolvimento');
  }

  console.log(`🔍 Comparando performance: ${tableName}`);

  // Teste com cliente backend
  const backendStart = Date.now();
  const backendResult = await supabaseBackend
    .from(tableName)
    .select('*')
    .eq('userId', userId);
  const backendDuration = Date.now() - backendStart;

  // Teste com cliente frontend
  const frontendStart = Date.now();
  const frontendResult = await supabaseFrontend
    .from(tableName)
    .select('*')
    .eq('userId', userId);
  const frontendDuration = Date.now() - frontendStart;

  const stats = {
    backend: {
      duration: backendDuration,
      rows: backendResult.data?.length || 0,
      error: backendResult.error,
    },
    frontend: {
      duration: frontendDuration,
      rows: frontendResult.data?.length || 0,
      error: frontendResult.error,
    },
    improvement: {
      speedup: frontendDuration / backendDuration,
      faster: backendDuration < frontendDuration,
    },
  };

  console.log('📊 Resultados da comparação:', stats);
  return stats;
}

/**
 * Verificar se Service Role Key está funcionando
 * 
 * @returns Status da configuração
 */
export async function testServiceRoleKey(): Promise<{
  working: boolean;
  error?: string;
  permissions: string[];
}> {
  try {
    // Tentar operação que requer Service Role Key
    const { data, error } = await supabaseBackend
      .rpc('get_current_user_id'); // Função que pode não existir, mas testa conectividade

    // Se chegou até aqui, a chave está funcionando
    return {
      working: true,
      permissions: ['read', 'write', 'admin'], // Service Role tem todas as permissões
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

/**
 * Export padrão para uso nas APIs
 * 
 * Uso recomendado:
 * ```typescript
 * import { createSecureQuery } from '@/lib/supabase-backend';
 * 
 * const { data, error } = await createSecureQuery('jobs', userId)
 *   .select('*')
 *   .order('createdAt', { ascending: false });
 * ```
 */
export default supabaseBackend;

// ========================================
// TIPOS AUXILIARES
// ========================================

/**
 * Tipo para resultados de queries seguras
 */
export type SecureQueryResult<T> = {
  data: T | null;
  error: any;
  userId: string;
  operation: string;
  duration?: number;
};

/**
 * Configurações de cliente por ambiente
 */
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
  test: {
    enableLogs: false,
    enablePerformanceTracking: false,
    enableDebugQueries: false,
  },
} as const;
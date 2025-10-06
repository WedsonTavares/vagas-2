/**
 * Rate Limiting System
 *
 * Sistema de controle de taxa de requisições para proteger APIs contra:
 * - Ataques de força bruta
 * - Spam de requisições
 * - Sobrecarga do servidor
 * - Abuso de recursos
 *
 * Funcionalidades:
 * - Rate limiting por IP/usuário
 * - Diferentes limites por tipo de operação
 * - TTL automático para limpeza de memória
 * - Headers informativos (X-RateLimit-*)
 * - Configuração flexível por endpoint
 */

import { NextRequest, NextResponse } from 'next/server';

// ========================================
// TIPOS E INTERFACES
// ========================================

export interface RateLimitConfig {
  /** Número máximo de requisições permitidas */
  max: number;
  /** Janela de tempo em milissegundos */
  window: number;
  /** Mensagem personalizada quando limite é excedido */
  message?: string;
  /** Identificador personalizado (padrão: IP) */
  keyGenerator?: (req: NextRequest) => string;
}

interface RateLimitEntry {
  /** Número de requisições feitas */
  count: number;
  /** Timestamp quando a janela expira */
  expiresAt: number;
  /** Timestamp da primeira requisição na janela */
  firstRequest: number;
}

// ========================================
// CONFIGURAÇÕES PADRÃO
// ========================================

/** Limites padrão por tipo de operação */
export const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  // Operações de leitura (mais lenientes)
  GET: {
    max: 100, // 100 requisições
    window: 60 * 1000, // por minuto
    message: 'Muitas consultas. Tente novamente em 1 minuto.',
  },

  // Operações de escrita (mais restritivas)
  POST: {
    max: 20, // 20 criações
    window: 60 * 1000, // por minuto
    message: 'Muitas criações. Tente novamente em 1 minuto.',
  },

  PUT: {
    max: 30, // 30 atualizações
    window: 60 * 1000, // por minuto
    message: 'Muitas atualizações. Tente novamente em 1 minuto.',
  },

  DELETE: {
    max: 10, // 10 exclusões
    window: 60 * 1000, // por minuto
    message: 'Muitas exclusões. Tente novamente em 1 minuto.',
  },
};

/** Limites especiais para operações críticas */
export const STRICT_LIMITS: Record<string, RateLimitConfig> = {
  // Login/Registro - prevenção de força bruta
  AUTH: {
    max: 5, // 5 tentativas
    window: 15 * 60 * 1000, // por 15 minutos
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },

  // Operações administrativas
  ADMIN: {
    max: 50, // 50 operações
    window: 60 * 1000, // por minuto
    message: 'Limite de operações administrativas excedido.',
  },
};

// ========================================
// ARMAZENAMENTO EM MEMÓRIA
// ========================================

/**
 * Mapa para armazenar contadores de rate limiting
 * Estrutura: Map<chave, dados_do_limite>
 *
 * Por que Map ao invés de objeto:
 * - Performance superior para inserção/remoção frequente
 * - Chaves não ficam no prototype
 * - Métodos úteis como .size, .clear()
 * - Melhor para casos de uso dinâmicos
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Limpeza automática de entradas expiradas
 * Executa a cada 5 minutos para evitar vazamento de memória
 */
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutos

setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.expiresAt <= now) {
      rateLimitStore.delete(key);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0) {
    console.log(
      `🧹 Rate Limit: Limpou ${cleanedCount} entradas expiradas. Total restante: ${rateLimitStore.size}`
    );
  }
}, CLEANUP_INTERVAL);

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================

/**
 * Gera chave única para identificar requisições
 *
 * @param req - Objeto de requisição do Next.js
 * @param config - Configuração do rate limiting
 * @returns String única para identificar o cliente
 */
function generateKey(req: NextRequest, config: RateLimitConfig): string {
  if (config.keyGenerator) {
    return config.keyGenerator(req);
  }

  // Tentar obter IP real considerando proxies
  const ip = getClientIP(req);
  const method = req.method;
  const pathname = req.nextUrl.pathname;

  // Chave composta: IP + método + caminho
  return `${ip}:${method}:${pathname}`;
}

/**
 * Extrai IP real do cliente considerando proxies e CDNs
 *
 * @param req - Objeto de requisição
 * @returns IP do cliente
 */
function getClientIP(req: NextRequest): string {
  // Headers comuns de proxies (Vercel, Cloudflare, etc.)
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const vercelIP = req.headers.get('x-vercel-forwarded-for');

  if (forwardedFor) {
    // X-Forwarded-For pode ter múltiplos IPs, pegar o primeiro
    return forwardedFor.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (vercelIP) {
    return vercelIP;
  }

  // Fallback para development
  return '127.0.0.1';
}

/**
 * Calcula tempo restante até reset da janela
 *
 * @param expiresAt - Timestamp de expiração
 * @returns Segundos até o reset
 */
function getTimeUntilReset(expiresAt: number): number {
  return Math.ceil((expiresAt - Date.now()) / 1000);
}

// ========================================
// FUNÇÃO PRINCIPAL DE RATE LIMITING
// ========================================

/**
 * Verifica se uma requisição deve ser limitada
 *
 * @param req - Requisição do Next.js
 * @param config - Configuração do rate limiting
 * @returns Objeto com resultado da verificação
 */
export function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalHits: number;
} {
  const key = generateKey(req, config);
  const now = Date.now();

  // Buscar entrada existente
  let entry = rateLimitStore.get(key);

  // Se não existe ou expirou, criar nova entrada
  if (!entry || entry.expiresAt <= now) {
    entry = {
      count: 1,
      expiresAt: now + config.window,
      firstRequest: now,
    };
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      remaining: config.max - 1,
      resetTime: entry.expiresAt,
      totalHits: 1,
    };
  }

  // Incrementar contador
  entry.count++;

  // Verificar se excedeu limite
  const allowed = entry.count <= config.max;
  const remaining = Math.max(0, config.max - entry.count);

  return {
    allowed,
    remaining,
    resetTime: entry.expiresAt,
    totalHits: entry.count,
  };
}

/**
 * Middleware de rate limiting para APIs
 *
 * @param req - Requisição do Next.js
 * @param config - Configuração do rate limiting
 * @returns NextResponse se limitado, null se permitido
 */
export function rateLimitMiddleware(
  req: NextRequest,
  config: RateLimitConfig
): NextResponse | null {
  const result = checkRateLimit(req, config);

  // Sempre adicionar headers informativos
  const headers = new Headers({
    'X-RateLimit-Limit': config.max.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
    'X-RateLimit-Window': (config.window / 1000).toString(),
  });

  if (!result.allowed) {
    // Adicionar headers específicos quando limitado
    headers.set('Retry-After', getTimeUntilReset(result.resetTime).toString());

    const errorResponse = {
      error: 'Rate limit exceeded',
      message:
        config.message || 'Muitas requisições. Tente novamente mais tarde.',
      details: {
        limit: config.max,
        remaining: 0,
        resetTime: result.resetTime,
        retryAfter: getTimeUntilReset(result.resetTime),
      },
    };

    return NextResponse.json(errorResponse, {
      status: 429, // Too Many Requests
      headers,
    });
  }

  return null; // Permitido - não retorna response
}

// ========================================
// HELPERS PARA CONFIGURAÇÃO
// ========================================

/**
 * Cria configuração personalizada de rate limiting
 *
 * @param options - Opções de configuração
 * @returns Configuração completa
 */
export function createRateLimitConfig(
  options: Partial<RateLimitConfig>
): RateLimitConfig {
  return {
    max: 60,
    window: 60 * 1000,
    message: 'Rate limit exceeded',
    ...options,
  };
}

/**
 * Obtém configuração baseada no método HTTP
 *
 * @param method - Método HTTP (GET, POST, etc.)
 * @returns Configuração apropriada
 */
export function getConfigByMethod(method: string): RateLimitConfig {
  return DEFAULT_LIMITS[method] || DEFAULT_LIMITS.GET;
}

/**
 * Obtém estatísticas atuais do rate limiting
 *
 * @returns Estatísticas de uso
 */
export function getRateLimitStats(): {
  totalEntries: number;
  memoryUsage: string;
  oldestEntry: number | null;
  newestEntry: number | null;
} {
  let oldestEntry: number | null = null;
  let newestEntry: number | null = null;

  for (const entry of rateLimitStore.values()) {
    if (oldestEntry === null || entry.firstRequest < oldestEntry) {
      oldestEntry = entry.firstRequest;
    }
    if (newestEntry === null || entry.firstRequest > newestEntry) {
      newestEntry = entry.firstRequest;
    }
  }

  // Estimar uso de memória (aproximado)
  const estimatedMemory = rateLimitStore.size * 100; // ~100 bytes por entrada

  return {
    totalEntries: rateLimitStore.size,
    memoryUsage: `~${(estimatedMemory / 1024).toFixed(2)} KB`,
    oldestEntry,
    newestEntry,
  };
}

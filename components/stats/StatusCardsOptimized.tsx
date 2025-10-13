/**
 * Arquivo: components/stats/StatusCardsOptimized.tsx
 * Propósito: Cards de status clicáveis otimizados para navegação e performance
 *
 * Otimizações implementadas:
 * - React.memo() para evitar re-renders desnecessários
 * - useCallback() para callback de navegação memoizado
 * - useMemo() para lista de cards memoizada
 * - Configuração declarativa de cards (CARD_CONFIGS)
 * - Import de enum JobStatus para type safety
 *
 * Funcionalidades:
 * - 5 cards de status clicáveis
 * - Navegação para lista filtrada de vagas
 * - Animações de hover suaves
 * - Layout responsivo (2/3/5 colunas)
 * - Ícones visuais para cada status
 * - Cores de hover específicas por status
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { JobStatus } from '@/types';

import { JobStats } from '@/types';

// ========================================
// INTERFACES E TIPOS
// ========================================

interface StatusCardsProps {
  stats: JobStats;
}

// ========================================
// CONFIGURAÇÃO DECLARATIVA DOS CARDS
// ========================================

/**
 * CARD_CONFIGS: Configuração centralizada de todos os cards
 *
 * Por que essa abordagem:
 * - Evita duplicação de código
 * - Facilita manutenção (adicionar/remover cards)
 * - Configuração visual centralizada
 * - Type safety com enum JobStatus
 * - Facilita testes unitários
 *
 * Estrutura de cada config:
 * - status: Enum JobStatus para type safety
 * - label: Texto exibido no card
 * - icon: Emoji representativo do status
 * - hoverColor: Classe CSS para hover específico
 */
const CARD_CONFIGS = [
  {
    status: JobStatus.APPLIED,
    label: 'Candidatura Enviada',
    icon: '📝', // Documento/formulário
    hoverColor: 'hover:border-blue-300',
  },
  {
    status: JobStatus.TEST_PENDING,
    label: 'Teste Pendente',
    icon: '⏳', // Ampulheta/tempo
    hoverColor: 'hover:border-yellow-300',
  },
  {
    status: JobStatus.TEST_COMPLETED,
    label: 'Teste Concluído',
    icon: '✅', // Check/concluído
    hoverColor: 'hover:border-orange-300',
  },
  {
    status: JobStatus.INTERVIEW,
    label: 'Em Entrevista',
    icon: '🗣️', // Conversa/entrevista
    hoverColor: 'hover:border-purple-300',
  },
  {
    status: JobStatus.ACCEPTED,
    label: 'Aceitas',
    icon: '🎉', // Celebração/sucesso
    hoverColor: 'hover:border-green-300',
  },
] as const; // 'as const' para inferência de tipo mais precisa

const StatusCards: React.FC<StatusCardsProps> = ({ stats }) => {
  const router = useRouter();

  // ========================================
  // CALLBACKS MEMOIZADOS
  // ========================================

  /**
   * navigateToJobsWithFilter: Função de navegação memoizada
   *
   * @param status - Status opcional para filtrar vagas
   *
   * Por que useCallback:
   * - Evita criação de nova função a cada render
   * - Importante para performance quando passado como prop
   * - Evita re-renders desnecessários dos cards
   *
   * Funcionalidade:
   * - Com status: navega para /dashboard/jobs?status=APPLIED
   * - Sem status: navega para /dashboard/jobs (todas as vagas)
   */
  const navigateToJobsWithFilter = useCallback(
    (status?: string) => {
      const url = status
        ? `/dashboard/candidaturas/jobs?status=${status}`
        : '/dashboard/candidaturas/jobs';
      router.push(url);
    },
    [router]
  );

  // ========================================
  // MEMOIZAÇÃO DE ELEMENTOS
  // ========================================

  /**
   * cardElements: Lista de elementos JSX memoizada
   *
   * Por que memoizar:
   * - map() cria novos elementos a cada render
   * - Cada card tem múltiplas animações e estilos
   * - Evita re-criação desnecessária de elementos DOM
   * - Só recalcula quando stats.byStatus ou navigateToJobsWithFilter mudam
   *
   * Estrutura de cada card:
   * - button clicável com hover effects
   * - Layout flex com ícone e número
   * - Animações de escala no hover
   * - Label com transição de cor
   * - Cor de hover específica por status
   */
  const cardElements = useMemo(() => {
    return CARD_CONFIGS.map(({ status, label, icon, hoverColor }) => {
      const count = stats?.byStatus?.[status] ?? 0; // ✅ evita erro se byStatus for undefined

      return (
        <button
          key={status} // Chave única baseada no enum
          onClick={() => navigateToJobsWithFilter(status)}
          className={`bg-[color:var(--color-card)] p-3 rounded-lg border border-[color:var(--color-border)] hover:shadow-lg ${hoverColor} transition-all duration-200 text-left group`}
        >
          {/* Container flex para ícone e número */}
          <div className='flex items-center justify-between mb-2'>
            {/* Ícone com animação de escala */}
            <div className='text-2xl group-hover:scale-110 transition-transform duration-200'>
              {icon}
            </div>
            {/* Número com animação de escala */}
            <div className='text-2xl font-bold text-[color:var(--color-card-foreground)] group-hover:scale-105 transition-transform duration-200'>
              {count}
            </div>
          </div>
          {/* Label com transição de cor */}
          <div className='text-sm font-medium text-[color:var(--color-muted-foreground)] group-hover:text-[color:var(--color-card-foreground)] transition-colors duration-200'>
            {label}
          </div>
        </button>
      );
    });
  }, [stats?.byStatus, navigateToJobsWithFilter]); // Dependências para recálculo

  // ========================================
  // RENDERIZAÇÃO
  // ========================================

  /**
   * Grid responsivo:
   * - grid-cols-2: 2 colunas em mobile
   * - md:grid-cols-3: 3 colunas em tablet
   * - lg:grid-cols-5: 5 colunas em desktop
   * - gap-3: Espaçamento entre cards
   * - mb-6: Margem inferior
   */
  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6'>
      {cardElements}
    </div>
  );
};

/**
 * React.memo: Otimização para evitar re-renders
 *
 * StatusCards só re-renderiza quando:
 * - stats.byStatus muda (nova contagem de vagas)
 * - Props mudam
 *
 * Evita re-render quando:
 * - Outros componentes da página mudam
 * - Estado não relacionado muda
 * - Navegação entre páginas que não afetam stats
 *
 * Performance impact:
 * - Evita re-execução do useMemo
 * - Evita re-criação de 5 elementos button
 * - Melhora responsividade em interações
 */
export default React.memo(StatusCards);

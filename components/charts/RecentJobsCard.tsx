/**
 * Arquivo: components/charts/RecentJobsCard.tsx
 * Propósito: Lista otimizada de vagas recentes com scroll personalizado
 * 
 * Otimizações implementadas:
 * - React.memo() para evitar re-renders desnecessários
 * - useMemo() para memoização de lista de jobs
 * - Funções utilitárias centralizadas (getStatusCssClass, getStatusLabel, formatDate)
 * - Scrollbar customizada via CSS
 * - Layout responsivo e acessível
 * 
 * Funcionalidades:
 * - Lista scrollável de vagas recentes
 * - Cards individuais para cada vaga
 * - Status com cores e labels
 * - Data formatada em português
 * - Estado vazio tratado
 * - Hover effects suaves
 */

'use client'

import React, { useMemo } from 'react'
import { getStatusCssClass, getStatusLabel, formatDate } from '@/utils/jobUtils'

// ========================================
// INTERFACES E TIPOS
// ========================================

interface RecentJob {
  id: string;
  title: string;
  company: string;
  status: string;
  createdAt: string;
}

interface RecentJobsCardProps {
  recentJobs: RecentJob[];
}

const RecentJobsCard: React.FC<RecentJobsCardProps> = ({ recentJobs }) => {
  // ========================================
  // MEMOIZAÇÃO PARA PERFORMANCE

  
  /**
   * jobItems: Lista de componentes de vagas memoizada
   * 
   * Por que memoizar:
   * - map() cria novos componentes a cada render
   * - Operações de formatação (data, status) são custosas
   * - Evita re-criação de elementos DOM
   * - Só recalcula quando recentJobs muda
   * 
   * Estrutura de cada card:
   * - Container com hover effects
   * - Seção título/empresa
   * - Seção status/data com layout flexbox
   * - Formatação automática via utils
   */
  const jobItems = useMemo(() => {
    // Verificação de segurança: garante que recentJobs é um array válido
    if (!recentJobs || !Array.isArray(recentJobs) || recentJobs.length === 0) {
      return [];
    }
    
    return recentJobs.map((job) => (
      <div
        key={job.id}  // Chave única por ID da vaga
        className="bg-[color:var(--color-secondary)] rounded-lg p-4 hover:bg-[color:var(--color-secondary)]/80 transition-all duration-200 border border-[color:var(--color-border)]/50"
      >
        {/* Título e Empresa */}
        <div className="mb-3">
          <h4 className="font-semibold text-[color:var(--color-secondary-foreground)] text-base leading-tight mb-1">
            {job.title}
          </h4>
          <p className="text-sm text-[color:var(--color-muted-foreground)] font-medium">
            {job.company}
          </p>
        </div>
        
        {/* Status e Data */}
        <div className="flex items-center justify-between">
          {/* Badge de status com cores automáticas */}
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusCssClass(job.status)} shadow-sm`}>
            {getStatusLabel(job.status)}
          </span>
          {/* Data formatada em português */}
          <span className="text-xs text-[color:var(--color-muted-foreground)] font-medium bg-[color:var(--color-card)] px-2 py-1 rounded border">
            {formatDate(job.createdAt)}
          </span>
        </div>
      </div>
    ))
  }, [recentJobs])  // Dependência: só recalcula se lista de jobs mudar

  // ========================================
  // TRATAMENTO DE ESTADO VAZIO
  // ========================================
  
  /**
   * Se não há vagas recentes, mostra estado vazio
   * 
   * UX considerações:
   * - Ícone visual (📝) para contexto
   * - Mensagem clara e amigável
   * - Mesmo layout/altura do estado com dados
   * - Centralização vertical e horizontal
   */
  if (!recentJobs || !Array.isArray(recentJobs) || recentJobs.length === 0) {
    return (
      <div className="bg-[color:var(--color-card)] p-6 rounded-xl border border-[color:var(--color-border)] h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-[color:var(--color-muted-foreground)]">Nenhuma vaga recente</p>
        </div>
      </div>
    )
  }

  // ========================================
  // RENDERIZAÇÃO PRINCIPAL
  // ========================================
  
  return (
    <div className="bg-[color:var(--color-card)] p-6 rounded-xl border border-[color:var(--color-border)] h-full">
      {/* Header informativo */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[color:var(--color-card-foreground)]">
          Vagas Recentes
        </h3>
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          Últimas {recentJobs.length} vagas criadas
        </p>
      </div>
      
      {/* 
        Container scrollável com customizações:
        - max-h-96: Altura máxima (24rem = 384px)
        - overflow-y-auto: Scroll vertical automático
        - pr-2: Padding direito para não cortar conteúdo
        - scrollbar-thin: Classe customizada (definida em globals.css)
        - space-y-3: Espaçamento entre cards
      */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[color:var(--color-border)] scrollbar-track-transparent">
        {jobItems}  {/* Lista memoizada de componentes */}
      </div>
    </div>
  )
}

/**
 * React.memo: Otimização para evitar re-renders
 * 
 * RecentJobsCard só re-renderiza quando:
 * - recentJobs array muda (nova vaga, vaga deletada, etc)
 * - Referência do array muda
 * 
 * Evita re-render quando:
 * - Outros componentes da página mudam
 * - Estado não relacionado muda
 * - Props permanecem iguais (shallow comparison)
 * 
 * Performance gain:
 * - Evita re-execução do useMemo desnecessariamente
 * - Previne re-criação de elementos DOM
 * - Melhora responsividade da UI
 */
export default React.memo(RecentJobsCard)
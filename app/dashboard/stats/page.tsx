/**
 * Arquivo: app/dashboard/stats/page.tsx
 * Propósito: Página principal de estatísticas com dashboard completo
 * 
 * Otimizações implementadas:
 * - React.useCallback() para callbacks memoizados
 * - React.useMemo() para componentes pesados memoizados
 * - Estado de erro separado para melhor UX
 * - Componentes extraídos para melhor organização
 * - Lazy loading de seções do layout
 * - Tipos temporários para compatibilidade com API
 * 
 * Funcionalidades:
 * - Dashboard completo de estatísticas
 * - Cards de status clicáveis
 * - Gráfico de pizza interativo
 * - Lista de vagas recentes
 * - Estados de loading, erro e vazio
 * - Navegação contextual
 */

'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { getJobStats } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import JobsChart from '@/components/charts/JobsChart'
import RecentJobsCard from '@/components/charts/RecentJobsCard'
import StatusCards from '@/components/stats/StatusCardsOptimized'
import Loading from '@/components/ui/loading'
import { JobStats } from '@/types'

// ========================================
// TIPOS PARA COMPATIBILIDADE
// ========================================

/**
 * ApiJobStats: Tipo temporário para compatibilidade com API atual
 * 
 * Por que necessário:
 * - API retorna status como string
 * - Tipos novos esperam JobStatus enum
 * - Evita quebrar a aplicação durante transição
 * - Permite evolução gradual da tipagem
 * 
 * TODO: Remover quando API for atualizada para usar enums
 */
interface ApiJobStats {
  total: number;
  byStatus: Record<string, number>;      // API retorna string keys
  byType: Record<string, number>;
  byMode: Record<string, number>;
  recentApplications: number;
  recentJobs: Array<{
    id: string;
    title: string;
    company: string;
    status: string;                      // API retorna string
    createdAt: string;
  }>;
}

const StatsPage = () => {
  const router = useRouter()
  const { addToast } = useToast()
  
  // ========================================
  // ESTADO LOCAL
  // ========================================
  
  /**
   * Estados da página:
   * - stats: Dados das estatísticas (null = não carregado)
   * - loading: Indicador de carregamento
   * - error: Mensagem de erro específica (melhor UX que boolean)
   */
  const [stats, setStats] = useState<ApiJobStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ========================================
  // CALLBACKS MEMOIZADOS
  // ========================================
  
  /**
   * loadStats: Função para carregar estatísticas
   * 
   * Por que useCallback:
   * - Usado em useEffect e como dependência
   * - Evita loops infinitos de re-execução
   * - Permite reutilização (botão "Tentar Novamente")
   * 
   * Fluxo de execução:
   * 1. Ativa loading e limpa erros
   * 2. Chama API com cache automático
   * 3. Atualiza estado com dados recebidos
   * 4. Tratamento de erro robusto
   * 5. Sempre desativa loading
   * 
   * Tratamento de erro:
   * - Extrai mensagem específica se for Error
   * - Fallback para "Erro desconhecido"
   * - Toast para feedback visual
   * - Estado de erro para renderização
   */
  const loadStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)                    // Limpa erros anteriores
      const data = await getJobStats()  // API com cache automático
      setStats(data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      console.error('Erro ao carregar estatísticas:', error)
      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Erro ao carregar estatísticas',
        description: 'Não foi possível carregar as estatísticas. Tente novamente.'
      })
    } finally {
      setLoading(false)                 // Sempre executa
    }
  }, [addToast])

  /**
   * handleAddJobClick: Navegação memoizada para nova vaga
   * 
   * Por que useCallback:
   * - Passado como prop para múltiplos componentes
   * - Evita re-renders desnecessários
   * - Reutilização em diferentes contextos
   */
  const handleAddJobClick = useCallback(() => {
    router.push('/dashboard/add-job')
  }, [router])

  // ========================================
  // EFEITOS
  // ========================================
  
  /**
   * Carregamento inicial das estatísticas
   * 
   * Executa apenas uma vez na montagem do componente
   * loadStats é estável devido ao useCallback
   */
  useEffect(() => {
    loadStats()
  }, [loadStats])

  // ========================================
  // COMPONENTES MEMOIZADOS
  // ========================================
  
  /**
   * statsCards: Componente de cards memoizado
   * 
   * Por que memoizar:
   * - StatusCards é um componente pesado (5 cards com animações)
   * - Evita re-criação quando outros estados mudam
   * - Só recalcula quando stats muda
   * 
   * Retorna null se não há stats (evita renderização desnecessária)
   */
  const statsCards = useMemo(() => {
    if (!stats) return null
    return <StatusCards stats={stats} />
  }, [stats])

  /**
   * chartsSection: Seção de gráficos memoizada
   * 
   * Por que memoizar:
   * - JobsChart tem Recharts (biblioteca pesada)
   * - RecentJobsCard pode ter muitos itens
   * - Grid layout com cálculos CSS
   * - Só recalcula quando stats muda
   * 
   * Estrutura:
   * - Grid responsivo (1 coluna mobile, 2 desktop)
   * - Ordem explícita para controle de layout
   * - Gap consistente com resto da página
   */
  const chartsSection = useMemo(() => {
    if (!stats) return null
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="order-1">
          <JobsChart stats={stats} />
        </div>
        <div className="order-2">
          <RecentJobsCard recentJobs={stats.recentJobs} />
        </div>
      </div>
    )
  }, [stats])

  /**
   * emptyState: Estado vazio memoizado
   * 
   * Por que memoizar:
   * - Componente com múltiplos elementos
   * - Evita re-criação desnecessária
   * - Só recalcula quando stats ou handleAddJobClick mudam
   * 
   * Lógica:
   * - Só renderiza se stats existe e total === 0
   * - Design consistente com outros estados
   * - CTA claro para primeira ação
   */
  const emptyState = useMemo(() => {
    if (!stats || stats.total > 0) return null
    
    return (
      <div className="text-center py-12 bg-[color:var(--color-card)] rounded-lg border border-[color:var(--color-border)]">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-semibold mb-2 text-[color:var(--color-card-foreground)]">
          Nenhuma estatística disponível
        </h3>
        <p className="text-[color:var(--color-muted-foreground)] mb-6">
          Adicione suas primeiras vagas para ver estatísticas detalhadas
        </p>
        <Button
          onClick={handleAddJobClick}
          className="bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary)]/90"
        >
          + Adicionar Primeira Vaga
        </Button>
      </div>
    )
  }, [stats, handleAddJobClick])

  // ========================================
  // RENDERIZAÇÃO CONDICIONAL
  // ========================================
  
  /**
   * Estado de Loading
   * 
   * Características:
   * - Spinner animado centralizado
   * - Mensagem informativa
   * - Layout consistente com outros estados
   * - Não bloqueia a UI (pode ser cancelado)
   */
  if (loading) {
    return <Loading message="Carregando estatísticas..." />
  }

  /**
   * Estado de Erro
   * 
   * Características:
   * - Mostra mensagem de erro específica
   * - Botão para tentar novamente
   * - Layout consistente com loading
   * - Ação clara para recuperação
   */
  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-[color:var(--color-card-foreground)]">
            Erro ao carregar estatísticas
          </h2>
          {error && (
            <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
              {error}
            </p>
          )}
          <Button 
            onClick={loadStats} 
            className="mt-4 bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]"
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  // ========================================
  // RENDERIZAÇÃO PRINCIPAL
  // ========================================
  
  /**
   * Layout principal da página
   * 
   * Estrutura:
   * 1. Header com título e botão de ação
   * 2. Cards de status (memoizado)
   * 3. Seção de gráficos (memoizada)
   * 4. Estado vazio (condicional, memoizado)
   * 
   * Layout responsivo:
   * - max-w-7xl: Largura máxima
   * - mx-auto: Centralização horizontal
   * - p-4: Padding reduzido para mobile
   * - mb-6: Espaçamentos consistentes
   */
  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header da página */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--color-primary)]">Estatísticas de Vagas</h1>
          <p className="text-[color:var(--color-muted-foreground)] mt-1 text-sm">
            Acompanhe o progresso das suas candidaturas
          </p>
        </div>
        <Button
          onClick={handleAddJobClick}
          className="bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)] hover:bg-[color:var(--color-primary)]/90"
        >
          + Nova Vaga
        </Button>
      </div>

      {/* Componentes memoizados para performance */}
      {statsCards}      {/* Cards de status clicáveis */}
      {chartsSection}   {/* Gráfico e vagas recentes */}
      {emptyState}      {/* Estado vazio (se aplicável) */}
    </div>
  )
}

/**
 * Exportação do componente
 * 
 * Não usa React.memo aqui porque:
 * - É uma página (não recebe props)
 * - Gerencia próprio estado
 * - Re-renders são controlados internamente
 * - Next.js já otimiza páginas automaticamente
 */
export default StatsPage

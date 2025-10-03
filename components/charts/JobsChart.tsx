/**
 * Arquivo: components/charts/JobsChart.tsx
 * Propósito: Gráfico de pizza interativo para distribuição de status de vagas
 * 
 * Otimizações implementadas:
 * - React.memo() para evitar re-renders desnecessários
 * - useMemo() para cálculos custosos (dados do gráfico, total)
 * - Tooltip formatter memoizado
 * - Chaves únicas baseadas em status (não índices)
 * - Importação seletiva do Recharts
 * 
 * Funcionalidades:
 * - Gráfico de pizza responsivo
 * - Tooltip customizado com cores
 * - Legenda personalizada
 * - Estado vazio tratado
 * - Transições suaves
 */

'use client'

import React, { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { prepareChartData } from '@/utils/jobUtils'

// ========================================
// INTERFACES E TIPOS
// ========================================

interface JobStats {
  byStatus: Record<string, number>;
}

interface JobsChartProps {
  stats: JobStats;
}

const JobsChart: React.FC<JobsChartProps> = ({ stats }) => {
  // ========================================
  // MEMOIZAÇÃO PARA PERFORMANCE
  // ========================================
  
  /**
   * chartData: Dados preparados para o gráfico
   * 
   * Memoizado porque:
   * - prepareChartData() executa filtering e mapping
   * - Evita recálculo a cada render
   * - Só recalcula quando stats.byStatus muda
   */
  const chartData = useMemo(() => prepareChartData(stats.byStatus), [stats.byStatus])
  
  /**
   * total: Soma total de todas as vagas
   * 
   * Memoizado porque:
   * - reduce() pode ser custoso com muitos itens
   * - Usado em múltiplos lugares (header, cálculos)
   * - Só recalcula quando chartData muda
   */
  const total = useMemo(() => 
    chartData.reduce((sum, item) => sum + item.value, 0), 
    [chartData]
  )

  /**
   * tooltipFormatter: Função para formatar tooltips
   * 
   * Memoizada porque:
   * - Evita criação de nova função a cada render
   * - Recharts re-renderiza tooltip frequentemente
   * - Melhora performance em hover
   * 
   * Funcionalidade:
   * - Busca dados do item pelo name
   * - Retorna JSX com cor e texto formatado
   * - Pluralização automática (vaga/vagas)
   */
  const tooltipFormatter = useMemo(() => (value: any, name: any) => {
    const item = chartData.find(item => item.name === name)
    if (!item) return [value]
    
    return [
      <span key={item.status} style={{ color: item.color, fontWeight: 'bold', fontSize: '14px' }}>
        {item.fullName} - {value} vaga{Number(value) > 1 ? 's' : ''}
      </span>
    ]
  }, [chartData])

  // ========================================
  // TRATAMENTO DE ESTADO VAZIO
  // ========================================
  
  /**
   * Se não há dados, mostra estado vazio elegante
   * 
   * Por que verificar total === 0:
   * - chartData já filtrou itens com value 0
   * - total === 0 significa nenhuma vaga existe
   * - UX melhor que gráfico vazio
   */
  if (total === 0) {
    return (
      <div className="bg-[color:var(--color-card)] p-6 rounded-xl border border-[color:var(--color-border)] h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-[color:var(--color-muted-foreground)]">Nenhum dado para exibir</p>
        </div>
      </div>
    )
  }

  // ========================================
  // RENDERIZAÇÃO PRINCIPAL
  // ========================================
  
  return (
    <div className="bg-[color:var(--color-card)] p-6 rounded-xl border border-[color:var(--color-border)] h-full">
      {/* Header com informações */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[color:var(--color-card-foreground)]">
          Distribuição de Status
        </h3>
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          Total: {total} vagas
        </p>
      </div>
      
      {/* Container do gráfico com altura fixa */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"                    // Centro horizontal
              cy="50%"                    // Centro vertical
              innerRadius={50}            // Raio interno (donut)
              outerRadius={80}            // Raio externo
              paddingAngle={3}            // Espaço entre segmentos
              dataKey="value"             // Campo dos dados
              label={false}               // Sem labels no gráfico (evita cortes)
              stroke="var(--color-background)" // Borda dos segmentos
              strokeWidth={2}             // Largura da borda
            >
              {/* Renderizar cada segmento com cor específica */}
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${entry.status}`}  // Chave única baseada em status
                  fill={entry.color}             // Cor do segmento
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgb(0 0 0 / 0.1))',
                    transition: 'all 0.2s ease-in-out'
                  }}
                />
              ))}
            </Pie>
            {/* Tooltip customizado */}
            <Tooltip 
              formatter={tooltipFormatter}     // Formatter memoizado
              labelFormatter={() => ''}       // Sem label no tooltip
              contentStyle={{                 // Estilo do container
                backgroundColor: 'var(--color-card)',
                border: '2px solid var(--color-border)',
                borderRadius: '12px',
                color: 'var(--color-card-foreground)',
                boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
                padding: '12px 16px',
                fontSize: '14px',
                minWidth: '200px'
              }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} // Highlight ao hover
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda customizada otimizada */}
      <div className="mt-3 space-y-1">
        {chartData.map((item) => (
          <div 
            key={item.status}  // Chave única por status
            className="flex items-center justify-between py-1 px-1"
          >
            <span 
              className="text-xs font-medium"
              style={{ color: item.color }}  // Cor do status
            >
              {item.fullName}  {/* Nome completo */}
            </span>
            <span 
              className="text-xs font-bold"
              style={{ color: item.color }}  // Mesma cor para consistência
            >
              {item.value}  {/* Número de vagas */}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * React.memo: Otimização para evitar re-renders
 * 
 * JobsChart só re-renderiza quando:
 * - props.stats muda
 * - Componente pai força re-render
 * 
 * Evita re-render quando:
 * - Outros componentes da página mudam
 * - Estado não relacionado muda
 * - Props permanecem iguais
 */
export default React.memo(JobsChart)
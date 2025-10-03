'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface JobStats {
  byStatus: Record<string, number>;
}

interface JobsChartProps {
  stats: JobStats;
}

const JobsChart: React.FC<JobsChartProps> = ({ stats }) => {
  // Preparar dados para o gráfico
  const chartData = [
    {
      name: 'Candidatura',
      value: stats.byStatus.APPLIED || 0,
      color: '#3b82f6'
    },
    {
      name: 'Teste Pendente',
      value: stats.byStatus.TEST_PENDING || 0,
      color: '#eab308'
    },
    {
      name: 'Teste Concluído',
      value: stats.byStatus.TEST_COMPLETED || 0,
      color: '#f97316'
    },
    {
      name: 'Entrevista',
      value: stats.byStatus.INTERVIEW || 0,
      color: '#a855f7'
    },
    {
      name: 'Aceitas',
      value: stats.byStatus.ACCEPTED || 0,
      color: '#22c55e'
    }
  ].filter(item => item.value > 0) // Só mostrar status com valores

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

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

  return (
    <div className="bg-[color:var(--color-card)] p-6 rounded-xl border border-[color:var(--color-border)] h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[color:var(--color-card-foreground)]">
          Distribuição de Status
        </h3>
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          Total: {total} vagas
        </p>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value, percent }: any) => 
                `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [value, name]}
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-card-foreground)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda customizada */}
      <div className="mt-4 grid grid-cols-1 gap-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[color:var(--color-card-foreground)]">{item.name}</span>
            </div>
            <span className="font-medium text-[color:var(--color-card-foreground)]">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default JobsChart
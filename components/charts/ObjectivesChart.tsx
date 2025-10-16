"use client";

import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Loading from '@/components/ui/loading';

type ObjectiveStatus = 'a_fazer' | 'em_andamento' | 'concluido';

export interface ObjectivesStats {
  total: number;
  byStatus: Record<ObjectiveStatus, number>;
}

const STATUS_LABELS: Record<ObjectiveStatus, { short: string; full: string; color: string }> = {
  a_fazer: { short: 'A Fazer', full: 'A Fazer', color: '#f97316' }, // laranja
  em_andamento: { short: 'Andamento', full: 'Em andamento', color: '#3b82f6' }, // azul
  concluido: { short: 'Concluídos', full: 'Concluídos', color: '#22c55e' }, // verde
};

export default function ObjectivesChart({ stats }: { stats: ObjectivesStats }) {
  const data = useMemo(() => {
    const order: ObjectiveStatus[] = ['a_fazer', 'em_andamento', 'concluido'];
    return order
      .map((key) => ({
        name: STATUS_LABELS[key].short,
        fullName: STATUS_LABELS[key].full,
        value: stats.byStatus[key] || 0,
        color: STATUS_LABELS[key].color,
        key,
      }))
      .filter((d) => d.value > 0);
  }, [stats]);

  const total = useMemo(() => data.reduce((s, i) => s + i.value, 0), [data]);

  if (total === 0) {
    return (
        <Loading message="Carregando Objetivos e Metas..." />   
    );
  }

  const tooltipFormatter = (value: number, name: string) => {
    const item = data.find((d) => d.name === name);
    if (!item) return [value];
    return [
      <span key={item.key} style={{ color: item.color, fontWeight: 'bold', fontSize: 14 }}>
        {item.fullName} - {value} objetivo{Number(value) > 1 ? 's' : ''}
      </span>,
    ];
  };

  return (
    <div className="p-4 h-full w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[color:var(--color-card-foreground)]">Distribuição dos Objetivos</h3>
        <p className="text-sm text-[color:var(--color-muted-foreground)]">Total: {total} objetivos</p>
      </div>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={3}
              dataKey="value"
              label={false}
              stroke="var(--color-background)"
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} style={{ filter: 'drop-shadow(0 2px 4px rgb(0 0 0 / 0.1))', transition: 'all 0.2s ease-in-out' }} />
              ))}
            </Pie>
            <Tooltip
              formatter={tooltipFormatter as (value: number, name: string) => React.ReactNode[]}
              labelFormatter={() => ''}
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '2px solid var(--color-border)',
                borderRadius: '12px',
                color: 'var(--color-card-foreground)',
                boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
                padding: '12px 16px',
                fontSize: '14px',
                minWidth: '200px',
              }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 space-y-1">
        {data.map((item) => (
          <div key={item.key} className="flex items-center justify-between py-1 px-1">
            <span className="text-xs font-medium" style={{ color: item.color }}>{item.fullName}</span>
            <span className="text-xs font-bold" style={{ color: item.color }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

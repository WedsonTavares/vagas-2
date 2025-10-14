"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { useConfirmation } from '@/components/ui/confirmation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import type { Certificate } from '@/types';
import { ExpansiveCard } from '@/components/certificados/ExpansiveCard';

export default function Certificados() {
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { confirm } = useConfirmation();
  const { addToast } = useToast();

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cursos/certificados');
      const data = await res.json();
      setItems(data || []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      addToast({ type: 'error', title: 'Falha ao carregar certificados' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Formata data YYYY-MM-DD (ou ISO) sem aplicar timezone local (evita retroceder 1 dia)
  const fmt = (isoDate?: string | null) => {
    if (!isoDate) return '—';
    const [y, m, d] = isoDate.split('T')[0].split('-').map((v) => parseInt(v, 10));
    if (!y || !m || !d) return '—';
    const utc = new Date(Date.UTC(y, m - 1, d));
    return utc.toLocaleDateString('pt-BR');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Certificados</h1>
        <Link href="/dashboard/cursos/certificados/add">
          <Button>Adicionar Certificado</Button>
        </Link>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : items.length === 0 ? (
        <div className="p-6 bg-[color:var(--color-card)] rounded border border-[color:var(--color-border)]">Nenhum certificado encontrado</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((c) => (
            <div key={c.id} className="p-4 bg-[color:var(--color-card)] rounded border border-[color:var(--color-border)] flex flex-col">
              <div className="flex gap-4">
                <div className="w-28 h-20 bg-[color:var(--color-border)] rounded overflow-hidden flex items-center justify-center">
                  {c.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.previewUrl} alt={c.fileName || 'preview'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-[color:var(--color-muted-foreground)] text-xs">Sem preview</div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="text-sm text-[color:var(--color-muted-foreground)]">{c.institution || '—'}</div>
                  <div className="text-lg font-semibold text-[color:var(--color-card-foreground)]">{c.courseName}</div>
                  <div className="text-sm text-[color:var(--color-muted-foreground)] mt-2">{fmt(c.startDate)} — {fmt(c.endDate)}</div>
                  {c.duration && <div className="text-xs inline-block mt-2 px-2 py-1 bg-[color:var(--color-border)] rounded">{c.duration}</div>}
                </div>
              </div>

              <div className="mt-4 flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedId((prev) => (prev === c.id ? null : c.id))}
                  aria-expanded={expandedId === c.id}
                  aria-controls={`cert-${c.id}`}
                >
                  {expandedId === c.id ? 'Fechar' : 'Abrir'}
                </Button>
                <a href={`/api/cursos/certificados/${c.id}/download`} aria-label={`Baixar ${c.fileName || 'certificado'}`}>
                  <Button variant="outline" size="sm">Baixar</Button>
                </a>
                <Button variant="ghost" size="sm" onClick={async () => {
                  const ok = await confirm({ title: 'Deseja excluir este certificado?', description: 'A ação removerá o certificado e o arquivo do storage.', confirmLabel: 'Excluir', cancelLabel: 'Cancelar', type: 'danger' });
                  if (!ok) return;
                  try {
                    const res = await fetch(`/api/cursos/certificados/${c.id}`, { method: 'DELETE' });
                    if (!res.ok) throw new Error('Erro ao excluir');
                    fetchList();
                  } catch (err) {
                    // eslint-disable-next-line no-console
                    console.error(err);
                    addToast({ type: 'error', title: 'Erro ao excluir' });
                  }
                }}>Excluir</Button>
              </div>

              <div
                id={`cert-${c.id}`}
                className={`overflow-hidden transition-all duration-300 ${expandedId === c.id ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'} border rounded-lg p-4 bg-background`}
                aria-hidden={expandedId !== c.id}
              >
                {expandedId === c.id && <ExpansiveCard data={c} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

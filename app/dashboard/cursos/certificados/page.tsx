"use client";

import React, { useEffect, useState } from 'react';
import { useConfirmation } from '@/components/ui/confirmation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

type Certificate = {
  id: string;
  courseName: string;
  institution?: string;
  startDate?: string | null;
  endDate?: string | null;
  duration?: string | null;
  fileName?: string | null;
  previewUrl?: string | null;
};

export default function Certificados() {
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const { confirm } = useConfirmation();
  const { addToast } = useToast();

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cursos/certificados');
      const data = await res.json();
      setItems(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

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
                  <div className="text-sm text-[color:var(--color-muted-foreground)] mt-2">{c.startDate ? new Date(c.startDate).toLocaleDateString('pt-BR') : '—'} — {c.endDate ? new Date(c.endDate).toLocaleDateString('pt-BR') : '—'}</div>
                  {c.duration && <div className="text-xs inline-block mt-2 px-2 py-1 bg-[color:var(--color-border)] rounded">{c.duration}</div>}
                </div>
              </div>

              <div className="mt-4 flex gap-2 justify-end">
                <Link href={`/dashboard/cursos/certificados/${c.id}`}>
                  <Button variant="ghost" size="sm">Abrir</Button>
                </Link>
                <a href={`/api/cursos/certificados/${c.id}/download`}>
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
                    console.error(err);
                    addToast({ type: 'error', title: 'Erro ao excluir' });
                  }
                }}>Excluir</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

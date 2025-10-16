"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ObjetivosList } from "../../../../components/objetivos/ObjetivosList";
import { ObjetivoForm } from "../../../../components/objetivos/ObjetivoForm";
import { Objective } from "../../../../types";
import ObjectivesChart from "../../../../components/charts/ObjectivesChart";
import { Modal } from "../../../../components/ui/modal";
import { Button } from "../../../../components/ui/button";
import Loading from "../../../../components/ui/loading";
// Checklist renderizado inline via ObjetivosList

export default function ListaObjetivosPage() {
  const [objetivos, setObjetivos] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"em_andamento" | "concluido" | "futuro" | "todos">("todos");
  const [showCreateObjective, setShowCreateObjective] = useState(false);
  const [showEditObjective, setShowEditObjective] = useState<null | Objective>(null);
  // Modal de checklist foi removido em favor da expansão inline

  useEffect(() => {
    async function fetchObjetivos() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/objetivos");
        if (!res.ok) throw new Error("Erro ao buscar objetivos");
        const data = await res.json();
        setObjetivos(Array.isArray(data) ? data : []);
      } catch {
        setError("Não foi possível carregar os objetivos.");
      } finally {
        setLoading(false);
      }
    }
    fetchObjetivos();
  }, []);

  async function handleCreate(obj: { title: string; description?: string; priorityColor?: string }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/objetivos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: obj.title, status: 'futuro' })
      });
      if (!res.ok) throw new Error("Erro ao criar objetivo");
      const newObj = await res.json();
      // salva prioridade no localStorage (frontend-only)
      if (obj.priorityColor) {
        try {
          const key = `objective:priority:${newObj.id}`;
          localStorage.setItem(key, obj.priorityColor);
        } catch { }
      }
      setObjetivos(prev => [...prev, newObj]);
      setShowCreateObjective(false);
    } catch {
      setError("Não foi possível criar o objetivo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(id: string, data: { title: string; description?: string }) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/objetivos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.title })
      });
      if (!res.ok) throw new Error("Erro ao editar objetivo");
      const updated = await res.json();
      setObjetivos(prev => prev.map(o => (o.id === id ? updated : o)));
      setShowEditObjective(null);
    } catch {
      setError("Não foi possível editar o objetivo.");
    } finally {
      setLoading(false);
    }
  }

  // Checklist passou a expandir inline no card; modal removido

  // Handlers de checklist agora estão dentro da lista/expansão inline

  const filtered = useMemo(() => {
    if (statusFilter === "todos") return objetivos;
    return objetivos.filter(o => o.status === statusFilter);
  }, [objetivos, statusFilter]);

  const andamentoCount = objetivos.filter(o => o.status === "em_andamento").length;
  const concluidoCount = objetivos.filter(o => o.status === "concluido").length;
  const aFazerCount = objetivos.filter(o => o.status === "futuro").length; // renomeado para A Fazer na UI
  const objStats = {
    total: objetivos.length,
    byStatus: {
      a_fazer: aFazerCount,
      em_andamento: andamentoCount,
      concluido: concluidoCount,
    },
  } as const;

  if (loading) {
    return <Loading message="Carregando Objetivos..." />;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-2 sm:px-0">
      <div className="p-0 sm:p-4 text-left">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-[color:var(--color-primary)] text-left">Meus Objetivos e Metas do Semestre</h1>
        <p className="text-left mb-3 sm:mb-0">Gerenciar objetivos e metas.</p>
      </div>

      {/* Cards de filtros por status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-6 items-stretch">
        <button
          className={`rounded p-4 text-left transition-colors ${statusFilter === "em_andamento" ? "bg-blue-100/60 border-blue-300 dark:bg-blue-400/10" : "bg-[color:var(--color-card)] border-[color:var(--color-border)]"}`}
          onClick={() => setStatusFilter("em_andamento")}
        >
          <div className="h-full flex  flex-col justify-between">
            <div className="text-sm text-[color:var(--color-muted-foreground)]">Em andamento</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{andamentoCount}</div>
          </div>
        </button>
        <button
          className={`rounded p-4 text-left transition-colors ${statusFilter === "concluido" ? "bg-green-100/60 border-green-300 dark:bg-green-400/10" : "bg-[color:var(--color-card)] border-[color:var(--color-border)]"}`}
          onClick={() => setStatusFilter("concluido")}
        >
          <div className="h-full flex flex-col justify-between">
            <div className="text-sm text-[color:var(--color-muted-foreground)]">Concluídos</div>
            <div className="text-2xl font-bold text-green-500 dark:text-green-300">{concluidoCount}</div>
          </div>
        </button>
        <button
          className={`rounded p-4 text-left transition-colors ${statusFilter === "futuro" ? "bg-orange-100/60 border-orange-300 dark:bg-orange-400/10" : "bg-[color:var(--color-card)] border-[color:var(--color-border)]"}`}
          onClick={() => setStatusFilter("futuro")}
        >
          <div className="h-full flex flex-col justify-between">
            <div className="text-sm text-[color:var(--color-muted-foreground)]">A Fazer</div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{aFazerCount}</div>
          </div>
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between gap-2">
        {statusFilter !== 'todos' && filtered.length > 0 ? (
          <button
            className="flex items-center gap-1 text-sm font-medium px-3"
            onClick={() => setStatusFilter('todos')}
            title="Limpar filtro"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="inline-block">
              <path d="M3 4h18" />
              <path d="M8 4v5.586a1 1 0 0 1-.293.707l-3.414 3.414A1 1 0 0 0 5 15h14a1 1 0 0 0 .707-1.707l-3.414-3.414A1 1 0 0 1 16 9.586V4" />
              <path d="M10 19h4" />
            </svg>
            Limpar filtro
          </button>
        ) : <div />}
        <Button onClick={() => setShowCreateObjective(true)} variant="add">
          Novo objetivo
        </Button>
      </div>

      {/* Sem filtro: gráfico. Com filtro: lista */}
      {statusFilter === 'todos' ? (
        <div className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-card)]">
          <ObjectivesChart stats={objStats} />
        </div>
      ) : (
        <ObjetivosList
          objetivos={filtered}
          loading={loading}
          onEdit={(id) => {
            const obj = objetivos.find(o => o.id === id);
            if (obj) setShowEditObjective(obj);
          }}
          onDelete={async (id) => {
            const res = await fetch(`/api/objetivos/${id}`, { method: 'DELETE' });
            if (res.ok) {
              setObjetivos(prev => prev.filter(o => o.id !== id));
            }
          }}
          onStart={async (id) => {
            const res = await fetch(`/api/objetivos/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'em_andamento' })
            });
            if (res.ok) {
              const updated = await res.json();
              setObjetivos(prev => prev.map(o => o.id === id ? updated : o));
            }
          }}
          onStatusChange={(id, status) => {
            setObjetivos(prev => prev.map(o => o.id === id ? { ...o, status } : o));
          }}
        />
      )}

      {/* Modal: criar objetivo */}
      <Modal open={showCreateObjective} onClose={() => setShowCreateObjective(false)} title="Novo objetivo">
        <ObjetivoForm onSubmit={handleCreate} submitLabel="Criar objetivo" />
        {error && <div className="text-red-600 text-sm mt-3">{error}</div>}
      </Modal>

      {/* Modal: editar objetivo */}
      <Modal open={!!showEditObjective} onClose={() => setShowEditObjective(null)} title="Editar objetivo">
        {showEditObjective && (
          <ObjetivoForm
            initial={{ title: showEditObjective.name, description: showEditObjective.description || undefined }}
            onSubmit={(data) => handleEdit(showEditObjective.id, data)}
            submitLabel="Salvar alterações"
          />
        )}
        {error && <div className="text-red-600 text-sm mt-3">{error}</div>}
      </Modal>

      {/* Modal de checklist removido: conteúdo aparece expandido no card */}
    </div>
  );
}

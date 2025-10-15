"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Objective, ObjectiveChecklist } from "../../../../types";
import { ChecklistList } from "../../../../components/objetivos/ChecklistList";
import { ChecklistForm } from "../../../../components/objetivos/ChecklistForm";

export default function ObjetivoDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id as string;

  const [objective, setObjective] = useState<Objective | null>(null);
  const [items, setItems] = useState<ObjectiveChecklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => objective?.name ?? "Objetivo", [objective]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [objRes, itemsRes] = await Promise.all([
        fetch(`/api/objetivos/${id}`),
        fetch(`/api/objetivos/${id}/checklists`),
      ]);
      if (!objRes.ok) throw new Error("Erro ao carregar objetivo");
      if (!itemsRes.ok) throw new Error("Erro ao carregar checklist");
      const objData = await objRes.json();
      const itemsData = await itemsRes.json();
      setObjective(objData);
      setItems(Array.isArray(itemsData) ? itemsData : []);
    } catch {
      setError("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id, loadData]);

  async function handleToggle(itemId: string) {
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) return;
      const res = await fetch(`/api/objetivos/${id}/checklists/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !item.completed }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar item");
      const updated = await res.json();
      setItems(prev => prev.map(i => (i.id === itemId ? updated : i)));
    } catch {
      // feedback de erro poderia usar toast do projeto
    }
  }

  async function handleDelete(itemId: string) {
    try {
      const res = await fetch(`/api/objetivos/${id}/checklists/${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir item");
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch {
      // feedback de erro
    }
  }

  async function handleAdd(data: { title: string; description?: string }) {
    try {
      const res = await fetch(`/api/objetivos/${id}/checklists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: data.title, description: data.description }),
      });
      if (!res.ok) throw new Error("Erro ao adicionar item");
      const created = await res.json();
      setItems(prev => [...prev, created]);
    } catch {
      // feedback de erro
    }
  }

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }
  if (error) {
    return (
      <div className="p-6 text-red-600">
        {error}
        <button className="ml-3 underline" onClick={loadData}>Tentar novamente</button>
      </div>
    );
  }
  if (!objective) {
    return <div className="p-6">Objetivo não encontrado.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <button className="text-sm underline mb-4" onClick={() => router.push('/dashboard/objetivos/lista')}>
        Voltar
      </button>
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      {objective.description && (
        <p className="text-gray-600 mb-6">{objective.description}</p>
      )}

      <div className="mb-4">
        <ChecklistForm onSubmit={handleAdd} />
      </div>

      <ChecklistList items={items} onToggle={handleToggle} onDelete={handleDelete} />
    </div>
  );
}

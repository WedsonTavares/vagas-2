"use client";
// Lista de objetivos do usuário
// Renderiza uma lista de ObjetivoCard e lida com estados de carregamento/vazio
import React from 'react';
import { Button } from '../ui/button';
import { ObjetivoCard } from './ObjetivoCard';
import { Objective, ObjectiveChecklist } from '../../types';
import { ChecklistList } from './ChecklistList';
import Loading from '../ui/loading';

export interface ObjetivosListProps {
    objetivos: Objective[];
    loading?: boolean;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onStart?: (id: string) => Promise<void> | void;
    onStatusChange?: (id: string, status: Objective['status']) => Promise<void> | void;
}

export const ObjetivosList: React.FC<ObjetivosListProps> = ({ objetivos, loading, onEdit, onDelete, onStart, onStatusChange }) => {
    const [expandedId, setExpandedId] = React.useState<string | null>(null);
    const [checklists, setChecklists] = React.useState<Record<string, ObjectiveChecklist[]>>({});
    const [loadingChecklist, setLoadingChecklist] = React.useState<string | null>(null);
    const [priorityColors, setPriorityColors] = React.useState<Record<string, string | undefined>>({});

    React.useEffect(() => {
        try {
            const map: Record<string, string | undefined> = {};
            objetivos.forEach(o => {
                const c = localStorage.getItem(`objective:priority:${o.id}`) || undefined;
                map[o.id] = c || undefined;
            });
            setPriorityColors(map);
        } catch { }
    }, [objetivos]);

    if (loading) {
        return <Loading message="Carregando Objetivos..." />;
    }
    if (!objetivos.length) {
        return <div className="p-4 text-center text-gray-500">Nenhum objetivo cadastrado.</div>;
    }
    return (
        <div className="grid grid-cols-1 gap-3 lg:gap-4 items-stretch">
            {objetivos.map(obj => (
                <div key={obj.id} className="h-full">
                    <ObjetivoCard
                        {...obj}
                        onEdit={onEdit}
                        onDelete={async (id) => {
                            if (onDelete) return onDelete(id);
                            await fetch(`/api/objetivos/${id}`, { method: 'DELETE' });
                        }}
                        onStart={() => onStart?.(obj.id)}
                        priorityColor={priorityColors[obj.id]}
                        onChecklist={() => {
                            if (obj.status === 'futuro') return;
                            if (expandedId === obj.id) {
                                setExpandedId(null);
                                return;
                            }
                            setExpandedId(obj.id);
                            setLoadingChecklist(obj.id);
                            fetch(`/api/objetivos/${obj.id}/checklists`)
                                .then(res => res.ok ? res.json() : [])
                                .then(data => setChecklists(prev => ({ ...prev, [obj.id]: Array.isArray(data) ? data : [] })))
                                .finally(() => setLoadingChecklist(null));
                        }}
                    >
                        {/* Checklist expansion inside the card */}
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className={`overflow-hidden transition-all duration-300 ${expandedId === obj.id ? 'max-h-[500px] opacity-100 py-4' : 'max-h-0 opacity-0 py-0'} px-4 bg-[color:var(--color-card)]`}
                            aria-hidden={expandedId !== obj.id}
                        >
                            {expandedId === obj.id && (
                                loadingChecklist === obj.id ? (
                                    <Loading message="Carregando Checklist..." />
                                ) : (
                                    <>
                                        {obj.status !== 'futuro' && (
                                            <>
                                                <ChecklistList
                                                    items={checklists[obj.id] || []}
                                                    onToggle={async (checkId) => {
                                                        const current = (checklists[obj.id] || []).find(i => i.id === checkId);
                                                        const res = await fetch(`/api/objetivos/${obj.id}/checklists/${checkId}`, {
                                                            method: 'PATCH',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ completed: !current?.completed })
                                                        });
                                                        if (res.ok) {
                                                            const updated = await res.json();
                                                            setChecklists(prev => ({
                                                                ...prev,
                                                                [obj.id]: (prev[obj.id] || []).map(i => i.id === checkId ? updated : i)
                                                            }));
                                                            const list = (checklists[obj.id] || []).map(i => i.id === checkId ? updated : i);
                                                            const total = list.length;
                                                            const done = list.filter(i => i.completed).length;
                                                            let newStatus: Objective['status'] = obj.status;
                                                            if (done === total && total > 0) newStatus = 'concluido';
                                                            else if (done > 0) newStatus = 'em_andamento';
                                                            else newStatus = 'futuro';
                                                            if (newStatus !== obj.status) {
                                                                await fetch(`/api/objetivos/${obj.id}`, {
                                                                    method: 'PATCH',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ status: newStatus })
                                                                });
                                                                onStatusChange?.(obj.id, newStatus);
                                                            }
                                                        }
                                                    }}
                                                    onDelete={async (checkId) => {
                                                        await fetch(`/api/objetivos/${obj.id}/checklists/${checkId}`, { method: 'DELETE' });
                                                        setChecklists(prev => ({
                                                            ...prev,
                                                            [obj.id]: (prev[obj.id] || []).filter(i => i.id !== checkId)
                                                        }));
                                                        const list = (checklists[obj.id] || []).filter(i => i.id !== checkId);
                                                        const total = list.length;
                                                        const done = list.filter(i => i.completed).length;
                                                        let newStatus: Objective['status'] = obj.status;
                                                        if (done === total && total > 0) newStatus = 'concluido';
                                                        else if (done > 0) newStatus = 'em_andamento';
                                                        else newStatus = 'futuro';
                                                        if (newStatus !== obj.status) {
                                                            await fetch(`/api/objetivos/${obj.id}`, {
                                                                method: 'PATCH',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ status: newStatus })
                                                            });
                                                            onStatusChange?.(obj.id, newStatus);
                                                        }
                                                    }}
                                                />
                                                {obj.status === 'em_andamento' && (
                                                    <div className="mt-4">
                                                        <form className="flex flex-col sm:flex-row gap-2" onSubmit={async (e) => {
                                                            e.preventDefault();
                                                            const form = e.currentTarget as HTMLFormElement;
                                                            const fd = new FormData(form);
                                                            const title = String(fd.get('title') || '').trim();
                                                            const description = String(fd.get('description') || '').trim();
                                                            if (!title) return;
                                                            const res = await fetch(`/api/objetivos/${obj.id}/checklists`, {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ title, description: description || undefined })
                                                            });
                                                            if (res.ok) {
                                                                const created = await res.json();
                                                                setChecklists(prev => ({ ...prev, [obj.id]: [...(prev[obj.id] || []), created] }));
                                                                (form.querySelector('input[name="title"]') as HTMLInputElement).value = '';
                                                                (form.querySelector('input[name="description"]') as HTMLInputElement).value = '';
                                                            }
                                                        }}>
                                                            <input name="title" placeholder="Novo item" className="flex-1 border rounded p-2 py-1" />
                                                            <input name="description" placeholder="Descrição (opcional)" className="flex-1 border rounded p-2 py-1" />
                                                            <Button type="submit" variant="add" className="px-3 py-1">Adicionar Prova</Button>
                                                        </form>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                )
                            )}
                        </div>
                    </ObjetivoCard>
                </div>
            ))}
        </div>
    );
};

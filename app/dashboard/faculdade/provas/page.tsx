'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/back-button';
import { useConfirmation } from '@/components/ui/confirmation';
import { useToast } from '@/components/ui/toast';
import { Exam } from '@/types';
import Loading from '@/components/ui/loading';

export default function ProvasPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form state
  const [materia, setMateria] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  // modal state for completing a prova
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completingExamId, setCompletingExamId] = useState<string | null>(null);
  const [completeGrade, setCompleteGrade] = useState<string>('');
  const [completeProfessor, setCompleteProfessor] = useState<string>('');
  const { confirm } = useConfirmation();
  const { addToast } = useToast();

  const fetchExams = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/faculdade/provas');
      if (!res.ok) throw new Error('Erro ao buscar provas');
      const data = await res.json();
      setExams(data || []);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      addToast({ type: 'error', title: 'Falha ao carregar provas' });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const [showForm, setShowForm] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materia || !examDate) {
      addToast({ type: 'error', title: 'Preencha matéria e data' });
      return;
    }
    setSaving(true);
    try {
      const body = { materia, examDate, examTime, location, notes };
      const res = await fetch('/api/faculdade/provas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Erro ao criar prova');
      }
      await fetchExams();
      // clear form
      setMateria('');
      setExamDate('');
      setExamTime('');
      setLocation('');
      setNotes('');
      setShowForm(false);
      addToast({ type: 'success', title: 'Prova adicionada' });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      addToast({ type: 'error', title: (err as Error).message || 'Erro' });
    } finally {
      setSaving(false);
    }
  };

  const openCompleteModal = (id: string) => {
    setCompletingExamId(id);
    setCompleteGrade('');
    setCompleteProfessor('');
    setIsCompleteModalOpen(true);
  };

  const handleDirectDelete = async (id: string) => {
    try {
      const confirmed = await confirm({
        title: 'Deseja excluir o simulado?',
        description: 'Esta ação removerá o simulado permanentemente.',
        confirmLabel: 'Excluir',
        cancelLabel: 'Cancelar',
        type: 'danger',
      });
      if (!confirmed) return;

      const res = await fetch(`/api/faculdade/provas/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Erro ao excluir prova');
      }
      await fetchExams();
      addToast({ type: 'success', title: 'Prova excluída' });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      addToast({ type: 'error', title: (err as Error).message || 'Erro ao excluir prova' });
    }
  };

  const handleCancelComplete = () => {
    setIsCompleteModalOpen(false);
    setCompletingExamId(null);
  };

  const handleConfirmComplete = async () => {
    if (!completingExamId) return;
    // validate grade if provided
    const gradeNum = completeGrade ? Number(completeGrade) : null;
    if (completeGrade && (isNaN(gradeNum as number) || gradeNum! < 0)) {
      addToast({ type: 'error', title: 'Nota inválida' });
      return;
    }

    try {
      const body = { id: completingExamId, grade: gradeNum, professor: completeProfessor };
      const res = await fetch('/api/faculdade/provas/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || 'Erro ao finalizar prova');
      }
      // success: refetch exams and close modal
      await fetchExams();
      setIsCompleteModalOpen(false);
      setCompletingExamId(null);
      addToast({ type: 'success', title: 'Prova finalizada' });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      addToast({ type: 'error', title: (err as Error).message || 'Erro' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BackButton href="/dashboard/faculdade" />
          <div>
            <h1 className="text-3xl font-bold text-[color:var(--color-primary)]">Provas e Simulados</h1>
            <p className="text-[color:var(--color-muted-foreground)] mt-1 text-sm">Registre provas, local e horários</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-end">
        <Button onClick={() => setShowForm((s) => !s)} variant={showForm ? 'outline' : 'add'}>
          {showForm ? 'Cancelar' : 'Adicionar Prova'}
        </Button>
      </div>

      {/* Formulário de criação (toggle) */}
      {showForm && (
      <form onSubmit={handleCreate} className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)] mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={materia}
          onChange={(e) => setMateria(e.target.value)}
          placeholder="Matéria"
          className="p-2 border border-[color:var(--color-border)] rounded bg-[color:var(--color-card)] text-[color:var(--color-card-foreground)]"
        />
        <input
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          type="date"
          className="p-2 border border-[color:var(--color-border)] rounded bg-[color:var(--color-card)] text-[color:var(--color-card-foreground)]"
        />
        <input
          value={examTime}
          onChange={(e) => setExamTime(e.target.value)}
          type="time"
          className="p-2 border border-[color:var(--color-border)] rounded bg-[color:var(--color-card)] text-[color:var(--color-card-foreground)]"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Local"
          className="p-2 border border-[color:var(--color-border)] rounded bg-[color:var(--color-card)] text-[color:var(--color-card-foreground)] md:col-span-2"
        />
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações"
          className="p-2 border border-[color:var(--color-border)] rounded bg-[color:var(--color-card)] text-[color:var(--color-card-foreground)] md:col-span-2"
        />
        <div className="md:col-span-3 flex gap-2 justify-end">
          <Button type="submit" variant="add" disabled={saving}>{saving ? 'Salvando...' : 'Adicionar Prova'}</Button>
        </div>
      </form>
      )}

      {/* Lista */}
      {loading ? (
        <Loading message='Carregando Provas...' />
      ) : exams.length === 0 ? (
        <div className="text-center py-12 bg-[color:var(--color-card)] rounded-lg border border-[color:var(--color-border)]">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2 text-[color:var(--color-card-foreground)]">Nenhuma prova cadastrada</h3>
          <p className="text-[color:var(--color-muted-foreground)]">Adicione provas usando o formulário acima</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-[color:var(--color-card)] p-4 rounded-lg border border-[color:var(--color-border)]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-[color:var(--color-muted-foreground)]">Matéria</div>
                  <div className="text-lg font-semibold text-[color:var(--color-card-foreground)]">{exam.materia}</div>
                </div>
                <div className="text-sm text-[color:var(--color-muted-foreground)]">{new Date(exam.examDate).toLocaleDateString('pt-BR')}</div>
              </div>
              <div className="mt-3 text-sm text-[color:var(--color-muted-foreground)]">Horário: {exam.examTime || '—'}</div>
              <div className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">Local: {exam.location || '—'}</div>
              {exam.notes && <div className="mt-2 text-sm text-[color:var(--color-card-foreground)]">{exam.notes}</div>}
              <div className="mt-4 flex justify-end gap-2 cursor-pointer">
                <Button

                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const notesVal = exam.notes ?? '';
                    if (notesVal.toString().trim().toLowerCase() === 'prova av') {
                      openCompleteModal(exam.id);
                    } else {
                      handleDirectDelete(exam.id);
                    }
                  }}
                >
                  Marcar como concluido
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complete modal */}
      {isCompleteModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div className='absolute inset-0 bg-black/50' onClick={handleCancelComplete} />
          <div className='relative bg-[color:var(--color-card)] rounded-lg border border-[color:var(--color-border)] shadow-xl max-w-md w-full mx-4 p-6'>
            <h3 className='text-lg font-semibold mb-4'>Finalizar Prova</h3>
            <div className='space-y-3'>
              <div>
                <label className='block text-sm mb-1'>Nota (opcional)</label>
                <input value={completeGrade} onChange={(e) => setCompleteGrade(e.target.value)} className='w-full p-2 border border-[color:var(--color-border)] rounded bg-[color:var(--color-card)]' />
              </div>
              <div>
                <label className='block text-sm mb-1'>Professor (opcional)</label>
                <input value={completeProfessor} onChange={(e) => setCompleteProfessor(e.target.value)} className='w-full p-2 border border-[color:var(--color-border)] rounded bg-[color:var(--color-card)]' />
              </div>
              <div className='flex gap-2 justify-end'>
                <Button variant='outline' onClick={handleCancelComplete}>Cancelar</Button>
                <Button onClick={handleConfirmComplete} className='bg-[color:var(--color-primary)] text-[color:var(--color-primary-foreground)]'>Confirmar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

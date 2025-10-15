// Formulário para criar ou editar objetivo
// Utiliza campos controlados e validação simples
import React, { useState } from 'react';

export interface ObjetivoFormProps {
  initial?: {
    title?: string;
    description?: string;
    priorityColor?: string;
  };
  onSubmit: (data: { title: string; description?: string; priorityColor?: string }) => void;
  loading?: boolean;
  submitLabel?: string;
}

export const ObjetivoForm: React.FC<ObjetivoFormProps> = ({ initial, onSubmit, loading, submitLabel }) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [priorityColor, setPriorityColor] = useState<string | undefined>(initial?.priorityColor);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('O título é obrigatório.');
      return;
    }
    setError(null);
  // description mantido no UI mas não será enviado para a API até existir coluna
  onSubmit({ title: title.trim(), priorityColor });
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <label className="font-medium">Título</label>
      <input
        className="border rounded px-2 py-1"
        value={title}
        onChange={e => setTitle(e.target.value)}
        disabled={loading}
        required
      />
      <label className="font-medium">Descrição</label>
      <textarea
        className="border rounded px-2 py-1"
        value={description}
        onChange={e => setDescription(e.target.value)}
        disabled={loading}
      />
      <div>
        <div className="font-medium mb-1">Prioridade</div>
        <div className="flex items-center gap-2">
          {['#ef4444', '#f59e0b', '#3b82f6', '#22c55e', '#a855f7'].map((c) => (
            <button
              key={c}
              type="button"
              className={`w-6 h-6 rounded-full border ${priorityColor === c ? 'ring-2 ring-offset-2 ring-[color:var(--color-border)]' : ''}`}
              style={{ backgroundColor: c }}
              aria-label={`prioridade ${c}`}
              onClick={() => setPriorityColor(c)}
              disabled={loading}
            />
          ))}
          <button
            type="button"
            className="ml-2 text-xs text-[color:var(--color-muted-foreground)] underline"
            onClick={() => setPriorityColor(undefined)}
            disabled={loading}
          >
            Limpar
          </button>
        </div>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
        {submitLabel || 'Salvar objetivo'}
      </button>
    </form>
  );
};

// Formulário para criar ou editar objetivo
// Utiliza campos controlados e validação simples
import React, { useState } from 'react';

export interface ObjetivoFormProps {
  initial?: {
    title?: string;
    description?: string;
  };
  onSubmit: (data: { title: string; description?: string }) => void;
  loading?: boolean;
  submitLabel?: string;
}

export const ObjetivoForm: React.FC<ObjetivoFormProps> = ({ initial, onSubmit, loading, submitLabel }) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('O título é obrigatório.');
      return;
    }
    setError(null);
    onSubmit({ title: title.trim(), description: description.trim() || undefined });
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
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
        {submitLabel || 'Salvar objetivo'}
      </button>
    </form>
  );
};

// Form para adicionar/editar item de checklist
import React, { useState } from 'react';

export interface ChecklistFormProps {
  onSubmit: (data: { title: string; description?: string }) => void;
  loading?: boolean;
}

export const ChecklistForm: React.FC<ChecklistFormProps> = ({ onSubmit, loading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('O título é obrigatório.');
      return;
    }
    setError(null);
    onSubmit({ title: title.trim(), description: description.trim() || undefined });
    setTitle('');
    setDescription('');
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <input
        className="border rounded px-2 py-1"
        placeholder="Título do item"
        value={title}
        onChange={e => setTitle(e.target.value)}
        disabled={loading}
      />
      <input
        className="border rounded px-2 py-1"
        placeholder="Descrição (opcional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        disabled={loading}
      />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded" disabled={loading}>
        Adicionar item
      </button>
    </form>
  );
};

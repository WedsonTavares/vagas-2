'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import VagaForm from '@/components/VagaForm';
import { Button } from '@/components/ui/button';

export default function EditarVagaPage() {
  const router = useRouter();
  const { id } = useParams();

  const [vaga, setVaga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchVaga() {
      if (!id) {
        setError('ID da vaga não fornecido.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/vagas/${id}`);
        if (!res.ok) throw new Error('Erro ao buscar vaga.');
        const data = await res.json();
        setVaga(data);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro inesperado.');
      } finally {
        setLoading(false);
      }
    }
    fetchVaga();
  }, [id]);

  function onSuccess() {
    router.push('/vagas');
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Button variant="outline" disabled>Carregando...</Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-4">
        <p className="text-center text-red-600 font-semibold">{error}</p>
        <Button className="mt-4" onClick={() => router.push('/vagas')}>Voltar</Button>
      </div>
    );
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Editar Vaga</h1>
      {vaga && <VagaForm vaga={vaga} onSuccess={onSuccess} />}
    </main>
  );
}

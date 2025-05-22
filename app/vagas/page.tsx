'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import VagaCard from '../../components/VagaCard';

export default function VagasPage() {
  const [vagas, setVagas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar vagas via API Client Side para facilitar reatividade
  async function fetchVagas() {
    setLoading(true);
    try {
      const res = await fetch('/api/vagas');
      if (!res.ok) throw new Error('Erro ao buscar vagas.');
      const data = await res.json();
      setVagas(data);
    } catch {
      setVagas([]);
    } finally {
      setLoading(false);
    }
  }

  // Executa a busca na primeira renderização
  useEffect(() => {
    fetchVagas();
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vagas Cadastradas</h1>
        <Link
          href="/vagas/nova"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Nova Vaga
        </Link>
      </div>

      {loading && <p>Carregando vagas...</p>}

      {!loading && vagas.length === 0 && (
        <p>Nenhuma vaga cadastrada ainda.</p>
      )}

      {!loading &&
        vagas.map((vaga) => (
          <VagaCard key={vaga._id} vaga={vaga} onDeleted={fetchVagas} />
        ))}
    </main>
  );
}

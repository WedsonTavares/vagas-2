'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import VagaCard from '../../components/VagaCard';

export default function VagasPage() {
  const [vagas, setVagas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');

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

  const vagasFiltradas = vagas.filter((vaga) =>
    (vaga.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
    (vaga.empresa || '').toLowerCase().includes(busca.toLowerCase()) ||
    (vaga.descricao || '').toLowerCase().includes(busca.toLowerCase())
  );

  // Executa a busca na primeira renderização
  useEffect(() => {
    fetchVagas();
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col p-4 md:flex-row items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold whitespace-nowrap">Vagas Cadastradas</h1>
        <input
          type="text"
          placeholder="Buscar vaga..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-white md:flex-1 flex-1 p-2 border rounded mx-0 md:mx-4"
        />
        <Link
          href="/vagas/nova"
          className=" bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap"
        >
          + Nova Vaga
        </Link>
      </div>

      {loading && <p>Carregando vagas...</p>}

      {!loading && vagasFiltradas.length === 0 && (
        <p className="text-center text-gray-500">Nenhuma vaga encontrada.</p>
      )}

      {!loading &&
        vagasFiltradas.map((vaga) => (
          <VagaCard key={vaga._id} vaga={vaga} onDeleted={fetchVagas} />
        ))}
    </main>
  );
}
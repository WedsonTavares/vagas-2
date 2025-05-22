'use client';

import { useRouter } from 'next/navigation';
import VagaForm from '../../../components/VagaForm';

export default function NovaVagaPage() {
  const router = useRouter();

  function onSuccess() {
    router.push('/vagas');
  }

  return (
    <main className="max-w-xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Nova Vaga</h1>
      <VagaForm onSuccess={onSuccess} />
    </main>
  );
}

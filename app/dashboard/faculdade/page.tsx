'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Faculdade() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona automaticamente para a página de matérias
    router.replace('/dashboard/faculdade/materias');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-4xl mb-4">🎓</div>
        <p>Redirecionando para matérias...</p>
      </div>
    </div>
  );
}

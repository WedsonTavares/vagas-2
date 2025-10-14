


import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { supabaseBackend, validateUserId, executeSecureQuery } from '@/lib/supabase-backend';
import { ExpansiveCard } from '@/components/certificados/ExpansiveCard';
import type { Certificate } from '@/types';

type Props = {
  params: Promise<{ id: string }>;
};

// Tipagem local alinhada à tabela do banco
interface CertificateRow {
  id: string;
  userid: string;
  course_name: string;
  duration?: string | null;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  institution?: string | null;
  file_name?: string | null;
  storage_path?: string | null;
  file_mime?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export default async function CertificatePreview({ params }: Props) {
  const { id } = await params;

  // Autenticação via Clerk
  const { userId } = await auth();
  if (!userId || !validateUserId(userId)) {
    return notFound();
  }

  // Busca direta no Supabase (evita problemas de cookies/SSR)
  const result = await executeSecureQuery(
    supabaseBackend
      .from('certificates')
      .select('*')
      .eq('id', id)
      .eq('userid', userId)
      .maybeSingle(),
    `SSR /dashboard/cursos/certificados/${id}`,
    userId
  );

  if (result.error || !result.data) {
    return notFound();
  }

  const r = result.data as CertificateRow;
  const data: Certificate = {
    id: r.id,
    userId: r.userid,
    courseName: r.course_name,
    duration: r.duration,
    description: r.description,
    startDate: r.start_date,
    endDate: r.end_date,
    institution: r.institution ?? undefined,
    fileName: r.file_name,
    storagePath: r.storage_path,
    fileMime: r.file_mime,
    createdAt: r.created_at ?? null,
    updatedAt: r.updated_at ?? null,
  };

    return (
      <main className="max-w-2xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">{data?.courseName || 'Certificado'}</h1>
            <p className="text-base text-muted-foreground">{data?.institution || ''}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/cursos/certificados">
              <Button variant="outline" size="sm">Voltar</Button>
            </Link>
            <a href={`/api/cursos/certificados/${id}/download`}>
              <Button size="sm" variant="default">Baixar</Button>
            </a>
          </div>
        </div>

        <ExpansiveCard data={data} />
      </main>
    );
}

// ...ExpansiveCard agora importado do componente client-only

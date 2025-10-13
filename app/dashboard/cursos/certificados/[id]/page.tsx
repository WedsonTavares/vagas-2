import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CertificatePreview({ params }: Props) {
  const { id } = await params;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '') || ''}/api/cursos/certificados/${id}`, {
      method: 'GET',
      // force server fetch
      cache: 'no-store',
      headers: { 'content-type': 'application/json' },
    });

    if (!res.ok) {
      // couldn't fetch metadata
      return notFound();
    }

    const data = await res.json();
    const signedUrl = data?.signedUrl || null;
    const fileName = data?.fileName || 'certificate';

    // prefer signedUrl; fallback to download route
    const src = signedUrl || `/api/cursos/certificados/${id}/download`;

    return (
      <main className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{data?.courseName || 'Certificado'}</h1>
            <p className="text-sm text-[color:var(--color-muted-foreground)]">{data?.institution || ''}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/cursos/certificados">
              <Button variant="ghost">Voltar</Button>
            </Link>
            <a href={`/api/cursos/certificados/${id}/download`}>
              <Button>Baixar</Button>
            </a>
          </div>
        </div>

        <div className="border rounded h-[80vh] overflow-hidden">
          <iframe src={src} title={fileName} className="w-full h-full" />
        </div>
      </main>
    );
  } catch (err) {
    console.error(err);
    return notFound();
  }
}

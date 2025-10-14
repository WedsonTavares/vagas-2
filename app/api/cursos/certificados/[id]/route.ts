import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseBackend, validateUserId, executeSecureQuery } from '@/lib/supabase-backend';

export const runtime = 'nodejs';

// Tipagem local usada apenas para clareza — não altera a lógica
interface CertificateRow {
  id: string;
  userid: string;
  course_name?: string | null;
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    if (!userId || !validateUserId(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await executeSecureQuery(
      supabaseBackend.from('certificates').select('*').eq('id', id).eq('userid', userId).maybeSingle(),
      `GET /cursos/certificados/${id}`,
      userId
    );

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    if (!result.data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const r = result.data as CertificateRow;
    // gera URL assinada para download (assumindo bucket privado)
    const { data: urlData, error: urlErr } = await supabaseBackend.storage.from('certificates').createSignedUrl(r.storage_path || '', 60 * 60);
    if (urlErr) return NextResponse.json({ error: urlErr.message }, { status: 500 });

    const mapped = {
      id: r.id,
      userId: r.userid,
      courseName: r.course_name,
      duration: r.duration,
      description: r.description,
      startDate: r.start_date,
      endDate: r.end_date,
      institution: r.institution,
      fileName: r.file_name,
      storagePath: r.storage_path,
      fileMime: r.file_mime,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      signedUrl: urlData?.signedURL || null,
    };

    return NextResponse.json(mapped);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    if (!userId || !validateUserId(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const exists = await executeSecureQuery(
      supabaseBackend.from('certificates').select('id,storage_path').eq('id', id).eq('userid', userId).maybeSingle(),
      `DELETE /cursos/certificados/${id} - check`,
      userId
    );

    if (!exists.data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const data = exists.data as CertificateRow;
    const storagePath = data.storage_path;

    // remove do storage (se existir)
    const { error: delErr } = await supabaseBackend.storage.from('certificates').remove([storagePath || '']);
    if (delErr) {
      // eslint-disable-next-line no-console
      console.error('storage delete error', delErr);
      // continuamos para deletar o registro do banco mesmo que o storage falhe
    }

    const result = await executeSecureQuery(
      supabaseBackend.from('certificates').delete().eq('id', id).eq('userid', userId),
      `DELETE /cursos/certificados/${id}`,
      userId
    );

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

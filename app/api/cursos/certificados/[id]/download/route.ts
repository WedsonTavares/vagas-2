import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseBackend, validateUserId, executeSecureQuery } from '@/lib/supabase-backend';

export const runtime = 'nodejs';

interface CertificateData {
  id: string;
  storage_path: string;
  file_name?: string | null;
  file_mime?: string | null;
  userid?: string;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    if (!userId || !validateUserId(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const exists = await executeSecureQuery(
      supabaseBackend.from('certificates').select('id,storage_path,file_name,file_mime').eq('id', id).eq('userid', userId).maybeSingle(),
      `GET /cursos/certificados/${id}/download - check`,
      userId
    );

    if (!exists.data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const r = exists.data as CertificateData;
    // tenta primeiro criar URL assinada
    try {
      const { data: urlData, error: urlErr } = await supabaseBackend.storage.from('certificates').createSignedUrl(r.storage_path, 60 * 60);
      if (!urlErr && urlData?.signedURL) {
        return NextResponse.redirect(urlData.signedURL);
      }
    } catch {
      // se falhar, seguimos para o fallback de download
    }

    // fallback: baixar e enviar como attachment
    const { data, error } = await supabaseBackend.storage.from('certificates').download(r.storage_path);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // data é um Blob; converte para buffer
    const arrayBuffer = await (data as Blob).arrayBuffer();
    const buf = Buffer.from(arrayBuffer);

    const filename = r.file_name || 'file';
    const contentType = r.file_mime || 'application/octet-stream';

    return new NextResponse(buf, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

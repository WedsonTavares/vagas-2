import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseBackend, validateUserId, executeSecureQuery } from '@/lib/supabase-backend';

export const runtime = 'nodejs';

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

    const r: any = exists.data;
    // try signed url
    try {
      const { data: urlData, error: urlErr } = await supabaseBackend.storage.from('certificates').createSignedUrl(r.storage_path, 60 * 60);
      if (!urlErr && urlData?.signedURL) {
        return NextResponse.redirect(urlData.signedURL);
      }
    } catch (e) {
      // continue to download
      console.warn('createSignedUrl error', e);
    }

    // fallback: download and stream
    const { data, error } = await supabaseBackend.storage.from('certificates').download(r.storage_path);
    if (error) {
      console.error('download error', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

  // data is a Blob-like; convert to buffer
  const arrayBuffer = await (data as any).arrayBuffer();
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
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

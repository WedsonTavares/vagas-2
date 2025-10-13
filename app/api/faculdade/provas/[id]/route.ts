import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  supabaseBackend,
  validateUserId,
  executeSecureQuery,
} from '@/lib/supabase-backend';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId || !validateUserId(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await executeSecureQuery(
      supabaseBackend.from('exams').select('*').eq('id', id).eq('userid', userId).maybeSingle(),
      `GET /faculdade/provas/${id} - Get specific exam`,
      userId
    );

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    if (!result.data) {
      return NextResponse.json({ error: 'Prova não encontrada' }, { status: 404 });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId || !validateUserId(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, userId: __, createdAt: ___, ...updateData } = body;
    updateData.updatedAt = new Date().toISOString();

    const exists = await executeSecureQuery(
      supabaseBackend.from('exams').select('id').eq('id', id).eq('userid', userId).maybeSingle(),
      `PUT /faculdade/provas/${id} - Check exam exists`,
      userId
    );

    if (!exists.data) {
      return NextResponse.json({ error: 'Prova não encontrada' }, { status: 404 });
    }

    // Map updateData keys to DB column names if necessary
    const dbUpdate: any = {};
    if (updateData.materia !== undefined) dbUpdate.materia = updateData.materia;
    if (updateData.examDate !== undefined) dbUpdate.examdate = updateData.examDate;
    if (updateData.examTime !== undefined) dbUpdate.examtime = updateData.examTime;
    if (updateData.location !== undefined) dbUpdate.location = updateData.location;
    if (updateData.notes !== undefined) dbUpdate.notes = updateData.notes;
    dbUpdate.updatedat = new Date().toISOString();

    const result = await executeSecureQuery(
      supabaseBackend.from('exams').update(dbUpdate).eq('id', id).eq('userid', userId).select().maybeSingle(),
      `PUT /faculdade/provas/${id} - Update exam`,
      userId
    );

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId || !validateUserId(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const exists = await executeSecureQuery(
      supabaseBackend.from('exams').select('id,materia').eq('id', id).eq('userid', userId).maybeSingle(),
      `DELETE /faculdade/provas/${id} - Check exam exists`,
      userId
    );

    if (!exists.data) {
      return NextResponse.json({ error: 'Prova não encontrada' }, { status: 404 });
    }

    const result = await executeSecureQuery(
      supabaseBackend.from('exams').delete().eq('id', id).eq('userid', userId),
      `DELETE /faculdade/provas/${id} - Delete exam`,
      userId
    );

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Prova excluída com sucesso' });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

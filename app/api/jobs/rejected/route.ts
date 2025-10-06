import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  supabaseBackend,
  validateUserId,
  executeSecureQuery,
} from '@/lib/supabase-backend';

// GET /api/jobs/rejected - Listar todas as vagas rejeitadas do usuário
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId || !validateUserId(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar vagas com status REJECTED usando Service Role Key
    const result = await executeSecureQuery(
      supabaseBackend
        .from('jobs')
        .select('*')
        .eq('userId', userId)
        .eq('status', 'REJECTED')
        .order('updatedAt', { ascending: false }),
      'GET /jobs/rejected - List rejected jobs',
      userId
    );

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data || []);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/jobs/rejected - Adicionar vaga rejeitada (mover vaga para rejeitada)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId || !validateUserId(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a vaga existe e pertence ao usuário
    const existingResult = await executeSecureQuery(
      supabaseBackend
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('userId', userId)
        .single(),
      'POST /jobs/rejected - Check job exists',
      userId
    );

    if (!existingResult.data) {
      return NextResponse.json(
        { error: 'Vaga não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar status para REJECTED
    const updateResult = await executeSecureQuery(
      supabaseBackend
        .from('jobs')
        .update({
          status: 'REJECTED',
          updatedAt: new Date().toISOString(),
        })
        .eq('id', jobId)
        .eq('userId', userId)
        .select()
        .single(),
      'POST /jobs/rejected - Mark job as rejected',
      userId
    );

    if (updateResult.error) {
      return NextResponse.json(
        { error: updateResult.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Vaga marcada como rejeitada',
      job: updateResult.data,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

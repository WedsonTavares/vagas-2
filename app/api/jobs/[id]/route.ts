import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  supabaseBackend,
  validateUserId,
  executeSecureQuery,
} from '@/lib/supabase-backend';

// GET /api/jobs/[id] - Buscar vaga específica
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
      supabaseBackend
        .from('jobs')
        .select('*')
        .eq('id', id)
        .eq('userId', userId)
        .single(),
      `GET /jobs/${id} - Get specific job`,
      userId
    );

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    if (!result.data) {
      return NextResponse.json(
        { error: 'Vaga não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/jobs/[id] - Atualizar vaga
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

    // Remover campos que não devem ser atualizados
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, userId: __, createdAt: ___, ...updateData } = body;

    // Adicionar timestamp de atualização
    updateData.updatedAt = new Date().toISOString();

    // Verificar se a vaga existe e pertence ao usuário
    const existingResult = await executeSecureQuery(
      supabaseBackend
        .from('jobs')
        .select('id')
        .eq('id', id)
        .eq('userId', userId)
        .single(),
      `PUT /jobs/${id} - Check job exists`,
      userId
    );

    if (!existingResult.data) {
      return NextResponse.json(
        { error: 'Vaga não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar vaga
    const result = await executeSecureQuery(
      supabaseBackend
        .from('jobs')
        .update(updateData)
        .eq('id', id)
        .eq('userId', userId)
        .select()
        .single(),
      `PUT /jobs/${id} - Update job`,
      userId
    );

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - Excluir vaga
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

    // Verificar se a vaga existe e pertence ao usuário antes de excluir
    const existingResult = await executeSecureQuery(
      supabaseBackend
        .from('jobs')
        .select('id, title, company')
        .eq('id', id)
        .eq('userId', userId)
        .single(),
      `DELETE /jobs/${id} - Check job exists`,
      userId
    );

    if (!existingResult.data) {
      return NextResponse.json(
        { error: 'Vaga não encontrada' },
        { status: 404 }
      );
    }

    // Excluir vaga
    const result = await executeSecureQuery(
      supabaseBackend.from('jobs').delete().eq('id', id).eq('userId', userId),
      `DELETE /jobs/${id} - Delete job`,
      userId
    );

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Vaga excluída com sucesso',
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

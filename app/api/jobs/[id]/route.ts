import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/jobs/[id] - Buscar vaga específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .eq('userId', userId)
      .single();

    if (error) {
      console.error('❌ [SUPABASE] Erro ao buscar vaga:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ API GET /jobs/[id]: Erro:', error);
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
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Remover campos que não devem ser atualizados
    const { id: _, userId: __, createdAt, ...updateData } = body;
    
    // Adicionar timestamp de atualização
    updateData.updatedAt = new Date().toISOString();

    console.log('🔍 [SUPABASE] Atualizando vaga:', id);

    // Verificar se a vaga existe e pertence ao usuário
    const { data: existingJob } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', id)
      .eq('userId', userId)
      .single();

    if (!existingJob) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }

    // Atualizar vaga
    const { data, error } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .eq('userId', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ [SUPABASE] Erro ao atualizar vaga:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ API PUT /jobs/[id]: Erro:', error);
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
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 [SUPABASE] Excluindo vaga:', id);

    // Verificar se a vaga existe e pertence ao usuário antes de excluir
    const { data: existingJob } = await supabase
      .from('jobs')
      .select('id, title, company')
      .eq('id', id)
      .eq('userId', userId)
      .single();

    if (!existingJob) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }

    // Excluir vaga
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)
      .eq('userId', userId);

    if (error) {
      console.error('❌ [SUPABASE] Erro ao excluir vaga:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ [SUPABASE] Vaga "${existingJob.title}" excluída com sucesso`);
    return NextResponse.json({ 
      success: true,
      message: 'Vaga excluída com sucesso' 
    });
  } catch (error) {
    console.error('❌ API DELETE /jobs/[id]: Erro:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
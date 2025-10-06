import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/jobs/rejected - Listar todas as vagas rejeitadas do usuário
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Como não temos tabela de rejected_jobs, vamos buscar vagas com status REJECTED
    const { data: rejectedJobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('userId', userId)
      .eq('status', 'REJECTED')
      .order('updatedAt', { ascending: false });

    if (error) {
      console.error('❌ [SUPABASE] Erro ao buscar vagas rejeitadas:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(rejectedJobs);
  } catch (error) {
    console.error('❌ API GET /jobs/rejected: Erro:', error);
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
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID é obrigatório' }, { status: 400 });
    }

    // Verificar se a vaga existe e pertence ao usuário
    const { data: existingJob } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('userId', userId)
      .single();

    if (!existingJob) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }

    // Atualizar status para REJECTED
    const { data: updatedJob, error } = await supabase
      .from('jobs')
      .update({
        status: 'REJECTED',
        updatedAt: new Date().toISOString()
      })
      .eq('id', jobId)
      .eq('userId', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ [SUPABASE] Erro ao rejeitar vaga:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Vaga marcada como rejeitada',
      job: updatedJob
    });
  } catch (error) {
    console.error('❌ API POST /jobs/rejected: Erro:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
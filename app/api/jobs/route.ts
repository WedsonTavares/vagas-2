import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { JobType, JobMode, JobStatus } from '@/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/jobs - Listar todas as vagas do usuário
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as JobStatus | null;
    const type = searchParams.get('type') as JobType | null;
    const mode = searchParams.get('mode') as JobMode | null;

    // Construir query do Supabase
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('userId', userId);

    // Aplicar filtros se fornecidos
    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);
    if (mode) query = query.eq('mode', mode);

    // Ordenar por data de criação (mais recentes primeiro)
    const { data, error } = await query.order('createdAt', { ascending: false });

    if (error) {
      console.error('❌ [SUPABASE] Erro ao buscar vagas:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('❌ API GET /jobs: Erro:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Criar nova vaga
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const {
      title,
      company,
      location,
      type = 'FULL_TIME',
      mode = 'REMOTE',
      status = 'APPLIED',
      description,
      requirements,
      salary,
      benefits,
      applicationUrl,
      applicationEmail,
      notes,
      appliedAt,
    } = body;

    // Validações básicas
    if (!title || !company) {
      return NextResponse.json(
        { error: 'Title and company are required' },
        { status: 400 }
      );
    }

    // Verificar se já existe uma vaga com o mesmo applicationUrl (se fornecido)
    if (applicationUrl) {
      const { data: existingJob } = await supabase
        .from('jobs')
        .select('id')
        .eq('userId', userId)
        .eq('applicationUrl', applicationUrl)
        .single();

      if (existingJob) {
        return NextResponse.json(
          { error: 'Você já se candidatou a essa vaga' },
          { status: 409 }
        );
      }
    }

    // Preparar dados para inserção
    const jobData = {
      id: crypto.randomUUID(), // Gerar ID único
      userId: userId,
      title,
      company,
      location,
      type,
      mode,
      status,
      description,
      requirements,
      salary,
      benefits,
      applicationUrl: applicationUrl,
      applicationEmail: applicationEmail,
      notes,
      appliedAt: appliedAt ? new Date(appliedAt).toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Inserir no Supabase
    const { data, error } = await supabase
      .from('jobs')
      .insert([jobData])
      .select()
      .single();

    if (error) {
      console.error('❌ [SUPABASE] Erro ao criar vaga:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('❌ API POST /jobs: Erro ao criar vaga:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
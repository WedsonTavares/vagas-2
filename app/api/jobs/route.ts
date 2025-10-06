import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  supabaseBackend,
  validateUserId,
  executeSecureQuery,
} from '@/lib/supabase-backend';
import { JobType, JobMode, JobStatus } from '@/types';

// GET /api/jobs - Listar todas as vagas do usuário
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId || !validateUserId(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as JobStatus | null;
    const type = searchParams.get('type') as JobType | null;
    const mode = searchParams.get('mode') as JobMode | null;

    // Construir query segura com Service Role Key
    let query = supabaseBackend.from('jobs').select('*').eq('userId', userId); // Validação obrigatória de userId

    // Aplicar filtros se fornecidos
    if (status) query = query.eq('status', status);
    if (type) query = query.eq('type', type);
    if (mode) query = query.eq('mode', mode);

    // Ordenar por data de criação (mais recentes primeiro)
    const result = await executeSecureQuery(
      query.order('createdAt', { ascending: false }),
      'GET /jobs - List user jobs',
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

// POST /api/jobs - Criar nova vaga
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId || !validateUserId(userId)) {
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
      const existingResult = await executeSecureQuery(
        supabaseBackend
          .from('jobs')
          .select('id')
          .eq('userId', userId)
          .eq('applicationUrl', applicationUrl)
          .single(),
        'POST /jobs - Check duplicate URL',
        userId
      );

      if (existingResult.data) {
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
      updatedAt: new Date().toISOString(),
    };

    // Inserir no Supabase usando Service Role Key
    const result = await executeSecureQuery(
      supabaseBackend.from('jobs').insert([jobData]).select().single(),
      'POST /jobs - Create new job',
      userId
    );

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { JobType, JobMode, JobStatus } from '@/types';

// Forçar Node.js Runtime (necessário para Prisma)
export const runtime = 'nodejs';

// GET /api/jobs - Listar todas as vagas do usuário
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.log('⚠️ API GET /jobs: Acesso negado - usuário não autenticado');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as JobStatus | null;
    const type = searchParams.get('type') as JobType | null;
    const mode = searchParams.get('mode') as JobMode | null;

    const jobs = await prisma.job.findMany({
      where: {
        userId,
        ...(status && { status: status as any }),
        ...(type && { type: type as any }),
        ...(mode && { mode: mode as any }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`✅ API GET /jobs: ${jobs.length} vagas encontradas para usuário`);
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('❌ API GET /jobs: Erro ao buscar vagas:', error);
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
      console.log('⚠️ API POST /jobs: Acesso negado - usuário não autenticado');
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

    // Verificar se já existe uma vaga com o mesmo applicationUrl
    if (applicationUrl) {
      const existingJob = await prisma.job.findFirst({
        where: {
          userId,
          applicationUrl,
        },
      });

      if (existingJob) {
        return NextResponse.json(
          { error: 'Você já se candidatou a essa vaga' },
          { status: 409 }
        );
      }
    }

    const job = await prisma.job.create({
      data: {
        userId,
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
        applicationUrl,
        applicationEmail,
        notes,
        appliedAt: appliedAt ? new Date(appliedAt) : null,
      },
    });

    console.log(`✅ API POST /jobs: Vaga "${job.title}" criada com sucesso`);
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('❌ API POST /jobs: Erro ao criar vaga:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
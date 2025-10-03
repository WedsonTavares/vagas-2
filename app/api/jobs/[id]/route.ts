import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { JobType, JobMode, JobStatus } from '@/types';

// GET /api/jobs/[id] - Buscar vaga por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const job = await prisma.job.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Erro ao buscar vaga:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    
    const {
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
      appliedAt,
    } = body;

    // Verificar se a vaga existe e pertence ao usuário
    const existingJob = await prisma.job.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }

    // Se o status está sendo mudado para REJECTED, salvar no histórico e excluir
    if (status === 'REJECTED') {
      // Salvar no histórico de rejeições
      await prisma.rejectedJobLog.create({
        data: {
          userId,
          title: existingJob.title,
          company: existingJob.company,
        },
      });

      // Excluir a vaga
      await prisma.job.delete({
        where: {
          id,
        },
      });

      console.log(`🔴 Vaga rejeitada e movida para histórico: ${existingJob.title}`);
      return NextResponse.json({ 
        message: 'Vaga rejeitada e movida para histórico',
        rejectedJob: {
          title: existingJob.title,
          company: existingJob.company
        }
      });
    }

    // Para outros status, fazer update normal
    const updatedJob = await prisma.job.update({
      where: {
        id,
      },
      data: {
        ...(title && { title }),
        ...(company && { company }),
        ...(location !== undefined && { location }),
        ...(type && { type }),
        ...(mode && { mode }),
        ...(status && { status }),
        ...(description !== undefined && { description }),
        ...(requirements !== undefined && { requirements }),
        ...(salary !== undefined && { salary }),
        ...(benefits !== undefined && { benefits }),
        ...(applicationUrl !== undefined && { applicationUrl }),
        ...(applicationEmail !== undefined && { applicationEmail }),
        ...(notes !== undefined && { notes }),
        ...(appliedAt !== undefined && { 
          appliedAt: appliedAt ? new Date(appliedAt) : null 
        }),
      },
    });

    console.log(`✅ Vaga atualizada com sucesso: ${id}`);
    return NextResponse.json(updatedJob);
  } catch (error) {
    console.error('❌ Erro ao atualizar vaga:', error);
    console.error('❌ Detalhes do erro:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - Deletar vaga
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se a vaga existe e pertence ao usuário
    const existingJob = await prisma.job.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingJob) {
      return NextResponse.json({ error: 'Vaga não encontrada' }, { status: 404 });
    }

    await prisma.job.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: 'Vaga deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar vaga:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
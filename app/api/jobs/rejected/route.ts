import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/jobs/rejected - Listar todas as vagas rejeitadas do usuário
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const rejectedJobs = await prisma.rejectedJobLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        rejectedAt: 'desc',
      },
    });

    // Transformar os dados para o formato esperado pelo frontend
    const formattedJobs = rejectedJobs.map(log => ({
      id: log.id,
      title: log.title,
      company: log.company,
      status: 'REJECTED' as const,
      location: 'N/A', // Dados não salvos no log
      type: 'FULL_TIME' as const, // Valores padrão para campos obrigatórios
      mode: 'REMOTE' as const,
      description: null,
      requirements: null,
      salary: null,
      benefits: null,
      applicationUrl: null,
      applicationEmail: null,
      notes: null,
      appliedAt: null,
      createdAt: log.rejectedAt,
      updatedAt: log.rejectedAt,
      userId: log.userId,
    }));

    console.log(`✅ API GET /jobs/rejected: ${formattedJobs.length} vagas rejeitadas encontradas para usuário`);
    return NextResponse.json(formattedJobs);
  } catch (error) {
    console.error('❌ API GET /jobs/rejected: Erro ao buscar vagas rejeitadas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/rejected - Deletar uma vaga específica do histórico de rejeitadas
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID da vaga é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a vaga rejeitada existe e pertence ao usuário
    const rejectedJob = await prisma.rejectedJobLog.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!rejectedJob) {
      return NextResponse.json(
        { error: 'Vaga rejeitada não encontrada' },
        { status: 404 }
      );
    }

    // Deletar a vaga do histórico
    await prisma.rejectedJobLog.delete({
      where: {
        id,
      },
    });

    console.log(`✅ API DELETE /jobs/rejected: Vaga "${rejectedJob.title}" removida do histórico`);
    return NextResponse.json({ 
      message: `Vaga "${rejectedJob.title}" removida do histórico com sucesso` 
    });
  } catch (error) {
    console.error('❌ API DELETE /jobs/rejected: Erro ao remover vaga do histórico:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
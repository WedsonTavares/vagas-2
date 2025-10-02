import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/jobs/stats - Estatísticas das vagas do usuário
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Contar total de vagas
    const totalJobs = await prisma.job.count({
      where: { userId }
    });

    // Contar por status
    const statusStats = await prisma.job.groupBy({
      by: ['status'],
      where: { userId },
      _count: {
        status: true,
      },
    });

    // Contar por tipo
    const typeStats = await prisma.job.groupBy({
      by: ['type'],
      where: { userId },
      _count: {
        type: true,
      },
    });

    // Contar por modalidade
    const modeStats = await prisma.job.groupBy({
      by: ['mode'],
      where: { userId },
      _count: {
        mode: true,
      },
    });

    // Vagas criadas nos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentApplications = await prisma.job.count({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Últimas vagas criadas
    const recentJobs = await prisma.job.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        company: true,
        status: true,
        createdAt: true,
      },
    });

    // Formatando resposta
    const stats = {
      total: totalJobs,
      byStatus: statusStats.reduce((acc: Record<string, number>, item: any) => {
        acc[item.status] = item._count.status;
        return acc;
      }, {}),
      byType: typeStats.reduce((acc: Record<string, number>, item: any) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {}),
      byMode: modeStats.reduce((acc: Record<string, number>, item: any) => {
        acc[item.mode] = item._count.mode;
        return acc;
      }, {}),
      recentApplications,
      recentJobs,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching job stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
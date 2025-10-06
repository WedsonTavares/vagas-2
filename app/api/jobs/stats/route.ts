import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/jobs/stats - Estatísticas das vagas do usuário
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar todas as vagas do usuário
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('id, title, company, status, type, mode, createdAt')
      .eq('userId', userId);

    if (error) {
      console.error('❌ [SUPABASE] Erro ao buscar vagas para stats:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calcular estatísticas manualmente
    const totalJobs = jobs.length;

    // Contar por status
    const statusCounts = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Contar por tipo
    const typeCounts = jobs.reduce((acc, job) => {
      acc[job.type] = (acc[job.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Contar por modo
    const modeCounts = jobs.reduce((acc, job) => {
      acc[job.mode] = (acc[job.mode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calcular aplicações recentes (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentApplications = jobs.filter(job => 
      new Date(job.createdAt) >= thirtyDaysAgo
    ).length;

    // Pegar jobs recentes para a lista (últimos 5)
    const recentJobs = jobs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        status: job.status,
        createdAt: job.createdAt
      }));

    const stats = {
      total: totalJobs,
      byStatus: statusCounts,       // Retorna como objeto { "PENDING": 3, "APPLIED": 2 }
      byType: typeCounts,           // Retorna como objeto { "FULL_TIME": 4, "PART_TIME": 1 }
      byMode: modeCounts,           // Retorna como objeto { "REMOTE": 3, "HYBRID": 2 }
      recentApplications,           // Número de aplicações nos últimos 30 dias
      recentJobs                    // Array dos 5 jobs mais recentes
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('❌ API GET /jobs/stats: Erro:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
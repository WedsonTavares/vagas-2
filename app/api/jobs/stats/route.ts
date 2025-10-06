import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  supabaseBackend,
  validateUserId,
  executeSecureQuery,
} from '@/lib/supabase-backend';

// GET /api/jobs/stats - Buscar estatísticas das vagas
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId || !validateUserId(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar todas as vagas do usuário para calcular estatísticas
    const result = await executeSecureQuery(
      supabaseBackend
        .from('jobs')
        .select('id, title, company, status, type, mode, createdAt')
        .eq('userId', userId),
      'GET /jobs/stats - Get user jobs for statistics',
      userId
    );

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    interface Job {
      id: string;
      title: string;
      company: string;
      status: string;
      type: string;
      mode: string;
      createdAt: string;
    }

    const jobs = (result.data || []) as Job[];

    // Calcular estatísticas
    // Normalizamos possíveis valores de status vindos do banco (lowercase, underscores, hyphens)
    const STATUS_MAP: Record<string, string> = {
      pending: 'APPLIED',
      applied: 'APPLIED',
      test_pending: 'TEST_PENDING',
      'test-pending': 'TEST_PENDING',
      testpending: 'TEST_PENDING',
      test_completed: 'TEST_COMPLETED',
      'test-completed': 'TEST_COMPLETED',
      testcompleted: 'TEST_COMPLETED',
      interview: 'INTERVIEW',
      accepted: 'ACCEPTED',
      rejected: 'REJECTED',
    };

    const normalizeStatus = (raw?: string) => {
      if (!raw) return 'APPLIED';
      const key = String(raw).toLowerCase();
      return STATUS_MAP[key] ?? String(raw).toUpperCase();
    };

    const byStatus = jobs.reduce((acc: Record<string, number>, job) => {
      const s = normalizeStatus(job.status);
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    const byType = jobs.reduce((acc: Record<string, number>, job) => {
      const t = job.type || 'UNKNOWN';
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});

    const byMode = jobs.reduce((acc: Record<string, number>, job) => {
      const m = job.mode || 'UNKNOWN';
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {});

    const recentApplicationsCount = jobs.filter(job => {
      const jobDate = new Date(job.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return jobDate >= weekAgo;
    }).length;

    const recentJobs = jobs
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5)
      .map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        status: normalizeStatus(job.status),
        createdAt: job.createdAt,
      }));

    const stats = {
      total: jobs.length,
      byStatus,
      byType,
      byMode,
      recentApplications: recentApplicationsCount,
      recentJobs,
    };

    return NextResponse.json(stats, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Optionally log the error using a logging service here
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

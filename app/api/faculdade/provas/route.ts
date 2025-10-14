import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseBackend, validateUserId, executeSecureQuery } from '@/lib/supabase-backend';

// Tipagens locais apenas para clareza (mantém a lógica original)
interface ExamRow {
  id: string;
  userid: string;
  materia: string;
  examdate: string;
  examtime?: string | null;
  location?: string | null;
  notes?: string | null;
  createdat?: string;
  updatedat?: string;
}

interface CreateExamBody {
  materia: string;
  examDate: string;
  examTime?: string;
  location?: string;
  notes?: string;
}

/**
 * GET /api/faculdade/provas - Lista as provas do usuário
 * POST /api/faculdade/provas - Cria uma nova prova
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId || !validateUserId(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming'); // opcional: filtrar próximas

    // use DB column names (lowercase)
    let query = supabaseBackend.from('exams').select('*').eq('userid', userId);

    if (upcoming === 'true') {
      query = query.gte('examdate', new Date().toISOString());
    }

    const result = await executeSecureQuery(query.order('examdate', { ascending: true }), 'GET /faculdade/provas - List user exams', userId);

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    const rows = (result.data || []) as ExamRow[];
    // mapeia para camelCase (contrato do frontend)
    const mapped = rows.map((row) => ({
      id: row.id,
      userId: row.userid,
      materia: row.materia,
      examDate: row.examdate,
      examTime: row.examtime ?? null,
      location: row.location ?? null,
      notes: row.notes ?? null,
      createdAt: row.createdat ?? null,
      updatedAt: row.updatedat ?? null,
    }));

    return NextResponse.json(mapped);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId || !validateUserId(userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

  const body = (await request.json()) as CreateExamBody;
  const { materia, examDate, examTime, location, notes } = body;

    if (!materia || !examDate) {
      return NextResponse.json({ error: 'Campos obrigatórios: materia, examDate' }, { status: 400 });
    }

    // Map to DB column names (all lowercase as observed in schema)
    const dbExam = {
      id: crypto.randomUUID(),
      userid: userId,
      materia,
      examdate: new Date(examDate).toISOString(),
      examtime: examTime || null,
      location: location || null,
      notes: notes || null,
    };

    const result = await executeSecureQuery(
      supabaseBackend.from('exams').insert([dbExam]).select().maybeSingle(),
      'POST /faculdade/provas - Create exam',
      userId
    );

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    // Map DB response (lowercase columns) to camelCase for the frontend
    const row = result.data as ExamRow;
    const mapped = {
      id: row.id,
      userId: row.userid,
      materia: row.materia,
      examDate: row.examdate,
      examTime: row.examtime ?? null,
      location: row.location ?? null,
      notes: row.notes ?? null,
      createdAt: row.createdat ?? null,
      updatedAt: row.updatedat ?? null,
    };

    return NextResponse.json(mapped, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

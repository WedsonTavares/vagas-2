// API de Checklist de Objetivos
// -----------------------------
// Esta rota implementa a listagem e criação de itens de checklist vinculados a um objetivo.
// Utiliza autenticação Clerk, tipagem forte e acesso seguro ao banco via Supabase.
//
// Principais decisões:
// - Checklist vinculado ao objetivo por objectiveid
// - Validação de propriedade: só o dono do objetivo pode manipular o checklist
// - Tipos e DTOs centralizados para consistência entre backend e frontend
// - Campos snake_case para compatibilidade direta com o banco Postgres

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseBackend, validateUserId, executeSecureQuery } from '@/lib/supabase-backend';
import type { ObjectiveChecklist } from '@/types';

export const runtime = 'nodejs';

// Interface que representa uma linha da tabela objective_checklists no banco
// Os nomes dos campos seguem o padrão snake_case do Postgres
interface ChecklistRow {
  id: string;
  objectiveid: string;
  title: string;
  description?: string | null;
  completed: boolean;
  orderindex?: number | null;
  createdat?: string | null;
  updatedat?: string | null;
}

// Função utilitária para converter uma linha do banco (ChecklistRow)
// para o formato DTO usado no frontend (ObjectiveChecklist)
const mapRow = (r: ChecklistRow): ObjectiveChecklist => ({
  id: r.id,
  objectiveId: r.objectiveid,
  title: r.title,
  description: r.description ?? null,
  completed: r.completed,
  orderIndex: r.orderindex ?? undefined,
  createdAt: r.createdat ?? null,
  updatedAt: r.updatedat ?? null,
});

// Função utilitária para garantir que o objetivo pertence ao usuário autenticado
async function ensureOwnership(objectiveId: string, userId: string) {
  const exists = await executeSecureQuery(
    supabaseBackend.from('objectives').select('id').eq('id', objectiveId).eq('userid', userId).maybeSingle(),
    `check ownership objective ${objectiveId}`,
    userId
  );
  return !!exists.data;
}

// GET /api/objetivos/[id]/checklists
// -----------------------------------
// Lista todos os itens de checklist de um objetivo do usuário autenticado.
// - Autenticação obrigatória
// - Validação de propriedade: só retorna se o objetivo pertence ao usuário
// - Ordena por orderindex para manter a ordem definida
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    const { id } = await params; // objective id
    if (!userId || !validateUserId(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!(await ensureOwnership(id, userId))) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const result = await executeSecureQuery(
      supabaseBackend.from('objective_checklists').select('*').eq('objectiveid', id).order('orderindex', { ascending: true }),
      `GET /objetivos/${id}/checklists`,
      userId
    );

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    const rows = (result.data || []) as ChecklistRow[];
    return NextResponse.json(rows.map(mapRow));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    // Log de erro para debug e auditoria
    // console.error('[API][GET /objetivos/[id]/checklists]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/objetivos/[id]/checklists
// ------------------------------------
// Cria um novo item de checklist para o objetivo do usuário autenticado.
// - Autenticação obrigatória
// - Validação de propriedade
// - Valida o campo 'title' (obrigatório)
// - Os campos description e orderIndex são opcionais
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    const { id } = await params; // objective id
    if (!userId || !validateUserId(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!(await ensureOwnership(id, userId))) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const title: string | undefined = typeof body?.title === 'string' ? body.title.trim() : undefined;
    const description: string | undefined = typeof body?.description === 'string' ? body.description.trim() : undefined;
    const orderIndex: number | undefined = typeof body?.orderIndex === 'number' ? body.orderIndex : undefined;

    if (!title) return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 });

    const payload: Partial<ChecklistRow> = {
      objectiveid: id,
      title,
      description: description ?? null,
      orderindex: orderIndex ?? 0,
      completed: false,
    };

    const result = await executeSecureQuery(
      supabaseBackend.from('objective_checklists').insert(payload).select('*').single(),
      `POST /objetivos/${id}/checklists`,
      userId
    );

    if (result.error || !result.data) return NextResponse.json({ error: result.error?.message || 'Falha ao criar' }, { status: 500 });

    return NextResponse.json(mapRow(result.data as ChecklistRow), { status: 201 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    // Log de erro para debug e auditoria
    // console.error('[API][POST /objetivos/[id]/checklists]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

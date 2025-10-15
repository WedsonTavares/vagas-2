import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseBackend, validateUserId, executeSecureQuery } from '@/lib/supabase-backend';
import type { ObjectiveChecklist } from '@/types';

export const runtime = 'nodejs';

// API de Checklist de Objetivos - Item individual
// -----------------------------------------------
// Esta rota implementa a edição e remoção de um item específico do checklist de um objetivo.
// Utiliza autenticação Clerk, tipagem forte e acesso seguro ao banco via Supabase.
//
// Principais decisões:
// - Checklist vinculado ao objetivo por objectiveid
// - Validação de propriedade: só o dono do objetivo pode manipular o checklist
// - Tipos e DTOs centralizados para consistência entre backend e frontend
// - Campos snake_case para compatibilidade direta com o banco Postgres
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

// Interface que representa uma linha da tabela objective_checklists no banco
// Os nomes dos campos seguem o padrão snake_case do Postgres
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

// PATCH /api/objetivos/[id]/checklists/[checkId]
// ----------------------------------------------
// Atualiza um item específico do checklist de um objetivo do usuário autenticado.
// - Autenticação obrigatória
// - Validação de propriedade
// - Atualiza título, descrição, status de conclusão e ordem
// - Atualiza sempre o campo updatedat
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; checkId: string }> }) {
  try {
    const { userId } = await auth();
    const { id, checkId } = await params;
    if (!userId || !validateUserId(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!(await ensureOwnership(id, userId))) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const title: string | undefined = typeof body?.title === 'string' ? body.title.trim() : undefined;
    const description: string | undefined = typeof body?.description === 'string' ? body.description.trim() : undefined;
    const completed: boolean | undefined = typeof body?.completed === 'boolean' ? body.completed : undefined;
    const orderIndex: number | undefined = typeof body?.orderIndex === 'number' ? body.orderIndex : undefined;

  const payload: Partial<ChecklistRow> = {};
  if (title !== undefined) payload.title = title;
  if (description !== undefined) payload.description = description;
  if (completed !== undefined) payload.completed = completed;
  if (orderIndex !== undefined) payload.orderindex = orderIndex;
  payload.updatedat = new Date().toISOString();

    const result = await executeSecureQuery(
      supabaseBackend.from('objective_checklists').update(payload).eq('id', checkId).eq('objectiveid', id).select('*').maybeSingle(),
      `PATCH /objetivos/${id}/checklists/${checkId}`,
      userId
    );

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    if (!result.data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(mapRow(result.data as ChecklistRow));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/objetivos/[id]/checklists/[checkId]
// -----------------------------------------------
// Remove um item específico do checklist de um objetivo do usuário autenticado.
// - Autenticação obrigatória
// - Validação de propriedade
// - Remove apenas se o objetivo pertence ao usuário
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string; checkId: string }> }) {
  try {
    const { userId } = await auth();
    const { id, checkId } = await params;
    if (!userId || !validateUserId(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!(await ensureOwnership(id, userId))) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const result = await executeSecureQuery(
      supabaseBackend.from('objective_checklists').delete().eq('id', checkId).eq('objectiveid', id),
      `DELETE /objetivos/${id}/checklists/${checkId}`,
      userId
    );

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

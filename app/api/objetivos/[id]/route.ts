// API de Objetivos - CRUD individual
// ----------------------------------
// Esta rota implementa operações de leitura, atualização e remoção de um objetivo específico.
// Utiliza autenticação Clerk, tipagem forte e acesso seguro ao banco via Supabase.
//
// Principais decisões:
// - Filtro por userid garante que só o dono pode acessar/editar/deletar
// - Tipos e DTOs centralizados para consistência entre backend e frontend
// - Validação de propriedade e tratamento de erros robusto
// - Campos snake_case para compatibilidade direta com o banco Postgres
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseBackend, validateUserId, executeSecureQuery } from '@/lib/supabase-backend';
import type { Objective } from '@/types';

export const runtime = 'nodejs';

// Interface que representa uma linha da tabela objectives no banco
// Os nomes dos campos seguem o padrão snake_case do Postgres
interface ObjectiveRow {
  id: string;
  userid: string;
  name: string;
  startdate?: string | null;
  enddate?: string | null;
  status: 'concluido' | 'em_andamento' | 'futuro';
  progress: number;
  createdat?: string | null;
  updatedat?: string | null;
}

// Função utilitária para converter uma linha do banco (ObjectiveRow)
// para o formato DTO usado no frontend (Objective)
const mapRowToDto = (r: ObjectiveRow): Objective => ({
  id: r.id,
  userId: r.userid,
  name: r.name,
  startDate: r.startdate ?? null,
  endDate: r.enddate ?? null,
  status: r.status,
  progress: r.progress,
  createdAt: r.createdat ?? null,
  updatedAt: r.updatedat ?? null,
});

// GET /api/objetivos/[id]
// -----------------------
// Busca um objetivo específico do usuário autenticado.
// - Autenticação obrigatória
// - Validação de propriedade: só retorna se o objetivo pertence ao usuário
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    if (!userId || !validateUserId(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await executeSecureQuery(
      supabaseBackend.from('objectives').select('*').eq('id', id).eq('userid', userId).maybeSingle(),
      `GET /objetivos/${id}`,
      userId
    );

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    if (!result.data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(mapRowToDto(result.data as ObjectiveRow));
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error(err);
    // Log de erro para debug e auditoria
    // console.error('[API][GET /objetivos/[id]]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/objetivos/[id]
// -------------------------
// Atualiza campos de um objetivo específico do usuário.
// - Autenticação obrigatória
// - Validação de propriedade
// - Atualiza nome, datas, status e progresso (se fornecidos)
// - Atualiza sempre o campo updatedat
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    if (!userId || !validateUserId(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const name: string | undefined = typeof body?.name === 'string' ? body.name.trim() : undefined;
    const startDate: string | undefined = typeof body?.startDate === 'string' ? body.startDate : undefined;
    const endDate: string | undefined = typeof body?.endDate === 'string' ? body.endDate : undefined;
    const status: ObjectiveRow['status'] | undefined = body?.status;
    const progress: number | undefined = typeof body?.progress === 'number' ? body.progress : undefined;

    const payload: Partial<ObjectiveRow> = {};
    if (name !== undefined) payload.name = name;
  if (startDate !== undefined) payload.startdate = startDate;
  if (endDate !== undefined) payload.enddate = endDate;
    if (status !== undefined) payload.status = status;
    if (progress !== undefined) payload.progress = progress; // normalmente calculado por trigger de checklist
  // sempre atualizar updatedat
  payload.updatedat = new Date().toISOString();

    const result = await executeSecureQuery(
      supabaseBackend.from('objectives').update(payload).eq('id', id).eq('userid', userId).select('*').maybeSingle(),
      `PATCH /objetivos/${id}`,
      userId
    );

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    if (!result.data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(mapRowToDto(result.data as ObjectiveRow));
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error(err);
    // Log de erro para debug e auditoria
    // console.error('[API][PATCH /objetivos/[id]]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/objetivos/[id]
// --------------------------
// Remove um objetivo específico do usuário autenticado.
// - Autenticação obrigatória
// - Validação de propriedade
// - Remove apenas se o objetivo pertence ao usuário
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    if (!userId || !validateUserId(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await executeSecureQuery(
      supabaseBackend.from('objectives').delete().eq('id', id).eq('userid', userId),
      `DELETE /objetivos/${id}`,
      userId
    );

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error(err);
    // Log de erro para debug e auditoria
    // console.error('[API][DELETE /objetivos/[id]]', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

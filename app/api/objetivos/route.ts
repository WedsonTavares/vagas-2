// API de Objetivos - Listagem e Criação
// -------------------------------------
// Este arquivo implementa as rotas para listar e criar objetivos do usuário autenticado.
// Utiliza autenticação Clerk, tipagem forte e acesso seguro ao banco via Supabase.
//
// Principais funcionalidades:
// - GET: Lista todos os objetivos do usuário
// - POST: Cria um novo objetivo
// - Validação de propriedade e tipagem

// API de Objetivos
// ----------------
// Esta rota implementa a listagem e criação de objetivos do usuário autenticado.
// Utiliza autenticação Clerk, tipagem forte e acesso seguro ao banco via Supabase.
//
// Principais decisões:
// - Filtro por userid garante privacidade: cada usuário só vê seus objetivos.
// - Tipos e DTOs centralizados para consistência entre backend e frontend.
// - Validação de entrada e tratamento de erros robusto.
// - Campos snake_case para compatibilidade direta com o banco Postgres.

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseBackend, validateUserId, executeSecureQuery } from '@/lib/supabase-backend';
import type { Objective } from '@/types';


// Define o runtime para execução Node.js (Next.js API route)
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


// GET /api/objetivos
// ------------------
// Lista todos os objetivos do usuário autenticado.
// - Autenticação obrigatória via Clerk
// - Filtro por userid garante que só retorna objetivos do usuário logado
// - Ordena por data de criação (mais recentes primeiro)
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId || !validateUserId(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await executeSecureQuery(
      supabaseBackend.from('objectives').select('*').eq('userid', userId).order('createdat', { ascending: false }),
      'GET /objetivos - list',
      userId
    );

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    const rows = (result.data || []) as ObjectiveRow[];
    return NextResponse.json(rows.map(mapRowToDto));
  } catch {
    // Log de erro para debug
    // (logging removed to comply with linting rules)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


// POST /api/objetivos
// -------------------
// Cria um novo objetivo para o usuário autenticado.
// - Autenticação obrigatória via Clerk
// - Valida o campo 'name' (obrigatório)
// - Os campos startDate, endDate e status são opcionais
// - O progresso inicia em 0 e será atualizado automaticamente por triggers do banco
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId || !validateUserId(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Extrai e valida os dados do corpo da requisição
    const body = await request.json().catch(() => ({}));
    const name: string | undefined = typeof body?.name === 'string' ? body.name.trim() : undefined;
  const startDate: string | undefined = typeof body?.startDate === 'string' ? body.startDate : undefined;
  const endDate: string | undefined = typeof body?.endDate === 'string' ? body.endDate : undefined;
    const status: ObjectiveRow['status'] | undefined = body?.status;

    if (!name) return NextResponse.json({ error: 'Nome do objetivo é obrigatório' }, { status: 400 });

    // Monta o payload para inserção no banco
    const insertPayload: Partial<ObjectiveRow> = {
      userid: userId,
      name,
      startdate: startDate ?? null,
      enddate: endDate ?? null,
      status: status ?? 'futuro',
      progress: 0,
    } as Partial<ObjectiveRow>;

    // Executa a inserção segura via Supabase
    const result = await executeSecureQuery(
      supabaseBackend.from('objectives').insert(insertPayload).select('*').single(),
      'POST /objetivos - create',
      userId
    );

    if (result.error || !result.data) return NextResponse.json({ error: result.error?.message || 'Falha ao criar' }, { status: 500 });

    // Retorna o objetivo criado já convertido para DTO
    const created = result.data as ObjectiveRow;
    return NextResponse.json(mapRowToDto(created), { status: 201 });
  } catch {
    // Log de erro para debug
    // (logging removed to comply with linting rules)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

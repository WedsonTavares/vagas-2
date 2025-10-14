# Guia Prático: Criando uma Nova Feature (Ex: Objetivos)

Este passo a passo segue exatamente os padrões já usados na feature de Certificados (migrations, API em App Router, Supabase, Clerk, types centralizados, componentes e páginas). Use como checklist para qualquer nova funcionalidade.

---
## Visão Geral do Fluxo
1. Especificar domínio e campos.
2. Criar migration (estrutura da tabela no Supabase/Postgres).
3. Definir tipos TypeScript públicos em `types/index.ts`.
4. (Opcional) Utilidades de backend em `lib/` se houver lógica comum.
5. Implementar rotas API: lista, criação, item, atualização e deleção.
6. Criar componentes (Card, Detalhes, Form, etc.).
7. Criar páginas (`/dashboard/...`) para listar e adicionar.
8. Integrar fetch + UX (expansão, toasts, confirmações).
9. Testar fluxo completo (CRUD mínimo).
10. Refino (animação, acessibilidade, perf, limpeza de types).
11. Commits organizados e push.

---
## Passo 0 — Planejamento Rápido
Defina:
- Nome plural e singular (ex: objetivo / objetivos → tabela `objectives`).
- Campos obrigatórios e opcionais.
- Necessita upload? (se sim, seguir padrão de certificados: `storage_path`, `file_mime`, etc.).
- Operações mínimas: listar, criar, (atualizar status?), deletar.

> Dica: manter nomes simples e consistentes; no banco usar `snake_case`, no front `camelCase`.

---
## Passo 1 — Migration
Arquivo exemplo existente: `db/migrations/2025-10-13-create-certificates-table.sql`.

Crie um novo arquivo em `db/migrations/YYYY-MM-DD-create-objectives-table.sql`:
```sql
BEGIN;

CREATE TABLE IF NOT EXISTS public.objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  userid text NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  progress int DEFAULT 0,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS objectives_userid_idx ON public.objectives (userid);

COMMIT;
```
Porque primeiro? A tabela define os campos reais — sem ela os endpoints e types podem divergir da verdade do banco.

Checklist Migration:
- Idempotente (usa IF NOT EXISTS).
- Índices para colunas de filtro (userid / status se necessário).
- Timestamps padrão (created_at / updated_at).

---
## Passo 2 — Tipos Globais
Arquivo de referência: `types/index.ts` (ver seção Certificate).

Adicionar interface pública (camelCase):
```ts
export interface Objective {
  id: string;
  userId?: string;      // preenchido na resposta da API
  title: string;
  description?: string | null;
  status?: string | null;     // 'pending' | 'in_progress' | 'done' (defina enum lógico)
  progress?: number | null;   // 0–100
  dueDate?: string | null;    // formato 'YYYY-MM-DD'
  createdAt?: string | null;
  updatedAt?: string | null;
}
```
Por que agora? Para garantir consistência na implementação da API e nos componentes (contrato único de dados).

---
## Passo 3 — Rotas API (Backend HTTP)
Padrões de referência:
- Lista e criação: `app/api/cursos/certificados/route.ts`
- Item individual: `app/api/cursos/certificados/[id]/route.ts`
- Download (exemplo avançado): `app/api/cursos/certificados/[id]/download/route.ts`

Criar diretórios:
```
app/api/objetivos/route.ts
app/api/objetivos/[id]/route.ts
```

### 3.1 GET /api/objetivos (listar)
Esqueleto sugerido (adapte):
```ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseBackend, validateUserId, executeSecureQuery } from '@/lib/supabase-backend';

export const runtime = 'nodejs';

interface ObjectiveRow {
  id: string; userid: string; title: string; description?: string | null; status?: string | null; progress?: number | null; due_date?: string | null; created_at?: string | null; updated_at?: string | null;
}

const mapRow = (r: ObjectiveRow) => ({
  id: r.id,
  userId: r.userid,
  title: r.title,
  description: r.description,
  status: r.status,
  progress: r.progress,
  dueDate: r.due_date,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export async function GET() {
  const { userId } = await auth();
  if (!userId || !validateUserId(userId)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await executeSecureQuery(
    supabaseBackend.from('objectives').select('*').eq('userid', userId).order('created_at', { ascending: false }),
    'GET /objetivos',
    userId
  );
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  const rows = (result.data || []) as ObjectiveRow[];
  return NextResponse.json(rows.map(mapRow));
}
```

### 3.2 POST /api/objetivos (criar)
- Body: JSON (sem upload inicialmente). Use `await request.json()`.
- Sanitizar: trim em title / description.
- Forçar `userid = userId` (não confiar no body).

### 3.3 GET /api/objetivos/[id]
- Similar ao certificado: busca single + valida ownership.

### 3.4 PATCH ou PUT /api/objetivos/[id]
- Atualizar `status`, `progress`, `title` ou `description`.
- Atualizar `updated_at = now()` (via Supabase: `.update({ ..., updated_at: new Date().toISOString() })`).

### 3.5 DELETE /api/objetivos/[id]
- Mesma lógica do DELETE de certificados.

Motivos da API cedo: Permite já testar com curl / Thunder antes do front — reduz retrabalho visual.

---
## Passo 4 — Componentes UI
Referências:
- Estrutura de card: `app/dashboard/cursos/certificados/page.tsx`
- Expansão/Detalhes: `components/certificados/ExpansiveCard.tsx`
- Form: `app/dashboard/cursos/certificados/add/page.tsx`

Criar em `components/objetivos/`:
- `ObjectiveCard.tsx` — mostra título, status, dueDate, progresso.
- `ObjectiveDetails.tsx` — campos completos (descrição, datas, progresso, etc.).
- `ObjectiveForm.tsx` — inputs reutilizáveis (add/editar).

Manter padrão de estilo: `bg-[color:var(--color-card)]`, `border border-[color:var(--color-border)]`, `text-[color:var(--color-muted-foreground)]`.

---
## Passo 5 — Pages
Estrutura:
```
app/dashboard/objetivos/page.tsx        // list + expansão
app/dashboard/objetivos/add/page.tsx    // form de criação
```

### 5.1 List Page
- `"use client"`
- Estados: `items`, `loading`, `expandedId`.
- Fetch inicial: `useEffect` -> GET `/api/objetivos`.
- Botões: Abrir/Fechar (expansão), Editar (se implementar), Excluir (com confirmação `useConfirmation`).
- Transição de expansão: reutilizar classes do painel de certificados (`overflow-hidden transition-all duration-300 ...`).

### 5.2 Add Page
- Reutilizar `ObjectiveForm`.
- Submit -> POST `/api/objetivos`.
- Toasts via `useToast()`.
- Redirect para `/dashboard/objetivos` ao sucesso.

Motivo: Criamos páginas depois da API para testar dados reais — evita mock.

---
## Passo 6 — Integração / Lógica
- Mapear snake_case → camelCase antes de enviar pro front (feito no mapRow).
- Para edição inline, você pode atualizar o item no estado sem refazer fetch completo.
- Para exclusão, refazer fetch ou filtrar localmente.

---
## Passo 7 — Validações e UX
- Campos obrigatórios: title.
- Status controlado (enum lógico) evita sujeira.
- Progress: limitar 0–100 (clamp).
- Mensagens de erro consistentes (ex: 'Falha ao carregar objetivos').

---
## Passo 8 — Commits Organizados
Sugestão de sequência:
1. `feat(migration): create objectives table`
2. `feat(types): add Objective interface`
3. `feat(api): objectives list & create endpoints`
4. `feat(api): objective single + update + delete`
5. `feat(ui): objectives list page + card + expansion`
6. `feat(ui): add objective form`
7. `chore: refine animations & toasts`

Super commit só no final se preferir squash.

---
## Passo 9 — Teste Manual Rápido
1. Rodar migrations (dependendo do teu fluxo local / Supabase). 
2. Criar objetivo (form) → verificar na lista.
3. Expandir → ver detalhes coerentes.
4. Atualizar (se houver) → verificar progress/status.
5. Deletar → confirmar remoção e toasts.
6. Ver console sem erros silenciosos.

---
## Passo 10 — Possíveis Extensões
- Filtros por status.
- Agrupamento (ex: objetivos concluídos vs ativos).
- Métricas / estatísticas (criar rota `app/api/objetivos/stats/route.ts`).
- Upload de anexo (seguir padrão certificado com bucket próprio: `objectives`).
- Paginação (usar `.range(0, 19)` etc.).

---
## Padrões Importantes (Resumo)
| Área | Padrão | Exemplo Referência |
|------|--------|--------------------|
| Snake → Camel | Mapear antes de responder | `app/api/cursos/certificados/route.ts` |
| Auth | `auth()` + `validateUserId` | Todas rotas de certificados |
| Query segura | `executeSecureQuery` | Rotas certificados |
| Tipos globais | `types/index.ts` | Interface `Certificate` |
| Estrutura card | Card + expansão suave | `certificados/page.tsx` |
| Upload | formData + validações | `certificados/add/page.tsx` |
| Animação | `transition-all` + `max-h` | `certificados/page.tsx` |
| Erros | `res.ok` + toast erro | Add / list certificados |
| Datas | Guardar em formato date / YYYY-MM-DD | Certificados (startDate/endDate) |

---
## Mini Checklist Final Antes do Push
- [ ] Migration criada e aplicada.
- [ ] Interface adicionada em `types/index.ts`.
- [ ] Rotas GET list / POST create funcionando (testadas via curl/Thunder).
- [ ] Rotas GET item / DELETE / PATCH (se necessário) completas.
- [ ] Componentes (Card / Details / Form) criados.
- [ ] List page consome API real.
- [ ] Add page cria e redireciona.
- [ ] Animação de expansão ok.
- [ ] Sem `any` desnecessário.
- [ ] Toasts e mensagens de erro coerentes.
- [ ] Commits organizados.

---
## Exemplo de Teste Rápido da API (Opcional)
```bash
# Listar (espera array)
curl -H "Authorization: Bearer <token-clerk-se-exposto>" http://localhost:3000/api/objetivos

# Criar
curl -X POST -H "Content-Type: application/json" -d '{"title":"Primeiro objetivo","description":"Teste"}' http://localhost:3000/api/objetivos
```
(Ajuste auth conforme seu setup; em ambiente autenticado via browser não precisa manualmente.)

---
## Conclusão
Seguindo essa sequência você evita retrabalho, mantém consistência com a feature de Certificados e garante uma entrega incremental validável desde o início. Ao terminar, revise se a experiência do usuário (tempo de resposta, feedback visual e ausência de erros silenciosos) está no mesmo nível de qualidade.

Se quiser, posso já gerar os esqueletos iniciais para "objetivos" — só pedir.

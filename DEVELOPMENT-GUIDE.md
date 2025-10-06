# 🚀 Guia de Desenvolvimento - Controle de Vagas

## 📋 Fluxo de Desenvolvimento

### 1. Setup Inicial

```bash
# Clone do repositório
git clone [repo-url]
cd controle-vagas

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves
```

### 2. Desenvolvimento Local

```bash
# Iniciar ambiente de desenvolvimento
npm run dev

# Em outro terminal, verificar qualidade do código
npm run lint
npm run type-check
npm run format
```

### 3. Workflow de Features

#### Branch develop

- **Finalidade**: Branch principal de desenvolvimento
- **Uso**: Todas as features são desenvolvidas aqui
- **Deploy**: Vercel Preview (automático)

#### Branch main

- **Finalidade**: Código de produção
- **Uso**: Apenas merges da develop via PR
- **Deploy**: Produção (automático)

### 4. Criando uma Nova Feature

```bash
# 1. Atualizar develop
git checkout develop
git pull origin develop

# 2. Criar feature branch (opcional para features pequenas)
git checkout -b feature/nova-funcionalidade

# 3. Desenvolver
# ... código ...

# 4. Antes de commit - validar qualidade
npm run lint
npm run type-check
npm run build

# 5. Commit
git add .
git commit -m "feat: adicionar nova funcionalidade"

# 6. Push para develop (ou merge da feature branch)
git checkout develop
git merge feature/nova-funcionalidade
git push origin develop
```

### 5. Deploy para Produção

```bash
# 1. Validação pré-deploy
npm run pre-deploy

# 2. Se validação passou, criar PR de develop → main
gh pr create --base main --head develop --title "Deploy: [descrição]"

# 3. Merge do PR triggera deploy automático para produção
```

## 🛠️ Scripts Disponíveis

| Script                 | Descrição                                 |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Inicia servidor de desenvolvimento        |
| `npm run build`        | Build de produção                         |
| `npm run start`        | Inicia servidor de produção               |
| `npm run lint`         | Executa ESLint                            |
| `npm run lint:fix`     | Corrige problemas de lint automaticamente |
| `npm run type-check`   | Verifica tipos TypeScript                 |
| `npm run format`       | Formata código com Prettier               |
| `npm run format:check` | Verifica formatação sem alterar           |
| `npm run pre-deploy`   | Validação completa pré-deploy             |

## 🔄 CI/CD Pipeline

### Triggers Automáticos

#### Push para develop:

- ✅ Tests
- ✅ Lint & Type Check
- ✅ Security Audit
- 🚀 Deploy Preview (Vercel)

#### Push para main:

- ✅ Tests
- ✅ Lint & Type Check
- ✅ Security Audit
- 🚀 Deploy Production (Vercel)

#### Pull Requests:

- ✅ Tests
- ✅ Lint & Type Check
- ✅ Security Audit
- 📊 Comment com status

### 4 Jobs do Pipeline:

1. **Test Job**
   - Setup Node.js
   - Install dependencies
   - Run lint
   - Run type-check
   - Run build

2. **Security Job**
   - Audit dependencies
   - Check for vulnerabilities
   - Report security issues

3. **Deploy Preview** (develop only)
   - Deploy para Vercel Preview
   - Comment no PR com URL

4. **Deploy Production** (main only)
   - Deploy para produção
   - Create release notes
   - Notify team

## 🔧 Configuração de Qualidade

### ESLint (.eslintrc.json)

- Next.js rules
- TypeScript rules
- Prettier integration
- Custom rules para melhor DX

### Prettier (.prettierrc.json)

- 2 spaces indentation
- Single quotes
- Semicolons
- Trailing commas

### TypeScript (tsconfig.json)

- Strict mode enabled
- Path mapping configured
- Latest ES features

## 🌍 Variáveis de Ambiente

### Desenvolvimento (.env.local)

```bash
# Clerk Authentication (Development)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Produção (Vercel/Netlify)

- Use chaves de **produção** do Clerk (pk*live*, sk*live*)
- Configure todas as variáveis no painel do provedor
- Verifique PRODUCTION-SETUP.md para lista completa

## 🚨 Troubleshooting

### Erro de Build

```bash
# Limpar cache e rebuildar
rm -rf .next node_modules
npm install
npm run build
```

### Erro de Lint

```bash
# Corrigir automaticamente
npm run lint:fix

# Se persistir, verificar .eslintrc.json
```

### Erro de Tipos

```bash
# Verificar tipos específicos
npx tsc --noEmit --incremental false

# Regenerar tipos do Supabase se necessário
```

### Deploy Falhou

```bash
# Executar validação local
npm run pre-deploy

# Verificar logs do CI/CD no GitHub Actions
```

## 📊 Monitoramento

### GitHub Actions

- Acesse "Actions" tab no GitHub
- Monitore builds e deploys
- Logs detalhados disponíveis

### Vercel Dashboard

- Preview deployments
- Production deployments
- Performance metrics
- Error tracking

### Supabase Dashboard

- Database health
- API usage
- Query performance
- RLS policies status

## 🎯 Best Practices

### Commits

- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`
- Mantenha commits pequenos e focados
- Escreva mensagens claras e descritivas

### Code Quality

- Execute `npm run pre-deploy` antes de qualquer merge
- Nunca faça push direto para main
- Use develop como branch principal de trabalho

### Security

- Nunca commite .env.local
- Use Service Role Key apenas no backend
- Mantenha dependências atualizadas

### Performance

- Monitore bundle size após mudanças
- Use React.memo quando necessário
- Otimize queries do Supabase

## 📚 Recursos Úteis

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)

---

**🎉 Ambiente de desenvolvimento profissional configurado com sucesso!**

Para começar: `git checkout develop && npm run dev`

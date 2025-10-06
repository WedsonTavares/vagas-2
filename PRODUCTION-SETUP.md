# 🔧 Configuração para Produção - Controle de Vagas

## 📋 Checklist Pré-Deploy

### ✅ 1. Variáveis de Ambiente (Vercel/Netlify)

**⚠️ CRÍTICO:** Configure estas variáveis no seu provedor de hospedagem:

```bash
# ============================================
# AUTENTICAÇÃO - CLERK (PRODUÇÃO)
# ============================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_sua_chave_live_aqui
CLERK_SECRET_KEY=sk_live_sua_chave_secreta_live_aqui

# URLs de redirecionamento
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# ============================================
# BANCO DE DADOS - SUPABASE (PRODUÇÃO)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://seu_projeto_prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_produção_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_produção_aqui

# ============================================
# CONFIGURAÇÕES DE PRODUÇÃO
# ============================================
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### ✅ 2. Configurações de Domínio

1. **Clerk Dashboard:**
   - Adicione seu domínio de produção em "Allowed redirect URLs"
   - Configure webhook endpoints se usar
   - Ative autenticação de produção

2. **Supabase Dashboard:**
   - Adicione domínio em "Site URL"
   - Configure CORS se necessário
   - Verifique RLS está ativo

### ✅ 3. Build & Deploy

```bash
# Teste local antes do deploy
npm run build
npm run start

# Teste os scripts
npm run lint
npm run type-check
```

### ✅ 4. Segurança

- [ ] Chaves de teste removidas
- [ ] Service Role Key configurada corretamente
- [ ] RLS ativo no Supabase
- [ ] Headers de segurança configurados
- [ ] HTTPS ativo

### ✅ 5. Monitoramento

- [ ] Logs configurados
- [ ] Error tracking (opcional: Sentry)
- [ ] Performance monitoring
- [ ] Uptime monitoring

## 🚨 NUNCA FAÇA

❌ **Não commite chaves secretas**
❌ **Não use chaves de teste em produção**
❌ **Não desative RLS**
❌ **Não exponha Service Role Key no frontend**

## 🔄 Workflow de Deploy

1. **Desenvolvimento:** `develop` branch
2. **Pull Request:** para `main` branch
3. **Review:** código passa por CI/CD
4. **Merge:** deploy automático para produção
5. **Monitor:** verificar funcionamento

## 📞 Troubleshooting

### Erro: "Invalid Clerk Keys"

- Verifique se está usando chaves de produção
- Confirme domínio no Clerk Dashboard

### Erro: "Database connection failed"

- Verifique Service Role Key
- Confirme URL do Supabase
- Teste conexão local primeiro

### Erro: "RLS Policy"

- Confirme que RLS está ativo
- Verifique policies no Supabase
- Teste com dados de usuário real

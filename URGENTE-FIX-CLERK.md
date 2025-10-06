🚨 ERRO CRÍTICO: Clerk com chaves de desenvolvimento em produção

## ⚠️ PROBLEMA IDENTIFICADO:
- Está usando pk_test_... em produção
- Clerk bloqueia acesso externo em modo de desenvolvimento
- Precisa configurar para produção

## 🔧 SOLUÇÕES URGENTES:

### OPÇÃO 1: Configurar domínio no Clerk (RECOMENDADO)
1. Acesse https://clerk.com/
2. Vá no seu projeto
3. Settings → Domains
4. Adicione: controle-vagas-mauve.vercel.app
5. Salve as configurações

### OPÇÃO 2: Usar chaves de produção
1. No Clerk Dashboard
2. Mude para "Production" mode  
3. Copie as novas chaves pk_live_... e sk_live_...
4. Atualize no Vercel:
   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
   - CLERK_SECRET_KEY=sk_live_...

### OPÇÃO 3: Configurar URLs no Clerk
1. Clerk Dashboard → Paths
2. Configure:
   - Home URL: https://controle-vagas-mauve.vercel.app
   - Sign in URL: https://controle-vagas-mauve.vercel.app/sign-in
   - Sign up URL: https://controle-vagas-mauve.vercel.app/sign-up
   - After sign in: https://controle-vagas-mauve.vercel.app/dashboard

## 🎯 TESTE RÁPIDO:
Depois de configurar, acesse:
https://controle-vagas-mauve.vercel.app

Deve funcionar sem erro 404!
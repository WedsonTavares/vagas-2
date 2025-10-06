# 🔧 CONFIGURAÇÕES DO CLERK PARA PRODUÇÃO

## 1. Acesse o Dashboard do Clerk
- https://clerk.com/
- Faça login na sua conta

## 2. Configure o Domain do Vercel
- No projeto do Clerk
- Vá em "Domains" 
- Adicione o domínio do Vercel: "SEU-PROJETO.vercel.app"

## 3. Atualize as URLs de Redirect
- Em "Paths" configure:
  - Sign-in URL: /sign-in
  - Sign-up URL: /sign-up  
  - After sign-in: /dashboard
  - After sign-up: /dashboard

## 4. Teste Mode vs Production Mode
- Se estiver em "Test Mode", mantenha as chaves pk_test_... e sk_test_...
- Para "Production Mode", troque por pk_live_... e sk_live_...

## 5. Webhook URLs (se necessário)
- Configure webhook endpoints apontando para:
  - https://SEU-PROJETO.vercel.app/api/webhooks/clerk
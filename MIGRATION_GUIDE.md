# Migração para Supabase

## Status Atual
✅ **Aplicação funcionando** com SQLite local (`prisma/dev.db`)  
✅ **Backup vazio criado** (`backup-empty.json`)  
✅ **Scripts de restauração** prontos (`restore-script.js`)  

## Como migrar para Supabase

### 1. Obter credenciais corretas
Acesse o painel do Supabase: https://supabase.com/dashboard

1. Vá em **Settings > Database**
2. Copie a **Connection string** correta
3. Verifique se o projeto está **ativo/não pausado**

### 2. Atualizar configuração

**Em `prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Em `.env`:**
```bash
DATABASE_URL="sua_url_supabase_correta_aqui"
```

### 3. Fazer backup dos dados atuais
```bash
node backup-script.js
```

### 4. Migrar para Supabase
```bash
npx prisma generate
npx prisma db push
```

### 5. Restaurar dados
```bash
node restore-script.js backup-TIMESTAMP.json
```

## Arquivos importantes
- `backup-empty.json` - Backup inicial (vazio)
- `restore-script.js` - Script para restaurar dados
- `prisma/dev.db` - Banco SQLite atual (funcionando)

## Para usar localmente (atual)
A aplicação está funcionando perfeitamente com SQLite local. Você pode:
- Criar vagas
- Editar vagas  
- Excluir vagas
- Ver estatísticas
- Tudo funciona normalmente

## Problemas com Supabase encontrados
- ❌ "Tenant or user not found" - credenciais incorretas
- ❌ "Can't reach database server" - conectividade/projeto pausado
- ❌ URLs testadas não funcionaram

A migração para Supabase deve ser feita apenas quando você tiver acesso correto ao painel e às credenciais válidas.
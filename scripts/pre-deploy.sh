#!/bin/bash

# 🔍 Validação Pré-Deploy
# Execute antes de fazer deploy para produção

echo "🔍 Iniciando validação pré-deploy..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de erros
ERRORS=0

echo ""
echo "📋 CHECKLIST DE VALIDAÇÃO"
echo "=========================="

# 1. Verificar se estamos na branch develop ou main
echo ""
echo "1️⃣ Verificando branch atual..."
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "develop" ]]; then
    echo -e "${GREEN}✅ Branch válida: $CURRENT_BRANCH${NC}"
else
    echo -e "${RED}❌ Branch inválida: $CURRENT_BRANCH${NC}"
    echo "   Deploy só é permitido de 'main' ou 'develop'"
    ERRORS=$((ERRORS + 1))
fi

# 2. Verificar se há mudanças não commitadas
echo ""
echo "2️⃣ Verificando mudanças não commitadas..."
if git diff-index --quiet HEAD --; then
    echo -e "${GREEN}✅ Nenhuma mudança não commitada${NC}"
else
    echo -e "${YELLOW}⚠️  Há mudanças não commitadas${NC}"
    echo "   Considere fazer commit antes do deploy"
fi

# 3. Executar type check
echo ""
echo "3️⃣ Executando verificação de tipos..."
if npm run type-check; then
    echo -e "${GREEN}✅ Type check passou${NC}"
else
    echo -e "${RED}❌ Type check falhou${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 4. Executar lint
echo ""
echo "4️⃣ Executando lint..."
if npm run lint; then
    echo -e "${GREEN}✅ Lint passou${NC}"
else
    echo -e "${RED}❌ Lint falhou${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 5. Tentar build
echo ""
echo "5️⃣ Testando build..."
if npm run build; then
    echo -e "${GREEN}✅ Build bem-sucedido${NC}"
else
    echo -e "${RED}❌ Build falhou${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 6. Verificar variáveis de ambiente críticas
echo ""
echo "6️⃣ Verificando variáveis de ambiente..."

# Verificar se .env.local existe
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ Arquivo .env.local encontrado${NC}"
    
    # Verificar chaves críticas
    if grep -q "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env.local; then
        echo -e "${GREEN}✅ Clerk Publishable Key encontrada${NC}"
    else
        echo -e "${RED}❌ Clerk Publishable Key não encontrada${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "CLERK_SECRET_KEY" .env.local; then
        echo -e "${GREEN}✅ Clerk Secret Key encontrada${NC}"
    else
        echo -e "${RED}❌ Clerk Secret Key não encontrada${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
        echo -e "${GREEN}✅ Supabase Service Role Key encontrada${NC}"
    else
        echo -e "${RED}❌ Supabase Service Role Key não encontrada${NC}"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Verificar se não há chaves de teste em produção
    if [[ "$CURRENT_BRANCH" == "main" ]]; then
        if grep -q "pk_test" .env.local; then
            echo -e "${RED}❌ Chave de teste do Clerk detectada na branch main!${NC}"
            echo "   Use chaves de produção para deploy"
            ERRORS=$((ERRORS + 1))
        fi
        
        if grep -q "sk_test" .env.local; then
            echo -e "${RED}❌ Chave secreta de teste do Clerk detectada na branch main!${NC}"
            echo "   Use chaves de produção para deploy"
            ERRORS=$((ERRORS + 1))
        fi
    fi
else
    echo -e "${RED}❌ Arquivo .env.local não encontrado${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 7. Verificar se package.json está atualizado
echo ""
echo "7️⃣ Verificando package.json..."
if npm outdated; then
    echo -e "${YELLOW}⚠️  Há dependências desatualizadas${NC}"
    echo "   Considere atualizar antes do deploy"
else
    echo -e "${GREEN}✅ Dependências atualizadas${NC}"
fi

# 8. Verificar tamanho do build
echo ""
echo "8️⃣ Verificando tamanho do build..."
BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
if [ ! -z "$BUILD_SIZE" ]; then
    echo -e "${GREEN}✅ Tamanho do build: $BUILD_SIZE${NC}"
else
    echo -e "${YELLOW}⚠️  Não foi possível determinar o tamanho do build${NC}"
fi

# Resultado final
echo ""
echo "=========================="
echo "📊 RESULTADO DA VALIDAÇÃO"
echo "=========================="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 VALIDAÇÃO PASSOU! Deploy autorizado.${NC}"
    echo ""
    echo "🚀 Próximos passos:"
    echo "   1. Configure as variáveis de ambiente no Vercel/Netlify"
    echo "   2. Verifique o arquivo PRODUCTION-SETUP.md"
    echo "   3. Faça o push para triggerar o deploy automático"
    echo ""
    exit 0
else
    echo -e "${RED}❌ VALIDAÇÃO FALHOU! $ERRORS erro(s) encontrado(s).${NC}"
    echo ""
    echo "🔧 Corrija os erros antes de fazer deploy:"
    echo "   1. Resolva os problemas listados acima"
    echo "   2. Execute novamente: npm run pre-deploy"
    echo "   3. Só então faça o deploy"
    echo ""
    exit 1
fi
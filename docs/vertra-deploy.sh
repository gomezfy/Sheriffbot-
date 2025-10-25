#!/bin/bash

# Script para preparar o projeto para deploy no Vertra Cloud
# Execute este script antes de fazer upload do ZIP

echo "🚀 Preparando projeto para deploy no Vertra Cloud..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado!${NC}"
    echo "Execute este script na raiz do projeto."
    exit 1
fi

echo -e "${GREEN}✅ Diretório correto${NC}"

# 2. Limpar arquivos desnecessários
echo "🧹 Limpando arquivos desnecessários..."

# Remover node_modules se existir
if [ -d "node_modules" ]; then
    echo "  → Removendo node_modules..."
    rm -rf node_modules
fi

# Remover dist se existir
if [ -d "dist" ]; then
    echo "  → Removendo dist..."
    rm -rf dist
fi

# Remover arquivos de log
find . -name "*.log" -type f -delete 2>/dev/null

# Remover arquivos temporários
rm -rf tmp temp *.tmp 2>/dev/null

echo -e "${GREEN}✅ Limpeza concluída${NC}"

# 3. Verificar arquivos essenciais
echo "📋 Verificando arquivos essenciais..."

MISSING_FILES=()

if [ ! -f "package.json" ]; then
    MISSING_FILES+=("package.json")
fi

if [ ! -f "tsconfig.json" ]; then
    MISSING_FILES+=("tsconfig.json")
fi

if [ ! -f "vertracloud.config" ]; then
    MISSING_FILES+=("vertracloud.config")
fi

if [ ! -f "src/index.ts" ]; then
    MISSING_FILES+=("src/index.ts")
fi

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    echo -e "${RED}❌ Arquivos essenciais faltando:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo "  - $file"
    done
    exit 1
fi

echo -e "${GREEN}✅ Todos os arquivos essenciais presentes${NC}"

# 4. Criar diretórios necessários
echo "📁 Criando diretórios necessários..."

mkdir -p src/data
mkdir -p data

# Criar arquivos .gitkeep se não existirem
touch src/data/.gitkeep
touch data/.gitkeep

echo -e "${GREEN}✅ Diretórios criados${NC}"

# 5. Verificar variáveis de ambiente
echo "🔐 Verificando configuração de variáveis de ambiente..."

if [ ! -f ".env.example" ]; then
    echo -e "${YELLOW}⚠️  Aviso: .env.example não encontrado${NC}"
else
    echo -e "${GREEN}✅ .env.example presente${NC}"
    echo ""
    echo -e "${YELLOW}📝 Lembre-se de configurar estas variáveis no Vertra Cloud:${NC}"
    grep -v "^#" .env.example | grep -v "^$" | sed 's/=.*/=...'
fi

# 6. Criar arquivo ZIP para upload
echo ""
echo "📦 Criando arquivo ZIP para upload..."

ZIP_NAME="sheriffbot-vertra-$(date +%Y%m%d-%H%M%S).zip"

# Criar ZIP excluindo arquivos desnecessários
zip -r "$ZIP_NAME" . \
    -x "node_modules/*" \
    -x "dist/*" \
    -x ".git/*" \
    -x "*.log" \
    -x ".env" \
    -x ".env.*" \
    -x "src/data/*.json" \
    -x "data/*.json" \
    -x "attached_assets/*" \
    -x "website_updated.zip" \
    -x ".devcontainer/*" \
    -x "tests/*" \
    -x "*.test.ts" \
    -x "*.spec.ts" \
    -x ".DS_Store" \
    -x "Thumbs.db" \
    -x ".vscode/*" \
    -x ".idea/*" \
    -x "tmp/*" \
    -x "temp/*" \
    > /dev/null 2>&1

if [ $? -eq 0 ]; then
    SIZE=$(du -h "$ZIP_NAME" | cut -f1)
    echo -e "${GREEN}✅ ZIP criado com sucesso: $ZIP_NAME ($SIZE)${NC}"
else
    echo -e "${RED}❌ Erro ao criar ZIP${NC}"
    exit 1
fi

# 7. Resumo final
echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Projeto pronto para deploy no Vertra Cloud!${NC}"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📦 Arquivo para upload: $ZIP_NAME"
echo ""
echo "📋 Próximos passos:"
echo "  1. Acesse https://vertracloud.app"
echo "  2. Crie um novo projeto (Discord Bot)"
echo "  3. Faça upload do arquivo: $ZIP_NAME"
echo "  4. Configure as variáveis de ambiente (veja acima)"
echo "  5. Inicie o bot"
echo "  6. Execute: npm run deploy (para registrar comandos)"
echo ""
echo "📚 Documentação completa: DEPLOY_VERTRA.md"
echo "═══════════════════════════════════════════════════════════"

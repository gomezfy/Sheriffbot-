# 📁 Estrutura do Projeto - Sheriff Rex Bot

## ✅ Pastas CORRETAS (Necessárias para Hospedagem)

### 📂 **src/** (564 KB) - ⭐ ESSENCIAL
Código-fonte principal do bot
```
src/
├── commands/        # Todos os comandos do bot (35 comandos)
│   ├── admin/      # Comandos administrativos
│   ├── bounty/     # Sistema de recompensas
│   ├── economy/    # Sistema de economia
│   ├── gambling/   # Jogos de azar
│   ├── mining/     # Sistema de mineração
│   ├── profile/    # Perfis de usuário
│   └── utility/    # Comandos utilitários
├── events/         # Eventos do Discord (ready, interactionCreate, etc)
├── utils/          # Funções auxiliares e managers
├── data/           # Arquivos JSON de dados (criados automaticamente)
├── index.ts        # Arquivo principal do bot
└── deploy-commands.ts  # Script para registrar comandos
```

### 📂 **assets/** (31 MB) - ⭐ ESSENCIAL
Recursos visuais do bot
```
assets/
├── profile-backgrounds/  # Fundos para perfis
├── fonts/               # Fontes para Canvas
├── custom-emojis/       # Emojis personalizados
└── *.png               # Ícones e imagens do bot
```

### 📂 **scripts/** (4 KB) - OPCIONAL
Scripts auxiliares para manutenção

### 📄 **Arquivos de Configuração** - ⭐ ESSENCIAL
- `package.json` - Dependências e scripts
- `tsconfig.json` - Configuração TypeScript
- `.env.example` - Template de variáveis de ambiente
- `README.md` - Documentação

## ❌ Pastas que NÃO devem ir para Hospedagem

### 🗑️ **node_modules/** (218 MB)
- Instalado automaticamente pelo `npm install`
- Já está no `.gitignore` ✅

### 🗑️ **attached_assets/** (44 MB)
- Imagens temporárias geradas no Replit
- Não essencial para funcionamento
- Agora está no `.gitignore` ✅

### 🗑️ **.cache/** (68 KB)
- Cache do ambiente Replit
- Agora está no `.gitignore` ✅

### 🗑️ **.local/** (268 KB)
- Dados locais do Replit Agent
- Agora está no `.gitignore` ✅

### 🗑️ **.config/** 
- Configurações do ambiente Replit
- Agora está no `.gitignore` ✅

### 🗑️ **website.zip** (9.7 MB)
- Website arquivado (não usado pelo bot)
- Já está no `.gitignore` ✅

## 📊 Tamanho Ideal para Upload

### Estrutura Mínima (Recomendada):
```
✅ src/              564 KB
✅ assets/          31 MB
✅ scripts/         4 KB
✅ package.json     4 KB
✅ tsconfig.json    4 KB
✅ .env.example     1 KB
✅ README.md        4 KB
━━━━━━━━━━━━━━━━━━━━━━━━
📦 TOTAL: ~32 MB
```

## 🚀 Como Fazer Upload para Vertra Cloud

### Opção 1: Via Git (Recomendado)
O `.gitignore` já está configurado para ignorar pastas desnecessárias:
```bash
git add .
git commit -m "Deploy to Vertra"
git push vertra main
```

### Opção 2: Upload Direto (ZIP)
1. Compacte **apenas** estas pastas/arquivos:
   - `src/`
   - `assets/`
   - `scripts/`
   - `package.json`
   - `tsconfig.json`
   - `.env.example`
   - `README.md`

2. **NÃO inclua:**
   - `node_modules/`
   - `attached_assets/`
   - `.cache/`, `.config/`, `.local/`
   - `website.zip`

### Comando para criar ZIP limpo:
```bash
zip -r sheriff-bot-deploy.zip \
  src/ \
  assets/ \
  scripts/ \
  package.json \
  tsconfig.json \
  .env.example \
  README.md \
  -x "*/node_modules/*" "*/.*"
```

## ✅ Checklist de Verificação

Antes de fazer upload, verifique:
- [ ] Pasta `src/` com todos os comandos
- [ ] Pasta `assets/` com as imagens
- [ ] `package.json` com todas as dependências
- [ ] `tsconfig.json` configurado corretamente
- [ ] `.env.example` presente (para referência)
- [ ] **SEM** node_modules
- [ ] **SEM** attached_assets
- [ ] **SEM** pastas .cache, .config, .local

## 📝 Após o Upload no Vertra

1. O Vertra executará automaticamente:
   ```bash
   npm install  # Instala as dependências
   npm start    # Inicia o bot
   ```

2. Configure as variáveis de ambiente:
   - `DISCORD_TOKEN`
   - `DISCORD_CLIENT_ID`

3. A pasta `src/data/` será criada automaticamente com os arquivos JSON

## 🎯 Estrutura Final na Hospedagem

```
vertra-cloud/
├── src/              # ✅ Código do bot
├── assets/           # ✅ Imagens e recursos
├── scripts/          # ✅ Scripts auxiliares
├── node_modules/     # ✅ Instalado automaticamente
├── package.json      # ✅ Dependências
└── tsconfig.json     # ✅ Config TypeScript

Tamanho total: ~250 MB (com node_modules instalado)
```

---

**Status:** ✅ Estrutura organizada e otimizada para hospedagem!

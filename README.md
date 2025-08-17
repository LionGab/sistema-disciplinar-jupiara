# Sistema de Monitoramento Disciplinar - Escola Cívico Militar Jupiara

## 🎯 Sobre o Sistema

Sistema completo de monitoramento disciplinar desenvolvido especificamente para a Escola Cívico Militar Jupiara. Permite o controle e acompanhamento de:

- 👥 **Alunos** - Cadastro e gerenciamento
- ⚠️ **Ocorrências Disciplinares** - Registro e acompanhamento
- 📅 **Controle de Faltas** - Justificadas e não justificadas
- 📊 **Métricas e Relatórios** - Dashboard analítico

## 🚀 Deploy Rápido no Netlify

### Pré-requisitos
1. Conta no [Netlify](https://netlify.com)
2. Banco de dados PostgreSQL (recomendado: [Neon](https://neon.tech))

### Passos para Deploy

1. **Faça o upload do projeto para o GitHub**
2. **Conecte com Netlify:**
   - Acesse netlify.com
   - Clique em "New site from Git"
   - Conecte seu repositório GitHub
   
3. **Configurações de Build:**
   ```
   Build command: npm run build
   Publish directory: dist
   Functions directory: netlify/functions
   ```

4. **Variáveis de Ambiente:**
   Adicione no Netlify Dashboard > Site settings > Environment variables:
   ```
   DATABASE_URL=sua_string_conexao_postgresql
   ```

5. **Deploy!** - O site será construído automaticamente

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Netlify Functions + Node.js
- **Banco de Dados:** PostgreSQL (Neon)
- **Icons:** Lucide React
- **Deploy:** Netlify

## 📦 Instalação

### Pré-requisitos
- Node.js 16+
- PostgreSQL 12+
- npm ou yarn

### 1. Configurar Banco de Dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco
CREATE DATABASE ficha_disciplinar;

# Executar schema
\c ficha_disciplinar
\i backend/database.sql

# Inserir dados de exemplo (opcional)
\i backend/dados-exemplo.sql
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Editar .env com suas credenciais do PostgreSQL

# Executar em desenvolvimento
npm run dev
```

### 3. Configurar Frontend

```bash
# Na pasta raiz do projeto
npm install

# Executar aplicação
npm start
```

## 🚀 Uso do Sistema

### Dashboard Principal
- **Métricas Gerais**: Visão consolidada de alunos, ocorrências e faltas
- **Gráficos por Turma**: Comparação de indicadores entre as 12 turmas
- **Evolução Mensal**: Tendências de ocorrências e faltas
- **Análise Detalhada**: Top 5 alunos com mais ocorrências por turma

### Módulo de Alunos  
- **Lista Filtrada**: Busca por nome/matrícula e filtro por turma
- **Ficha Completa**: Dados pessoais, histórico de ocorrências e faltas
- **Ações**: Visualizar, editar, excluir registros

### Módulo de Ocorrências
- **Cadastro Completo**: Aluno, tipo, gravidade, descrição, medidas
- **Tipos Pré-definidos**: 10 categorias (leve, média, grave) com pontuação
- **Acompanhamento**: Status pendente/em andamento/resolvida
- **Filtros**: Por turma, período, status

### Módulo de Faltas
- **Registro Individual**: Data, justificativa, documentos
- **Modo Resumo**: Consolidação por turma e aluno
- **Exportação**: Relatórios em CSV
- **Controle**: Faltas justificadas vs não justificadas

## 📊 Métricas e Indicadores

- **Taxa de Ocorrências por Aluno**: Média de ocorrências/aluno por turma
- **Pontuação Disciplinar**: Sistema de pontos baseado na gravidade
- **Frequência Escolar**: % de faltas justificadas vs não justificadas  
- **Evolução Temporal**: Tendências mensais por turma
- **Rankings**: Turmas e alunos com mais/menos problemas

## 🔧 Configurações Técnicas

### Variáveis de Ambiente (.env)
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ficha_disciplinar
DB_USER=postgres
DB_PASSWORD=sua_senha
JWT_SECRET=escola_civico_militar_jupiara_2024
```

### Estrutura do Banco
- **turmas**: 12 turmas pré-configuradas
- **alunos**: Dados pessoais e vinculação com turma
- **tipos_ocorrencia**: 10 tipos com gravidade e pontos
- **ocorrencias**: Registros disciplinares completos
- **faltas**: Controle de frequência com justificativas
- **usuarios**: Sistema de acesso por patente

### APIs Disponíveis
- `GET /api/alunos` - Lista alunos (filtro por turma)
- `GET /api/alunos/:id/ficha-completa` - Ficha completa
- `POST /api/ocorrencias` - Registrar ocorrência
- `GET /api/metricas/por-turma` - Métricas consolidadas
- `GET /api/faltas/resumo-turma/:id` - Resumo de faltas
- `GET /api/metricas/evolucao-mensal` - Dados para gráficos

## 📋 Dados de Exemplo

O sistema inclui dados de exemplo com:
- **13 alunos** distribuídos em 6 turmas
- **8 ocorrências** de diferentes tipos e gravidades  
- **16 faltas** (justificadas e não justificadas)
- **Cenários realistas** para demonstração completa

## 🎯 Casos de Uso Principais

1. **Tenente acessa Dashboard** → Visualiza métricas gerais e identifica turmas problemáticas
2. **Registra nova ocorrência** → Seleciona aluno, tipo, descreve situação, define medidas
3. **Consulta ficha de aluno** → Vê histórico completo, padrões comportamentais
4. **Controla faltas mensais** → Registra ausências, justifica, gera relatório
5. **Analisa evolução** → Compara meses anteriores, identifica tendências

## 🔒 Segurança e Permissões

- Sistema preparado para diferentes patentes (Tenente, Sargento)
- Logs de auditoria em todas as operações
- Validações no frontend e backend
- Proteção contra SQL injection
- Backup automático recomendado

---

**Desenvolvido para Escola Cívico Militar Jupiara**  
*Sistema de Controle Disciplinar v1.0*
# PontosWeb 🕒

[![Version](https://img.shields.io/badge/version-1.3.4--stable-green.svg)](https://github.com/code-bynary/pontosweb/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Sistema moderno e eficiente para controle de ponto eletrônico, desenvolvido especificamente para processar arquivos de exportação de relógios biométricos.

> [!IMPORTANT]
> **Versão 1.3.4 (Stable)**: Refatoração completa do motor de cálculo, tratamento de batidas redundantes, finais de semana e funcionalidade de recálculo manual.

---

## 🛠️ Tecnologias

- **Backend**: Node.js (Express), Prisma ORM, MySQL/MariaDB.
- **Frontend**: React (Vite), Tailwind CSS, Headless UI.
- **Relatórios**: PDFKit e ExcelJS.

---

## 📋 Changelog Recente

### [v1.3.4] - Stable Release (2026-02-02)
- **Fix Cálculo de Horas**: Refatoração completa da lógica de pareamento (In/Out) para suportar turnos noturnos de forma robusta.
- **Fix Redundância**: Sistema agora ignora automaticamente batidas duplicadas (intervalo < 5min).
- **Fix Finais de Semana**: Carga horária esperada zerada automaticamente para sábados e domingos.
- **Recálculo Manual**: Adicionado botão "Recalcular Mês" para processar batidas brutas com a nova lógica.
- **UI**: Exibição visual da versão no cabeçalho do sistema.
- **Bugfix**: Sincronização de totais no rodapé do cartão de ponto.

### [v1.3.3] - Hotfix (2026-01-08)
- **Fix Timezone**: Corrigido agrupamento de batidas usando horário local (evita que batidas após as 21:00 pulem para o dia seguinte).
- **Fix Meia-Noite**: Adicionado suporte para cálculos de jornadas que cruzam a meia-noite.

### [v1.3.2] - Stable Release (2026-01-08)
- **Fix Cálculos**: Corrigido erro de "NaN" nos relatórios mensais ao alinhar campos do servidor com o banco de dados.
- **Fix Crash**: Restaurada exportação ausente no serviço de API que causava tela branca.
- **Estabilidade**: Sincronização de `package-lock.json` para deploys determinísticos.

### [v1.2.0] - Stable Release (2026-01-08)
- **Fix Estabilidade**: Implementado sistema de limpeza de processos zumbis na porta 3001.
- **Fix Data/Hora**: Parser de TXT refatorado para ignorar fusos horários e manter precisão local.
- **Automação**: Geração imediata de jornadas após upload do arquivo.
- **Infra**: Scripts de backup automático e restore 100% validados.
- **Rede**: Configuração otimizada para acesso via IP público e DNS.

### [0.1.0 a 1.1.4] - Betas e Hotfixes
- Correção de permissões Prisma Shadow Database.
- Implementação de deduplicação de batidas.
- Ajuste de fuso horário no cabeçalho mensal.
- Fix de conectividade CORS.

---

## 🚀 Como Começar (Instalação Rápida)

Para instalar a versão estável no **Debian 12**, rode:

```bash
wget https://raw.githubusercontent.com/code-bynary/pontosweb/main/install-debian.sh
chmod +x install-debian.sh
./install-debian.sh
```

---

## 🔧 Manutenção

- **Atualizar**: `./update.sh` (faz backup automático antes de atualizar).
- **Restaurar**: `./restore.sh` (menu interativo de backups).
- **Logs**: `journalctl -u pontosweb-backend -f`.

---

© 2026 PontosWeb - Versão Estável 1.3.4

## 📋 Funcionalidades

### Backend (Node.js + Express + Prisma + MySQL)
- ✅ Upload e parsing de arquivos TXT de relógios biométricos
- ✅ Importação automática de batidas de ponto
- ✅ Criação/atualização automática de funcionários
- ✅ Geração de jornadas diárias a partir das batidas
- ✅ Cálculo automático de horas trabalhadas
- ✅ Edição manual de horários com histórico de ajustes
- ✅ API REST completa
- ✅ Exportação de cartão de ponto em PDF
- ✅ Exportação de cartão de ponto em Excel

### Frontend (React + Vite + Tailwind CSS)
- ✅ Interface moderna e responsiva
- ✅ Upload de arquivos com drag & drop
- ✅ Lista de funcionários com estatísticas
- ✅ Cartão de ponto mensal editável
- ✅ Navegação entre meses
- ✅ Indicadores visuais de status (OK, Incompleto, Editado)
- ✅ Totalizadores diários e mensais
- ✅ Botões de exportação (PDF/Excel)

## 🛠️ Tecnologias

### Backend
- **Node.js** 18+
- **Express** 4.x - Framework web
- **Prisma** 5.x - ORM
- **MySQL** 8.x - Banco de dados
- **Multer** - Upload de arquivos
- **PDFKit** - Geração de PDF
- **ExcelJS** - Geração de Excel
- **date-fns** - Manipulação de datas

### Frontend
- **React** 18+
- **Vite** 5.x - Build tool
- **Tailwind CSS** 3.x - Framework CSS
- **React Router** 6.x - Roteamento
- **Axios** - Cliente HTTP
- **date-fns** - Manipulação de datas

## 📁 Estrutura do Projeto

```
pontosweb/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Schema do banco de dados
│   ├── src/
│   │   ├── controllers/           # Controladores da API
│   │   ├── services/              # Lógica de negócio
│   │   ├── routes/                # Rotas da API
│   │   ├── utils/                 # Utilitários
│   │   └── server.js              # Servidor Express
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/            # Componentes React
│   │   ├── pages/                 # Páginas
│   │   ├── services/              # Serviços API
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ instalado
- MySQL 8+ instalado e rodando
- npm ou yarn

### 1. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações de banco de dados

# Gerar Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate

# Iniciar servidor de desenvolvimento
npm run dev
```

O backend estará rodando em `http://localhost:3001`

### 2. Configurar Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

## 📝 Formato do Arquivo TXT

O sistema espera arquivos TXT com campos delimitados por **TAB** no seguinte formato:

```
No	Mchn	EnNo		Name		Mode	IOMd	DateTime	
000001	1	000000052	Henrique      	1	0	2025/12/01  07:41:00
000002	1	000000097	Thais         	1	0	2025/12/01  07:45:00
000003	1	000000001	Elza Matos    	2	0	2025/12/01  07:47:00
000016	1	000000001	Elza Matos    	2	1	2025/12/01  12:00:00
000017	1	000000052	Henrique      	1	1	2025/12/01  12:00:00
```

**Campos (separados por TAB):**
- `No`: Número sequencial do registro
- `Mchn`: ID da máquina/relógio de ponto
- `EnNo`: ID do funcionário (matrícula)
- `Name`: Nome do funcionário
- `Mode`: Tipo/categoria do funcionário (1, 2, etc.)
- `IOMd`: Modo de entrada/saída (0 = Entrada, 1 = Saída)
- `DateTime`: Data e hora da batida (formato: YYYY/MM/DD HH:MM:SS)

## 🔌 API Endpoints

### Upload
```
POST /api/upload
Content-Type: multipart/form-data
Body: { file: <arquivo.txt> }
```

### Funcionários
```
GET /api/employees              # Listar todos
GET /api/employees/:id          # Obter um funcionário
```

### Jornadas
```
GET /api/workday/:employeeId/:month           # Cartão mensal (YYYY-MM)
POST /api/workday/:employeeId/generate        # Gerar jornadas
PUT /api/workday/:id                          # Editar jornada
GET /api/workday/:id/history                  # Histórico de ajustes
```

### Exportação
```
GET /api/export/pdf/:employeeId/:month        # Download PDF
GET /api/export/excel/:employeeId/:month      # Download Excel
```

## 💾 Modelo de Dados

### Employee (Funcionário)
- `id`, `enNo`, `name`, `mode` (tipo/categoria), `createdAt`, `updatedAt`

### Punch (Batida)
- `id`, `employeeId`, `ioMode`, `dateTime`, `imported`, `createdAt`

### Workday (Jornada Diária)
- `id`, `employeeId`, `date`, `entrada1`, `saida1`, `entrada2`, `saida2`
- `totalMinutes`, `status` (OK/INCOMPLETE/EDITED)

### Adjustment (Ajuste/Histórico)
- `id`, `workdayId`, `field`, `oldValue`, `newValue`, `reason`, `createdBy`

## 🎯 Como Usar

1. **Importar Arquivo**
   - Acesse a página inicial
   - Clique em "Selecionar arquivo" e escolha um arquivo .txt
   - Clique em "Enviar Arquivo"
   - O sistema processará as batidas e criará/atualizará funcionários

2. **Visualizar Cartão de Ponto**
   - Na lista de funcionários, clique em "Ver Cartão"
   - Navegue entre meses usando os botões
   - Visualize todas as jornadas do mês

3. **Editar Horários**
   - No cartão de ponto, clique em "Editar" na linha desejada
   - Altere os horários conforme necessário
   - Clique em "Salvar" para confirmar

4. **Exportar Relatórios**
   - No cartão de ponto, clique em "Exportar PDF" ou "Exportar Excel"
   - O arquivo será baixado automaticamente

## 🔄 Versionamento e Atualizações

### Versões Disponíveis

O projeto segue [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (ex: v1.0.0)
- **MAJOR**: Mudanças incompatíveis
- **MINOR**: Novas funcionalidades (compatíveis)
- **PATCH**: Correções de bugs

**Versão Atual**: v1.3.4

Ver todas as versões: [Releases](https://github.com/code-bynary/pontosweb/releases)

### Instalar Versão Específica

```bash
# Clonar repositório
git clone https://github.com/code-bynary/pontosweb.git
cd pontosweb

# Listar versões disponíveis
git tag -l

# Instalar versão específica (ex: v1.0.0)
git checkout v1.0.0

# Executar instalação
./install-debian.sh
```

### Atualizar Sistema

O sistema inclui script de atualização automática com backup:

```bash
cd ~/pontosweb
./update.sh
```

**O que o script faz:**
1. ✅ Backup automático do sistema (`~/backup/sys`)
2. ✅ Backup automático do banco de dados (`~/backup/db`)
3. ✅ Mantém últimos 5 backups
4. ✅ Atualiza código do GitHub
5. ✅ Instala novas dependências
6. ✅ Executa migrations do banco
7. ✅ Reinicia serviços

### Restaurar Backup

Se algo der errado após atualização:

```bash
cd ~/pontosweb
./restore.sh
```

Menu interativo permite restaurar:
- Sistema (arquivos)
- Banco de dados
- Ambos

### Estratégia de Branches

- `main` - Produção (sempre estável)
- `develop` - Desenvolvimento e testes
- `feature/*` - Novas funcionalidades
- `hotfix/*` - Correções urgentes

### Changelog

#### v1.0.0 (2026-01-08)
- 🎉 Release inicial
- ✅ Sistema completo de controle de ponto
- ✅ Importação de arquivos TXT
- ✅ Geração de jornadas diárias
- ✅ Edição manual com histórico
- ✅ Exportação PDF/Excel
- ✅ Scripts de instalação e atualização
- ✅ Documentação completa

## 🔮 Expansões Futuras

- [ ] Banco de horas (saldo acumulado)
- [ ] Configuração de tolerância de minutos
- [ ] Gestão de escalas e turnos
- [ ] Relatórios de horas extras
- [ ] Dashboard com gráficos
- [ ] Autenticação e autorização
- [ ] Multi-empresa/departamento
- [ ] Notificações de inconsistências
- [ ] App mobile

## 📄 Licença

MIT

## 👨‍💻 Desenvolvimento

Desenvolvido com ❤️ usando Node.js, React e Tailwind CSS

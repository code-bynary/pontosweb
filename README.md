# PontosWeb 🕒

[![Versão](https://img.shields.io/badge/vers%C3%A3o-v1.5.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/status-est%C3%A1vel-green?style=for-the-badge)
![Milestone](https://img.shields.io/badge/milestone-inteligencia-gold?style=for-the-badge)

> [!IMPORTANT]
> **Versão v1.4.0 - Relatórios Gerenciais**: Implementação de relatórios consolidados da empresa, permitindo visão macro de extras, atrasos e saldos de todos os funcionários de uma só vez, além de otimização industrial do PDF A4.

> [!IMPORTANT]
> **Versão 1.3.8 (Milestone)**: O "Divisor de Águas" do projeto. Maturidade total com dashboard estatístico, gestão de abonos, relatórios com assinatura e precisão absoluta nos cálculos.

---

## 🛠️ Tecnologias

- **Backend**: Node.js (Express), Prisma ORM, MySQL/MariaDB.
- **Frontend**: React (Vite), Tailwind CSS, Headless UI.
- **Relatórios**: PDFKit e ExcelJS.
- **Marco**: v1.4.0 - Sistema de Relatórios Gerenciais.

---

### [v1.5.0] - 🧠 Inteligência de Batidas (2026-02-02)
- **Barreira de Dia Calendário**: Refatoração total do motor de cálculos para garantir que batidas fiquem restritas ao seu dia, eliminando o erro de deslocamento em cascata.
- **Deduplicação Protetiva (15 min)**: Filtro inteligente que ignora batidas redundantes em janelas de 15 minutos, evitando duplicidade por esquecimento ou "certeza" do funcionário.
- **Robustez de Pareamento**: Tratamento de batidas órfãs sem afetar a integridade dos dias subsequentes.

### [v1.4.0] - 📊 Relatórios Gerenciais (2026-02-02)
- **Relatórios Gerenciais**: Novo módulo para visão consolidada de todos os funcionários (Extras, Atrasos, Saldo).
- **Exportação Master**: Novo exportador Excel consolidado da empresa por mês.
- **PDF A4 Industrial**: Otimização do layout para folha A4 nativa, garantindo assinatura em página única.
- **Nomes Dinâmicos**: Arquivos de exportação agora utilizam o padrão `Cartao_Ponto_Nome_Mes.pdf`.

### [v1.3.8] - 🏆 Milestone: O Divisor de Águas (2026-02-02)
- **Consolidação**: Esta versão representa a maturidade total do sistema.
- **Dashboard Estatístico**: Novo resumo visual no cartão de ponto com extras, atrasos e abonos detalhados.
- **Relatórios PDF Premium**: Adicionado resumo mensal detalhado e campos para assinatura do colaborador e responsável.
- **Excel Detalhado**: Inclusão de estatísticas e saldo final formatado.
- **Fix Cálculo**: Ajuste na lógica de saldo mensal para considerar abonos e evitar horas extras indevidas.

### [v1.3.6] - Stable Release (2026-02-02)
- **Sistema de Abonos**: Implementação completa para abonar dias com atestados médicos e parciais.
- **Upload de Documentos**: Suporte para anexos de atestados (PDF/Imagens).

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

© 2026 PontosWeb - Versão Estável 1.5.0

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

**Versão Atual**: v1.5.0

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

#### v1.4.0 (2026-02-02)
- ✅ Módulo de Relatórios Gerenciais (Visão Macro)
- ✅ Exportação Excel Consolidada (Empresa)
- ✅ Otimização de PDF para tamanho A4
- ✅ Nomenclatura dinâmica de arquivos exportados

#### v1.3.8 (2026-02-02)
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

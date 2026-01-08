# PontosWeb 🕐

Sistema completo de controle de ponto eletrônico com importação de arquivos TXT, processamento automático de batidas, geração de jornadas diárias e exportação de relatórios.

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

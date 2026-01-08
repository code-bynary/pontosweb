#!/bin/bash

###############################################################################
# PontosWeb - Script de Instalação Automática para Debian 12
# Este script instala todas as dependências, clona o repositório e configura
# o sistema completo (backend + frontend)
###############################################################################

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then 
    print_error "Não execute este script como root. Execute como usuário normal."
    exit 1
fi

print_info "==================================================================="
print_info "  PontosWeb - Instalação Automática para Debian 12"
print_info "==================================================================="
echo ""

# Configurações
INSTALL_DIR="$HOME/pontosweb"
DB_NAME="pontosweb"
DB_USER="pontosweb_user"
DB_PASSWORD="fac93482"   # <<< SENHA FIXA (DEV)
REPO_URL="https://github.com/code-bynary/pontosweb.git"

print_info "Diretório de instalação: $INSTALL_DIR"
echo ""

# Perguntar configurações ao usuário
read -p "Deseja usar o diretório padrão ($INSTALL_DIR)? [Y/n]: " use_default_dir
if [[ $use_default_dir =~ ^[Nn]$ ]]; then
    read -p "Digite o diretório de instalação: " INSTALL_DIR
    INSTALL_DIR="${INSTALL_DIR/#\~/$HOME}"  # Expandir ~
fi

read -p "Nome do banco de dados [$DB_NAME]: " input_db_name
DB_NAME="${input_db_name:-$DB_NAME}"

read -p "Usuário do banco de dados [$DB_USER]: " input_db_user
DB_USER="${input_db_user:-$DB_USER}"

read -sp "Senha do MySQL root (ENTER se usar sudo/unix_socket): " MYSQL_ROOT_PASSWORD
echo ""
echo ""

print_info "Iniciando instalação..."
echo ""

###############################################################################
# 1. Atualizar sistema
###############################################################################
print_info "1/10 - Atualizando sistema..."
sudo apt update
sudo apt upgrade -y
print_success "Sistema atualizado!"
echo ""

###############################################################################
# 2. Instalar dependências básicas
###############################################################################
print_info "2/10 - Instalando dependências básicas..."
sudo apt install -y curl wget git build-essential
print_success "Dependências básicas instaladas!"
echo ""

###############################################################################
# 3. Instalar Node.js 20.x
###############################################################################
print_info "3/10 - Instalando Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "Node.js instalado: $(node --version)"
else
    print_warning "Node.js já está instalado: $(node --version)"
fi
echo ""

###############################################################################
# 4. Instalar MySQL/MariaDB Server
###############################################################################
print_info "4/10 - Instalando MySQL/MariaDB Server..."
if ! command -v mysql &> /dev/null; then
    sudo apt install -y default-mysql-server || sudo apt install -y mariadb-server
    sudo systemctl start mariadb 2>/dev/null || sudo systemctl start mysql
    sudo systemctl enable mariadb 2>/dev/null || sudo systemctl enable mysql
    print_success "Servidor de Banco de Dados instalado!"
else
    print_warning "Servidor de Banco de Dados já está instalado"
fi
echo ""

###############################################################################
# 5. Configurar banco de dados
###############################################################################
print_info "5/10 - Configurando banco de dados..."

SQL_COMMANDS="CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
DROP USER IF EXISTS '$DB_USER'@'localhost';
CREATE USER '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON *.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;"

if sudo mysql -e "SELECT 1" &> /dev/null; then
    print_info "Usando autenticação unix_socket (sudo)..."
    echo "$SQL_COMMANDS" | sudo mysql
elif [ -n "$MYSQL_ROOT_PASSWORD" ]; then
    print_info "Usando autenticação por senha..."
    echo "$SQL_COMMANDS" | mysql -u root -p"$MYSQL_ROOT_PASSWORD"
else
    print_info "Tentando acesso root sem senha..."
    echo "$SQL_COMMANDS" | mysql -u root
fi

print_success "Banco de dados '$DB_NAME' pronto!"
print_success "Usuário '$DB_USER' configurado com senha fixa (DEV)!"
echo ""

###############################################################################
# 6. Clonar repositório
###############################################################################
print_info "6/10 - Clonando repositório..."
if [ -d "$INSTALL_DIR" ]; then
    print_warning "Diretório $INSTALL_DIR já existe. Removendo..."
    rm -rf "$INSTALL_DIR"
fi

git clone "$REPO_URL" "$INSTALL_DIR"
cd "$INSTALL_DIR"
print_success "Repositório clonado!"
echo ""

###############################################################################
# 7. Configurar Backend
###############################################################################
print_info "7/10 - Configurando backend..."
cd "$INSTALL_DIR/backend"

print_info "Instalando dependências do backend..."
npm install

print_info "Criando arquivo .env..."
cat > .env <<EOF
DATABASE_URL="mysql://$DB_USER:$DB_PASSWORD@localhost:3306/$DB_NAME"
PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://localhost:5173
EOF

print_success "Arquivo .env criado!"

print_info "Gerando Prisma Client..."
npm run prisma:generate

print_info "Executando migrations (isso pode levar alguns segundos)..."
npx prisma migrate dev --name init --skip-generate

print_success "Backend configurado!"
echo ""

###############################################################################
# 8. Configurar Frontend
###############################################################################
print_info "8/10 - Configurando frontend..."
cd "$INSTALL_DIR/frontend"

print_info "Instalando dependências do frontend..."
npm install

cat > .env <<EOF
VITE_API_URL=http://localhost:3001/api
EOF

print_success "Frontend configurado!"
echo ""

###############################################################################
# 9. Criar scripts de inicialização
###############################################################################
print_info "9/10 - Criando scripts de inicialização..."
cd "$INSTALL_DIR"

cat > start-backend.sh <<'EOF'
#!/bin/bash
cd "$(dirname "$0")/backend"
echo "Iniciando backend..."
npm run dev
EOF
chmod +x start-backend.sh

cat > start-frontend.sh <<'EOF'
#!/bin/bash
cd "$(dirname "$0")/frontend"
echo "Iniciando frontend..."
npm run dev
EOF
chmod +x start-frontend.sh

cat > start-all.sh <<'EOF'
#!/bin/bash
cd "$(dirname "$0")"

if ! command -v tmux &> /dev/null; then
    echo "Instalando tmux..."
    sudo apt install -y tmux
fi

tmux new-session -d -s pontosweb

tmux rename-window -t pontosweb:0 'Backend'
tmux send-keys -t pontosweb:0 'cd backend && npm run dev' C-m

tmux new-window -t pontosweb:1 -n 'Frontend'
tmux send-keys -t pontosweb:1 'cd frontend && npm run dev' C-m

echo "PontosWeb iniciado em sessão tmux!"
echo "Para acessar: tmux attach -t pontosweb"
echo "Para sair: Ctrl+B, depois D"
echo ""
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo ""

tmux attach -t pontosweb
EOF
chmod +x start-all.sh

cat > stop-all.sh <<'EOF'
#!/bin/bash
echo "Parando PontosWeb..."
tmux kill-session -t pontosweb 2>/dev/null || echo "Sessão tmux não encontrada"
pkill -f "node.*backend" || true
pkill -f "node.*frontend" || true
echo "PontosWeb parado!"
EOF
chmod +x stop-all.sh

print_success "Scripts criados!"
echo ""

###############################################################################
# 10. Criar serviços systemd
###############################################################################
print_info "10/10 - Criando serviços systemd..."

sudo tee /etc/systemd/system/pontosweb-backend.service > /dev/null <<EOF
[Unit]
Description=PontosWeb Backend
After=network.target mysql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR/backend
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo tee /etc/systemd/system/pontosweb-frontend.service > /dev/null <<EOF
[Unit]
Description=PontosWeb Frontend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR/frontend
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload

print_success "Serviços systemd criados!"
echo ""

###############################################################################
# Finalização
###############################################################################
print_success "==================================================================="
print_success "  Instalação Concluída com Sucesso!"
print_success "==================================================================="
echo ""
print_info "Informações do Sistema:"
echo "  - Diretório: $INSTALL_DIR"
echo "  - Banco de dados: $DB_NAME"
echo "  - Usuário DB: $DB_USER"
echo "  - Senha DB (DEV): $DB_PASSWORD"
echo ""
print_info "Para iniciar o sistema:"
echo "  cd $INSTALL_DIR"
echo "  ./start-all.sh"
echo ""
print_info "URLs de acesso:"
echo "  - Backend API: http://localhost:3001"
echo "  - Frontend: http://localhost:5173"
echo "  - Health Check: http://localhost:3001/health"
echo ""
print_warning "ATENÇÃO: senha fixa é apenas para DESENVOLVIMENTO."
echo ""
print_success "Instalação finalizada! 🚀"
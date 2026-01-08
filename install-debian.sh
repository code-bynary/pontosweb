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
DB_PASSWORD=$(openssl rand -base64 12)  # Gera senha aleatória
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

read -sp "Senha do MySQL root: " MYSQL_ROOT_PASSWORD
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
    # Debian 12 usa MariaDB como padrão
    sudo apt install -y default-mysql-server || sudo apt install -y mariadb-server
    
    # Iniciar serviço (pode ser mysql ou mariadb dependendo da instalação)
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

# Criar banco de dados e usuário
mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

print_success "Banco de dados '$DB_NAME' criado!"
print_success "Usuário '$DB_USER' criado!"
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

# Instalar dependências
print_info "Instalando dependências do backend..."
npm install

# Criar arquivo .env
print_info "Criando arquivo .env..."
cat > .env <<EOF
# Database
DATABASE_URL="mysql://$DB_USER:$DB_PASSWORD@localhost:3306/$DB_NAME"

# Server
PORT=3001
NODE_ENV=production

# CORS
CORS_ORIGIN=http://localhost:5173
EOF

print_success "Arquivo .env criado!"

# Gerar Prisma Client
print_info "Gerando Prisma Client..."
npm run prisma:generate

# Executar migrations
print_info "Executando migrations..."
npm run prisma:migrate

print_success "Backend configurado!"
echo ""

###############################################################################
# 8. Configurar Frontend
###############################################################################
print_info "8/10 - Configurando frontend..."
cd "$INSTALL_DIR/frontend"

# Instalar dependências
print_info "Instalando dependências do frontend..."
npm install

# Criar arquivo .env (opcional)
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

# Script para iniciar backend
cat > start-backend.sh <<'EOF'
#!/bin/bash
cd "$(dirname "$0")/backend"
echo "Iniciando backend..."
npm run dev
EOF
chmod +x start-backend.sh

# Script para iniciar frontend
cat > start-frontend.sh <<'EOF'
#!/bin/bash
cd "$(dirname "$0")/frontend"
echo "Iniciando frontend..."
npm run dev
EOF
chmod +x start-frontend.sh

# Script para iniciar ambos (usando tmux)
cat > start-all.sh <<'EOF'
#!/bin/bash
cd "$(dirname "$0")"

# Verificar se tmux está instalado
if ! command -v tmux &> /dev/null; then
    echo "Instalando tmux..."
    sudo apt install -y tmux
fi

# Criar sessão tmux
tmux new-session -d -s pontosweb

# Janela 1: Backend
tmux rename-window -t pontosweb:0 'Backend'
tmux send-keys -t pontosweb:0 'cd backend && npm run dev' C-m

# Janela 2: Frontend
tmux new-window -t pontosweb:1 -n 'Frontend'
tmux send-keys -t pontosweb:1 'cd frontend && npm run dev' C-m

# Anexar à sessão
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

# Script para parar tudo
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
# 10. Criar serviços systemd (opcional)
###############################################################################
print_info "10/10 - Criando serviços systemd..."

# Backend service
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

# Frontend service (para build de produção)
sudo tee /etc/systemd/system/pontosweb-frontend.service > /dev/null <<EOF
[Unit]
Description=PontosWeb Frontend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR/frontend
ExecStart=/usr/bin/npm run dev
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Recarregar systemd
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
echo "  - Senha DB: $DB_PASSWORD"
echo ""
print_info "Para iniciar o sistema:"
echo "  Opção 1 (Desenvolvimento - Recomendado):"
echo "    cd $INSTALL_DIR"
echo "    ./start-all.sh"
echo ""
echo "  Opção 2 (Serviços systemd - Produção):"
echo "    sudo systemctl start pontosweb-backend"
echo "    sudo systemctl start pontosweb-frontend"
echo "    sudo systemctl enable pontosweb-backend  # Iniciar no boot"
echo "    sudo systemctl enable pontosweb-frontend # Iniciar no boot"
echo ""
print_info "URLs de acesso:"
echo "  - Backend API: http://localhost:3001"
echo "  - Frontend: http://localhost:5173"
echo "  - Health Check: http://localhost:3001/health"
echo ""
print_warning "IMPORTANTE: Guarde a senha do banco de dados em local seguro!"
echo "  Senha: $DB_PASSWORD"
echo ""
print_info "Logs:"
echo "  - Backend: journalctl -u pontosweb-backend -f"
echo "  - Frontend: journalctl -u pontosweb-frontend -f"
echo ""
print_success "Instalação finalizada! 🎉"

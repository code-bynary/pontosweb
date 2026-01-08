#!/bin/bash

###############################################################################
# PontosWeb - Script de Atualização com Backup Automático
# Faz backup do sistema e banco de dados antes de atualizar
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

# Verificar se está no diretório correto
if [ ! -f "backend/package.json" ] || [ ! -f "frontend/package.json" ]; then
    print_error "Execute este script do diretório raiz do PontosWeb!"
    print_info "Exemplo: cd ~/pontosweb && ./update.sh"
    exit 1
fi

print_info "==================================================================="
print_info "  PontosWeb - Atualização com Backup Automático"
print_info "==================================================================="
echo ""

# Obter informações do .env
if [ -f "backend/.env" ]; then
    source backend/.env
    DB_URL=$DATABASE_URL
else
    print_error "Arquivo backend/.env não encontrado!"
    exit 1
fi

# Extrair credenciais do DATABASE_URL
# Formato: mysql://user:password@host:port/database
DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Diretórios de backup
BACKUP_ROOT="$HOME/backup"
BACKUP_SYS="$BACKUP_ROOT/sys"
BACKUP_DB="$BACKUP_ROOT/db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

print_info "Configurações:"
echo "  - Banco de dados: $DB_NAME"
echo "  - Backup sistema: $BACKUP_SYS"
echo "  - Backup banco: $BACKUP_DB"
echo ""

# Perguntar se deseja fazer backup
read -p "Deseja fazer backup antes de atualizar? [Y/n]: " do_backup
do_backup=${do_backup:-Y}

if [[ $do_backup =~ ^[Yy]$ ]]; then
    ###########################################################################
    # BACKUP DO SISTEMA
    ###########################################################################
    print_info "1/6 - Criando backup do sistema..."
    
    # Criar diretórios de backup
    mkdir -p "$BACKUP_SYS"
    mkdir -p "$BACKUP_DB"
    
    # Nome do arquivo de backup
    BACKUP_SYS_FILE="$BACKUP_SYS/pontosweb_sys_$TIMESTAMP.tar.gz"
    
    # Fazer backup (excluindo node_modules e .git)
    print_info "Compactando arquivos do sistema..."
    tar -czf "$BACKUP_SYS_FILE" \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='dist' \
        --exclude='build' \
        backend/ frontend/ *.sh *.md .gitignore 2>/dev/null || true
    
    print_success "Backup do sistema criado: $BACKUP_SYS_FILE"
    
    ###########################################################################
    # BACKUP DO BANCO DE DADOS
    ###########################################################################
    print_info "2/6 - Criando backup do banco de dados..."
    
    BACKUP_DB_FILE="$BACKUP_DB/pontosweb_db_$TIMESTAMP.sql"
    
    # Fazer dump do banco
    mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_DB_FILE" 2>/dev/null
    
    # Comprimir backup
    gzip "$BACKUP_DB_FILE"
    
    print_success "Backup do banco criado: ${BACKUP_DB_FILE}.gz"
    
    # Mostrar tamanho dos backups
    SYS_SIZE=$(du -h "$BACKUP_SYS_FILE" | cut -f1)
    DB_SIZE=$(du -h "${BACKUP_DB_FILE}.gz" | cut -f1)
    
    echo ""
    print_info "Tamanho dos backups:"
    echo "  - Sistema: $SYS_SIZE"
    echo "  - Banco de dados: $DB_SIZE"
    echo ""
    
    # Limpar backups antigos (manter últimos 5)
    print_info "Limpando backups antigos (mantendo últimos 5)..."
    (cd "$BACKUP_SYS" && ls -t pontosweb_sys_*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true)
    (cd "$BACKUP_DB" && ls -t pontosweb_db_*.sql.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true)
    
    print_success "Backups concluídos!"
    echo ""
else
    print_warning "Pulando backup..."
    echo ""
fi

###############################################################################
# PARAR SERVIÇOS
###############################################################################
print_info "3/6 - Parando serviços..."

# Verificar se serviços existem
if systemctl is-active --quiet pontosweb-backend; then
    sudo systemctl stop pontosweb-backend
    print_success "Backend parado"
fi

if systemctl is-active --quiet pontosweb-frontend; then
    sudo systemctl stop pontosweb-frontend
    print_success "Frontend parado"
fi

# Ou matar processos se estiver rodando em desenvolvimento ou travado
print_info "Limpando portas e processos antigos..."
sudo fuser -k 3001/tcp 2>/dev/null || true
sudo fuser -k 5173/tcp 2>/dev/null || true
pkill -f "node.*backend" 2>/dev/null || true
pkill -f "node.*frontend" 2>/dev/null || true

echo ""

###############################################################################
# ATUALIZAR CÓDIGO
###############################################################################
print_info "4/6 - Atualizando código do GitHub..."

# Tentar voltar para a branch main se estiver em uma tag ou branch errada
git checkout main 2>/dev/null || print_warning "Não foi possível mudar para branch main automaticamente."

# Salvar mudanças locais (se houver)
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Há mudanças locais. Salvando em stash..."
    git stash
fi

# Puxar atualizações
git pull origin main

print_success "Código atualizado!"
echo ""

###############################################################################
# ATUALIZAR BACKEND
###############################################################################
print_info "5/6 - Atualizando backend..."

cd backend

# Instalar/atualizar dependências
print_info "Instalando dependências..."
npm install

# Gerar Prisma Client
print_info "Gerando Prisma Client..."
npx prisma generate

# Executar migrations de forma não interativa
print_info "Executando migrations do banco (isso pode levar alguns segundos)..."
# Usamos npx diretamente para garantir as flags corretas
npx prisma migrate dev --name update --skip-generate

cd ..

print_success "Backend atualizado!"
echo ""

###############################################################################
# ATUALIZAR FRONTEND
###############################################################################
print_info "6/6 - Atualizando frontend..."

cd frontend

# Instalar/atualizar dependências
print_info "Instalando dependências..."
npm install

cd ..

print_success "Frontend atualizado!"
echo ""

###############################################################################
# REINICIAR SERVIÇOS
###############################################################################
print_info "Reiniciando serviços..."

if systemctl list-unit-files | grep -q pontosweb-backend; then
    sudo systemctl start pontosweb-backend
    sudo systemctl start pontosweb-frontend
    
    # Verificar status
    sleep 2
    if systemctl is-active --quiet pontosweb-backend; then
        print_success "Backend iniciado"
    else
        print_error "Erro ao iniciar backend. Verifique: journalctl -u pontosweb-backend -n 50"
    fi
    
    if systemctl is-active --quiet pontosweb-frontend; then
        print_success "Frontend iniciado"
    else
        print_error "Erro ao iniciar frontend. Verifique: journalctl -u pontosweb-frontend -n 50"
    fi
else
    print_warning "Serviços systemd não encontrados."
    print_info "Inicie manualmente com: ./start-all.sh"
fi

echo ""

###############################################################################
# VERIFICAR SAÚDE DO SISTEMA
###############################################################################
print_info "Verificando saúde do sistema..."

sleep 3

# Testar API
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    print_success "API respondendo corretamente!"
else
    print_warning "API não está respondendo. Verifique os logs."
fi

echo ""

###############################################################################
# FINALIZAÇÃO
###############################################################################
print_success "==================================================================="
print_success "  Atualização Concluída!"
print_success "==================================================================="
echo ""

if [[ $do_backup =~ ^[Yy]$ ]]; then
    print_info "Backups criados em:"
    echo "  - Sistema: $BACKUP_SYS_FILE"
    echo "  - Banco: ${BACKUP_DB_FILE}.gz"
    echo ""
fi

print_info "URLs de acesso:"
echo "  - Frontend: http://localhost:5173"
echo "  - Backend: http://localhost:3001"
echo "  - Health: http://localhost:3001/health"
echo ""

print_info "Comandos úteis:"
echo "  - Ver logs backend: journalctl -u pontosweb-backend -f"
echo "  - Ver logs frontend: journalctl -u pontosweb-frontend -f"
echo "  - Restaurar backup: ./restore.sh"
echo ""

print_success "Sistema atualizado com sucesso! 🎉"

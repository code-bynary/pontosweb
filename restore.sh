#!/bin/bash

###############################################################################
# PontosWeb - Script de Restauração de Backup
# Restaura sistema e/ou banco de dados a partir de backups
###############################################################################

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_info "==================================================================="
print_info "  PontosWeb - Restauração de Backup"
print_info "==================================================================="
echo ""

# Diretórios de backup
BACKUP_ROOT="$HOME/backup"
BACKUP_SYS="$BACKUP_ROOT/sys"
BACKUP_DB="$BACKUP_ROOT/db"

# Verificar se existem backups
if [ ! -d "$BACKUP_SYS" ] && [ ! -d "$BACKUP_DB" ]; then
    print_error "Nenhum backup encontrado em $BACKUP_ROOT"
    exit 1
fi

# Listar backups disponíveis
echo "Backups disponíveis:"
echo ""

if [ -d "$BACKUP_SYS" ] && [ "$(ls -A $BACKUP_SYS)" ]; then
    print_info "Backups do Sistema:"
    ls -lh "$BACKUP_SYS"/*.tar.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
    echo ""
fi

if [ -d "$BACKUP_DB" ] && [ "$(ls -A $BACKUP_DB)" ]; then
    print_info "Backups do Banco de Dados:"
    ls -lh "$BACKUP_DB"/*.sql.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
    echo ""
fi

# Menu de opções
echo "O que deseja restaurar?"
echo "  1) Sistema (arquivos)"
echo "  2) Banco de dados"
echo "  3) Ambos"
echo "  4) Cancelar"
echo ""
read -p "Escolha uma opção [1-4]: " option

case $option in
    1)
        restore_system=true
        restore_db=false
        ;;
    2)
        restore_system=false
        restore_db=true
        ;;
    3)
        restore_system=true
        restore_db=true
        ;;
    4)
        print_info "Operação cancelada."
        exit 0
        ;;
    *)
        print_error "Opção inválida!"
        exit 1
        ;;
esac

###############################################################################
# RESTAURAR SISTEMA
###############################################################################
if [ "$restore_system" = true ]; then
    print_warning "ATENÇÃO: Isso irá sobrescrever os arquivos atuais!"
    read -p "Tem certeza? [y/N]: " confirm
    
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        print_info "Restauração do sistema cancelada."
    else
        # Listar backups e escolher
        backups=($(ls -t "$BACKUP_SYS"/*.tar.gz 2>/dev/null))
        
        if [ ${#backups[@]} -eq 0 ]; then
            print_error "Nenhum backup de sistema encontrado!"
        else
            echo ""
            print_info "Selecione o backup:"
            for i in "${!backups[@]}"; do
                echo "  $((i+1))) $(basename ${backups[$i]})"
            done
            echo ""
            read -p "Escolha [1-${#backups[@]}]: " backup_choice
            
            selected_backup="${backups[$((backup_choice-1))]}"
            
            if [ -f "$selected_backup" ]; then
                print_info "Parando serviços..."
                sudo systemctl stop pontosweb-backend 2>/dev/null || true
                sudo systemctl stop pontosweb-frontend 2>/dev/null || true
                
                print_info "Restaurando sistema de: $(basename $selected_backup)"
                tar -xzf "$selected_backup" -C ~/pontosweb/
                
                print_success "Sistema restaurado!"
            else
                print_error "Backup inválido!"
            fi
        fi
    fi
fi

###############################################################################
# RESTAURAR BANCO DE DADOS
###############################################################################
if [ "$restore_db" = true ]; then
    print_warning "ATENÇÃO: Isso irá sobrescrever o banco de dados atual!"
    read -p "Tem certeza? [y/N]: " confirm
    
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        print_info "Restauração do banco cancelada."
    else
        # Obter credenciais do .env
        if [ -f "backend/.env" ]; then
            source backend/.env
            DB_URL=$DATABASE_URL
            DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
            DB_PASS=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
            DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
        else
            print_error "Arquivo backend/.env não encontrado!"
            exit 1
        fi
        
        # Listar backups e escolher
        backups=($(ls -t "$BACKUP_DB"/*.sql.gz 2>/dev/null))
        
        if [ ${#backups[@]} -eq 0 ]; then
            print_error "Nenhum backup de banco encontrado!"
        else
            echo ""
            print_info "Selecione o backup:"
            for i in "${!backups[@]}"; do
                echo "  $((i+1))) $(basename ${backups[$i]})"
            done
            echo ""
            read -p "Escolha [1-${#backups[@]}]: " backup_choice
            
            selected_backup="${backups[$((backup_choice-1))]}"
            
            if [ -f "$selected_backup" ]; then
                print_info "Restaurando banco de: $(basename $selected_backup)"
                
                # Descompactar e restaurar
                gunzip -c "$selected_backup" | mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME"
                
                print_success "Banco de dados restaurado!"
            else
                print_error "Backup inválido!"
            fi
        fi
    fi
fi

###############################################################################
# REINICIAR SERVIÇOS
###############################################################################
if [ "$restore_system" = true ] || [ "$restore_db" = true ]; then
    print_info "Reiniciando serviços..."
    sudo systemctl start pontosweb-backend 2>/dev/null || true
    sudo systemctl start pontosweb-frontend 2>/dev/null || true
    
    sleep 2
    
    if systemctl is-active --quiet pontosweb-backend; then
        print_success "Backend iniciado"
    fi
    
    if systemctl is-active --quiet pontosweb-frontend; then
        print_success "Frontend iniciado"
    fi
fi

echo ""
print_success "Restauração concluída! 🎉"

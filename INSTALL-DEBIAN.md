# Instalação no Debian 12

Guia completo para instalação do PontosWeb em servidor Debian 12.

## Instalação Automática (Recomendado)

### 1. Download do Script

```bash
# Última versão (main branch)
wget https://raw.githubusercontent.com/code-bynary/pontosweb/main/install-debian.sh
chmod +x install-debian.sh
```

**Ou instalar versão específica:**

```bash
# Clonar repositório
git clone https://github.com/code-bynary/pontosweb.git
cd pontosweb

# Ver versões disponíveis
git tag -l

# Selecionar versão (ex: v1.0.0)
git checkout v1.0.0

# Executar instalação
chmod +x install-debian.sh
./install-debian.sh
```

### 2. Executar Instalação

```bash
./install-debian.sh
```

O script irá:
- ✅ Atualizar o sistema
- ✅ Instalar Node.js 20.x
- ✅ Instalar MySQL Server
- ✅ Criar banco de dados e usuário
- ✅ Clonar o repositório
- ✅ Instalar dependências (backend + frontend)
- ✅ Configurar arquivos .env
- ✅ Executar migrations do Prisma
- ✅ Criar scripts de inicialização
- ✅ Configurar serviços systemd

### 3. Iniciar o Sistema

**Opção A - Modo Desenvolvimento (tmux):**
```bash
cd ~/pontosweb
./start-all.sh
```

**Opção B - Modo Produção (systemd):**
```bash
sudo systemctl start pontosweb-backend
sudo systemctl start pontosweb-frontend

# Habilitar inicialização automática
sudo systemctl enable pontosweb-backend
sudo systemctl enable pontosweb-frontend
```

### 4. Acessar o Sistema

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## Instalação Manual

Se preferir instalar manualmente:

### 1. Instalar Dependências

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências básicas
sudo apt install -y curl wget git build-essential

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MySQL/MariaDB
sudo apt install -y default-mysql-server
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

### 2. Configurar MySQL

```bash
sudo mysql
```

```sql
CREATE DATABASE pontosweb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'pontosweb_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON pontosweb.* TO 'pontosweb_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Clonar Repositório

```bash
cd ~
git clone https://github.com/code-bynary/pontosweb.git
cd pontosweb
```

### 4. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
cat > .env <<EOF
DATABASE_URL="mysql://pontosweb_user:sua_senha_segura@localhost:3306/pontosweb"
PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://localhost:5173
EOF

# Gerar Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate
```

### 5. Configurar Frontend

```bash
cd ../frontend

# Instalar dependências
npm install

# Criar arquivo .env (opcional)
cat > .env <<EOF
VITE_API_URL=http://localhost:3001/api
EOF
```

### 6. Iniciar Serviços

**Terminal 1 - Backend:**
```bash
cd ~/pontosweb/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd ~/pontosweb/frontend
npm run dev
```

## Configuração de Produção

### Nginx como Reverse Proxy

```bash
sudo apt install -y nginx
```

Criar configuração:

```bash
sudo nano /etc/nginx/sites-available/pontosweb
```

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar configuração:

```bash
sudo ln -s /etc/nginx/sites-available/pontosweb /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Build de Produção

**Frontend:**
```bash
cd ~/pontosweb/frontend
npm run build
```

Servir com nginx ou outro servidor web estático.

## Comandos Úteis

### Gerenciar Serviços

```bash
# Iniciar
sudo systemctl start pontosweb-backend
sudo systemctl start pontosweb-frontend

# Parar
sudo systemctl stop pontosweb-backend
sudo systemctl stop pontosweb-frontend

# Reiniciar
sudo systemctl restart pontosweb-backend
sudo systemctl restart pontosweb-frontend

# Status
sudo systemctl status pontosweb-backend
sudo systemctl status pontosweb-frontend

# Ver logs
journalctl -u pontosweb-backend -f
journalctl -u pontosweb-frontend -f
```

### Atualizar Sistema

```bash
cd ~/pontosweb
git pull origin main

# Backend
cd backend
npm install
npm run prisma:migrate
sudo systemctl restart pontosweb-backend

# Frontend
cd ../frontend
npm install
sudo systemctl restart pontosweb-frontend
```

### Backup do Banco de Dados

```bash
mysqldump -u pontosweb_user -p pontosweb > backup-$(date +%Y%m%d).sql
```

### Restaurar Backup

```bash
mysql -u pontosweb_user -p pontosweb < backup-20260108.sql
```

## Troubleshooting

### Erro de Conexão com MySQL

```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Testar conexão
mysql -u pontosweb_user -p pontosweb
```

### Porta já em uso

```bash
# Verificar processos na porta 3001
sudo lsof -i :3001

# Matar processo
sudo kill -9 <PID>
```

### Logs de erro

```bash
# Backend
journalctl -u pontosweb-backend --since "1 hour ago"

# Frontend
journalctl -u pontosweb-frontend --since "1 hour ago"
```

## Segurança

### Firewall

```bash
# Permitir apenas portas necessárias
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### SSL/HTTPS com Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

## Suporte

Para problemas ou dúvidas, abra uma issue no GitHub:
https://github.com/code-bynary/pontosweb/issues

#!/bin/bash
# StableLobster Deployment Script for Bluehost/Ubuntu
# Run this on your server after uploading files

set -e

echo "╭──────────────────────────────────────────╮"
echo "│    StableLobster Deployment Setup         │"
echo "╰──────────────────────────────────────────╯"

# Configuration
APP_NAME="stablelobster"
APP_DIR="/var/www/$APP_NAME"
NODE_VERSION="18"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    log_error "Please run as root (sudo)"
    exit 1
fi

# Step 1: Install Node.js if not present
if ! command -v node &> /dev/null; then
    log_info "Installing Node.js $NODE_VERSION..."
    curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | sudo -E bash -
    apt-get install -y nodejs
fi

# Step 2: Create app directory
log_info "Creating application directory..."
mkdir -p $APP_DIR/data
mkdir -p /etc/nginx/sites-available
mkdir -p /etc/nginx/sites-enabled

# Step 3: Copy files (assuming files uploaded to /tmp/stablelobster)
if [ -d "/tmp/$APP_NAME" ]; then
    log_info "Copying application files..."
    cp -r /tmp/$APP_NAME/* $APP_DIR/
else
    log_warn "No files found in /tmp/$APP_NAME. Files should be uploaded first."
fi

cd $APP_DIR

# Step 4: Install dependencies
log_info "Installing Node.js dependencies..."
npm ci --production

# Step 5: Build frontend
log_info "Building frontend..."
npm run build

# Step 6: Configure environment
if [ ! -f ".env" ]; then
    log_info "Creating .env file..."
    cp .env.example .env
    log_warn "Please edit $APP_DIR/.env and set your production values:"
    log_warn "  - INSTALL_ID_SALT (random 32-char hex string)"
    log_warn "  - ADMIN_PASSWORD_HASH (sha256 hash of your admin password)"
    log_warn "  - GITHUB_TOKEN (optional, for release scraping)"
fi

# Step 7: Install PM2 for process management (recommended for Bluehost)
if ! command -v pm2 &> /dev/null; then
    log_info "Installing PM2..."
    npm install -g pm2
fi

# Step 8: Start application with PM2
log_info "Starting application with PM2..."
pm2 start server.js --name $APP_NAME
pm2 save
pm2 startup

# Step 9: Setup Nginx (optional, for custom domain)
if [ -f "deploy/nginx.conf" ]; then
    log_info "Configuring Nginx..."
    cp deploy/nginx.conf /etc/nginx/sites-available/$APP_NAME
    ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    nginx -t && service nginx reload
    log_info "Nginx configured. Don't forget to setup SSL with Let's Encrypt!"
fi

# Step 10: Setup systemd service (alternative to PM2)
if [ -f "deploy/stablelobster.service" ]; then
    log_info "Installing systemd service..."
    cp deploy/stablelobster.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable $APP_NAME
    log_info "Systemd service installed. Use 'systemctl start $APP_NAME' to start."
fi

echo ""
echo "╭──────────────────────────────────────────╮"
echo "│         Deployment Complete!              │"
echo "╰──────────────────────────────────────────╯"
echo ""
echo "Next steps:"
echo "1. Edit $APP_DIR/.env with your production secrets"
echo "2. Restart: pm2 restart $APP_NAME"
echo "3. Check logs: pm2 logs $APP_NAME"
echo "4. Setup SSL: certbot --nginx -d stablelobster.com"
echo ""
echo "Access your app at: http://your-server-ip:3000"
echo ""

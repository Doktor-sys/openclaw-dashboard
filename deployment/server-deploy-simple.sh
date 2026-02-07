#!/bin/bash

# ============================================================================
# OpenClaw Server Deployment Script (Port 3000 & 3002)
# Server: 35.195.246.45
# ============================================================================

set -e

# Configuration
REPO_URL="https://github.com/Doktor-sys/openclaw.git"
PROJECT_DIR="/opt/openclaw"
FRONTEND_PORT=3000
BACKEND_PORT=3002

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }

# ============================================================================
check_prerequisites() {
    log_step "Prüfe Voraussetzungen..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker ist nicht installiert!"
        exit 1
    fi
    
    log_info "Docker: $(docker --version)"
    log_info "Voraussetzungen erfüllt!"
}

# ============================================================================
setup_repository() {
    log_step "Richte Repository ein..."
    
    if [ -d "$PROJECT_DIR/.git" ]; then
        log_info "Repository existiert bereits - Update..."
        cd "$PROJECT_DIR"
        git pull origin main
    else
        log_info "Klone Repository..."
        mkdir -p $(dirname "$PROJECT_DIR")
        git clone "$REPO_URL" "$PROJECT_DIR"
        cd "$PROJECT_DIR"
    fi
    
    chmod +x deploy.sh deploy.bat deployment/*.sh 2>/dev/null || true
    
    log_info "Repository eingerichtet!"
}

# ============================================================================
configure_environment() {
    log_step "Konfiguriere Environment..."
    
    cd "$PROJECT_DIR"
    
    if [ ! -f ".env" ]; then
        log_info "Erstelle .env aus Template..."
        cp deployment/.env.production .env
    fi
    
    log_warn "BITTE .env BEARBEITEN: nano .env"
    log_warn "JWT_SECRET muss geändert werden!"
    
    read -p "Möchtest du die .env bearbeiten? (j/n): " answer
    if [ "$answer" = "j" ] || [ "$answer" = "J" ]; then
        nano .env
    fi
    
    log_info "Environment konfiguriert!"
}

# ============================================================================
stop_containers() {
    log_step "Stoppe existierende Container..."
    
    cd "$PROJECT_DIR"
    docker compose -f deployment/docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
    
    log_info "Container gestoppt!"
}

# ============================================================================
build_images() {
    log_step "Baue Docker Images..."
    
    cd "$PROJECT_DIR"
    docker compose -f deployment/docker-compose.prod.yml build --no-cache
    
    log_info "Images gebaut!"
}

# ============================================================================
start_containers() {
    log_step "Starte Container..."
    
    cd "$PROJECT_DIR"
    docker compose -f deployment/docker-compose.prod.yml up -d
    
    log_info "Container gestartet!"
}

# ============================================================================
wait_for_services() {
    log_step "Warte auf Services..."
    
    log_info "Prüfe Backend Health..."
    for i in {1..30}; do
        if curl -sf http://localhost:${BACKEND_PORT}/health > /dev/null 2>&1; then
            log_info "Backend ist gesund!"
            break
        fi
        echo -n "."
        sleep 2
    done
    echo ""
}

# ============================================================================
verify_deployment() {
    log_step "Verifiziere Deployment..."
    
    echo ""
    echo "======================================"
    echo -e "${GREEN}✅ Deployment abgeschlossen!${NC}"
    echo "======================================"
    echo ""
    
    echo "📊 Container Status:"
    docker compose -f deployment/docker-compose.prod.yml ps
    
    echo ""
    echo "🌐 Zugriffspunkte:"
    echo "   Frontend: http://35.195.246.45:${FRONTEND_PORT}"
    echo "   Backend:  http://35.195.246.45:${BACKEND_PORT}"
    echo "   Health:   http://35.195.246.45:${BACKEND_PORT}/health"
    
    echo ""
    echo "📝 Nützliche Befehle:"
    echo "   Logs:     docker compose -f deployment/docker-compose.prod.yml logs -f"
    echo "   Restart: docker compose -f deployment/docker-compose.prod.yml restart"
    echo "   Update:  cd $PROJECT_DIR && git pull && docker compose -f deployment/docker-compose.prod.yml down && docker compose -f deployment/docker-compose.prod.yml up -d"
}

# ============================================================================
main() {
    echo ""
    echo "=============================================="
    echo -e "${GREEN}🚀 OpenClaw Server Deployment${NC}"
    echo "=============================================="
    echo "Frontend: http://35.195.246.45:${FRONTEND_PORT}"
    echo "Backend:  http://35.195.246.45:${BACKEND_PORT}"
    echo "=============================================="
    echo ""
    
    check_prerequisites
    setup_repository
    configure_environment
    stop_containers
    build_images
    start_containers
    wait_for_services
    verify_deployment
}

case "${1:-deploy}" in
    deploy)
        main
        ;;
    build)
        build_images
        ;;
    start)
        start_containers
        ;;
    stop)
        stop_containers
        ;;
    restart)
        stop_containers
        start_containers
        ;;
    update)
        setup_repository
        stop_containers
        build_images
        start_containers
        ;;
    *)
        echo "Usage: $0 [deploy|build|start|stop|restart|update]"
        exit 1
        ;;
esac

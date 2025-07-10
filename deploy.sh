#!/bin/bash

echo "🚀 Deploying REACTI Backend..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está corriendo${NC}"
    exit 1
fi

# Verificar archivo .env
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}⚠️  Archivo backend/.env no encontrado${NC}"
    echo "Creando .env.example..."
    cp backend/.env.example backend/.env 2>/dev/null || echo "Por favor configura backend/.env"
fi

# Stop y remove containers existentes
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down

# Build y start containers
echo -e "${YELLOW}🔨 Building and starting containers...${NC}"
docker-compose up --build -d

# Verificar que esté corriendo
echo -e "${YELLOW}🔍 Checking container status...${NC}"
sleep 5
docker-compose ps

# Health check
echo -e "${YELLOW}🏥 Health check...${NC}"
sleep 10
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running successfully!${NC}"
    echo -e "${GREEN}🌐 Backend available at: http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    echo -e "${YELLOW}📋 Showing logs:${NC}"
    docker-compose logs backend
fi

echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo -e "${YELLOW}💡 Useful commands:${NC}"
echo "  View logs: docker-compose logs -f backend"
echo "  Stop: docker-compose down"
echo "  Restart: docker-compose restart backend"
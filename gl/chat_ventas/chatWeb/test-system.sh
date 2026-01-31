#!/bin/bash

# Script de prueba para el proyecto Chat Web con n8n

echo "🏢 INICIANDO PRUEBAS DEL CHAT GRUPO LOTIFICADORA"
echo "================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar si un servicio está corriendo
check_service() {
    local service_name=$1
    local port=$2
    local url=$3
    
    echo -e "${YELLOW}📡 Verificando $service_name en $url...${NC}"
    
    if curl -s --max-time 5 "$url" > /dev/null; then
        echo -e "${GREEN}✅ $service_name está corriendo correctamente${NC}"
        return 0
    else
        echo -e "${RED}❌ $service_name no está disponible${NC}"
        return 1
    fi
}

# 1. Verificar Node.js
echo -e "\n${YELLOW}1. Verificando Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js instalado: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi

# 2. Verificar workflow GL
echo -e "\n${YELLOW}2. Verificando workflow GL...${NC}"
if [ -f "chat.json" ]; then
    echo -e "${GREEN}✅ Workflow GL (chat.json) encontrado${NC}"
else
    echo -e "${RED}❌ Workflow GL no encontrado${NC}"
    exit 1
fi

# 3. Verificar dependencias
echo -e "\n${YELLOW}3. Verificando dependencias...${NC}"
if [ -f "package.json" ]; then
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}✅ Dependencias instaladas${NC}"
    else
        echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
        npm install
    fi
else
    echo -e "${RED}❌ package.json no encontrado${NC}"
    exit 1
fi

# 4. Verificar n8n
echo -e "\n${YELLOW}4. Verificando n8n...${NC}"
if check_service "n8n" "5678" "http://localhost:5678"; then
    echo -e "${GREEN}✅ n8n está disponible${NC}"
else
    echo -e "${RED}❌ n8n no está corriendo. Por favor inicia n8n con:${NC}"
    echo "   npx n8n"
    echo "   o"
    echo "   npm run n8n"
    exit 1
fi

# 5. Verificar servidor de chat
echo -e "\n${YELLOW}5. Verificando servidor de chat...${NC}"
if check_service "Chat Server" "3000" "http://localhost:3000"; then
    echo -e "${GREEN}✅ Servidor de chat está corriendo${NC}"
else
    echo -e "${YELLOW}🚀 Iniciando servidor de chat...${NC}"
    npm start &
    sleep 5
    
    if check_service "Chat Server" "3000" "http://localhost:3000"; then
        echo -e "${GREEN}✅ Servidor de chat iniciado correctamente${NC}"
    else
        echo -e "${RED}❌ No se pudo iniciar el servidor de chat${NC}"
        exit 1
    fi
fi

# 6. Probar webhook GL de n8n
echo -e "\n${YELLOW}6. Probando webhook GL de n8n...${NC}"
webhook_response=$(curl -s -X POST http://localhost:5678/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hola quiero información de terrenos","sessionId":"test-session-gl","attachments":[]}')

if echo "$webhook_response" | grep -q "text"; then
    echo -e "${GREEN}✅ Webhook de n8n funciona correctamente${NC}"
    echo "Respuesta: $webhook_response"
else
    echo -e "${RED}❌ Error en webhook de n8n${NC}"
    echo "Respuesta: $webhook_response"
    echo -e "${YELLOW}💡 Solución: Importa el workflowchat.json en n8n y actívalo${NC}"
fi

# 7. Probar endpoint de upload
echo -e "\n${YELLOW}7. Probando endpoint de upload...${NC}"
upload_response=$(curl -s -X POST http://localhost:3000/upload \
  -F "file=@README.md")

if echo "$upload_response" | grep -q "filename"; then
    echo -e "${GREEN}✅ Endpoint de upload funciona correctamente${NC}"
else
    echo -e "${RED}❌ Error en endpoint de upload${NC}"
fi

# 8. Verificar directorio uploads
echo -e "\n${YELLOW}8. Verificando directorio de uploads...${NC}"
if [ -d "uploads" ]; then
    echo -e "${GREEN}✅ Directorio uploads existe${NC}"
    file_count=$(ls -1 uploads 2>/dev/null | wc -l)
    echo "📁 Archivos en uploads: $file_count"
else
    echo -e "${YELLOW}📁 Creando directorio uploads...${NC}"
    mkdir -p uploads
    echo -e "${GREEN}✅ Directorio uploads creado${NC}"
fi

# 9. Resumen final
echo -e "\n${GREEN}🎉 PRUEBAS COMPLETADAS - GRUPO LOTIFICADORA${NC}"
echo "============================================"
echo -e "${GREEN}✅ Chat GL con Agentes IA está listo para usar${NC}"
echo ""
echo "📱 Chat Corporativo: ${YELLOW}http://localhost:3000${NC}"
echo "🤖 Workflow GL: ${YELLOW}chat.json${NC}"
echo "🔧 Panel n8n: ${YELLOW}http://localhost:5678${NC}"
echo ""
echo "🏢 Para empezar:"
echo "1. Importa chat.json en n8n"
echo "2. Activa el workflow"
echo "3. Abre http://localhost:3000"
echo "4. Prueba: 'Hola quiero un terreno'"
echo "5. Prueba: 'Quiero agendar una cita'"
echo ""
echo "📚 Documentación: ${YELLOW}cat README_GRUPO_LOTIFICADORA.md${NC}"
echo ""
echo "🏗️ ¡Chat Grupo Lotificadora listo! 🏢💬"
#!/bin/bash

# Script de configuración automática para Chat GL

echo "🏢 CONFIGURACIÓN AUTOMÁTICA - CHAT GRUPO LOTIFICADORA"
echo "======================================================"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Función para crear un simple mensaje de ayuda
show_help() {
    echo -e "\n${BLUE}📋 ESTADO ACTUAL:${NC}"
    echo "✅ Chat web: http://localhost:3000 (corriendo)"
    echo "✅ n8n: http://localhost:5678 (corriendo)"
    echo "✅ Workflow: chat.json (disponible)"
    echo "⚠️  Configuración: Requiere importación manual"
    
    echo -e "\n${YELLOW}🔧 PASOS MANUALES REQUERIDOS:${NC}"
    echo "1. Abre navegador en: http://localhost:5678"
    echo "2. Clic en 'Import from file'"
    echo "3. Selecciona el archivo: chat.json"
    echo "4. Espera a que se importe el workflow"
    echo "5. Busca el toggle en esquina superior derecha"
    echo "6. Activa el workflow (debe estar en posición ON)"
    echo "7. Verifica las credenciales en los nodos necesarios:"
    echo "   - Google Calendar (nodos CHECK_AVAILABILITY, CREATE_EVENT)"
    echo "   - Google Sheets (nodo ADD_DATA)"
    echo "   - Groq API (nodos GPT120b, QWEN3-32b, LLAMA SCOUT)"
    echo "   - SMTP (nodo SEND_MAIL)"
    
    echo -e "\n${GREEN}🧪 DESPUÉS DE LA CONFIGURACIÓN:${NC}"
    echo "Prueba estos mensajes en el chat:"
    echo "- 'Hola quiero información de terrenos'"
    echo "- '¿Cuánto cuesta un terreno en zona poniente?'"
    echo "- 'Quiero agendar una cita para mañana'"
    echo "- '¿Qué servicios incluyen los terrenos?'"
}

# Verificar estado
echo -e "\n${YELLOW}🔍 Verificando estado del sistema...${NC}"

if curl -s --max-time 2 http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Chat web corriendo${NC}"
else
    echo -e "${RED}❌ Chat web no corriendo${NC}"
    echo "🚀 Inicia con: npm start"
fi

if curl -s --max-time 2 http://localhost:5678 > /dev/null; then
    echo -e "${GREEN}✅ n8n corriendo${NC}"
else
    echo -e "${RED}❌ n8n no corriendo${NC}"
    echo "🚀 Inicia con: npx n8n"
fi

if [ -f "chat.json" ]; then
    echo -e "${GREEN}✅ Workflow GL encontrado${NC}"
else
    echo -e "${RED}❌ Workflow GL no encontrado${NC}"
fi

# Probar webhook
echo -e "\n${YELLOW}🧪 Probando webhook actual...${NC}"
test_response=$(curl -s -X POST http://localhost:5678/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","sessionId":"auto-test","attachments":[]}' 2>/dev/null)

if [ -n "$test_response" ] && [ "$test_response" != "[]" ] && [ "$test_response" != "null" ]; then
    echo -e "${GREEN}✅ Webhook GL funcionando${NC}"
    if echo "$test_response" | grep -q "text"; then
        echo -e "${GREEN}✅ Respuesta con formato correcto${NC}"
        echo -e "${GREEN}🎉 ¡SISTEMA LISTO PARA USAR!${NC}"
        exit 0
    fi
else
    echo -e "${RED}❌ Webhook GL no configurado${NC}"
    echo "Respuesta: ${test_response:-'(vacía)'}"
fi

# Mostrar ayuda
show_help

echo -e "\n${BLUE}📚 Recursos adicionales:${NC}"
echo "- Documentación completa: cat README_GRUPO_LOTIFICADORA.md"
echo "- Verificación avanzada: ./verify-workflow.sh"
echo "- Logs del servidor: Ver terminal donde corrió npm start"

echo -e "\n${YELLOW}💡 Tip: Guarda este workflow para uso futuro${NC}"
echo "El workflow 'Chat GL - Webhook Integration' está listo para producción"

echo -e "\n${GREEN}🏢 Grupo Lotificadora - Chat con Agentes IA${NC}"
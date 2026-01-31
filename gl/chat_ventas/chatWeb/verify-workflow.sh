#!/bin/bash

# Script para verificar estado del workflow GL en n8n

echo "🔍 VERIFICANDO WORKFLOW GRUPO LOTIFICADORA"
echo "==========================================="

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Verificar n8n está corriendo
echo -e "\n${YELLOW}1. Verificando n8n...${NC}"
if curl -s --max-time 3 http://localhost:5678 > /dev/null; then
    echo -e "${GREEN}✅ n8n está corriendo${NC}"
else
    echo -e "${RED}❌ n8n no está corriendo${NC}"
    echo "🚀 Inicia n8n con: npx n8n"
    exit 1
fi

# 2. Verificar workflow está importado
echo -e "\n${YELLOW}2. Verificando workflow GL...${NC}"
if [ -f "chat.json" ]; then
    echo -e "${GREEN}✅ Archivo chat.json encontrado${NC}"
else
    echo -e "${RED}❌ chat.json no encontrado${NC}"
    exit 1
fi

# 3. Probar webhook con datos detallados
echo -e "\n${YELLOW}3. Probando webhook con datos de GL...${NC}"
response=$(curl -s -X POST http://localhost:5678/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hola quiero información de terrenos","sessionId":"test-verification","attachments":[]}')

if [ -z "$response" ]; then
    echo -e "${RED}❌ El webhook no devolvió respuesta - EL CHAT ESTARÁ INACTIVO${NC}"
    echo -e "${RED}🚨 ACCIÓN CRÍTICA REQUERIDA: Importa el workflow en n8n:${NC}"
    echo "   1. Abre http://localhost:5678"
    echo "   2. Click 'Import from file'"
    echo "   3. Selecciona 'chat.json'"
    echo "   4. Activa el workflow (toggle en esquina superior derecha)"
    echo -e "\n${RED}⚠️  EL CHAT NO FUNCIONARÁ HASTA COMPLETAR ESTOS PASOS${NC}"
else
    echo -e "${GREEN}✅ Respuesta del webhook: ${NC}"
    echo "$response" | jq . 2>/dev/null || echo "$response"
    
    # Verificar si la respuesta tiene formato correcto
    if echo "$response" | grep -q "text"; then
        echo -e "${GREEN}✅ Formato de respuesta correcto${NC}"
        echo -e "${GREEN}🎉 ¡SISTEMA LISTO PARA USAR!${NC}"
    else
        echo -e "${RED}❌ Respuesta sin formato esperado - CONFIGURACIÓN INCOMPLETA${NC}"
    fi
fi

# 4. Verificar workflow activo (si hay API de n8n disponible)
echo -e "\n${YELLOW}4. Verificando si workflow está activo...${NC}"
workflows=$(curl -s http://localhost:5678/api/v1/workflows 2>/dev/null)

if echo "$workflows" | grep -q "Chat GL"; then
    echo -e "${GREEN}✅ Workflow 'Chat GL' encontrado${NC}"
    
    if echo "$workflows" | grep -q '"active":true'; then
        echo -e "${GREEN}✅ Workflow está activo${NC}"
    else
        echo -e "${YELLOW}⚠️  Workflow encontrado pero no está activo${NC}"
        echo "🔧 Activa el workflow en el editor de n8n"
    fi
else
    echo -e "${YELLOW}⚠️  No se encontró workflow 'Chat GL'${NC}"
    echo "🔧 Importa el workflow desde chat.json"
fi

# 5. Instrucciones finales
echo -e "\n${GREEN}📋 RESUMEN${NC}"
echo "============"
echo -e "${GREEN}✅ n8n: ${NC}corriendo"
echo -e "${GREEN}✅ chat.json: ${NC}disponible"

if echo "$workflows" | grep -q "Chat GL.*active.*true"; then
    echo -e "${GREEN}✅ Workflow: ${NC}activo y listo"
    echo -e "\n🏢 Chat GL listo para usar en http://localhost:3000"
else
    echo -e "${YELLOW}⚠️  Workflow: ${NC}requiere configuración"
    echo -e "\n${YELLOW}🔧 PASOS PARA COMPLETAR:${NC}"
    echo "1. Abre: http://localhost:5678"
    echo "2. Importa: chat.json"
    echo "3. Activa: Toggle en esquina superior derecha"
    echo "4. Verifica: Credenciales (Google, Groq, Email)"
    echo "5. Prueba: 'Hola quiero terrenos'"
fi
#!/bin/bash

# Script de diagnóstico detallado para workflow GL

echo "🔍 DIAGNÓSTICO DETALLADO - WORKFLOW CHAT GL"
echo "=============================================="

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "\n${YELLOW}1. Probando webhook con diferentes datos...${NC}"

# Test 1: Mensaje simple
echo -e "\n${BLUE}📤 Test 1: Mensaje simple${NC}"
test1=$(curl -s -X POST http://localhost:5678/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hola","sessionId":"test1","attachments":[]}')
echo "Respuesta: ${test1:-'(vacía)'}"

# Test 2: Mensaje de ventas
echo -e "\n${BLUE}📤 Test 2: Mensaje de ventas${NC}"
test2=$(curl -s -X POST http://localhost:5678/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"quiero un terreno","sessionId":"test2","attachments":[]}')
echo "Respuesta: ${test2:-'(vacía)'}"

# Test 3: Mensaje de cita
echo -e "\n${BLUE}📤 Test 3: Mensaje de cita${NC}"
test3=$(curl -s -X POST http://localhost:5678/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"quiero agendar cita","sessionId":"test3","attachments":[]}')
echo "Respuesta: ${test3:-'(vacía)'}"

# Análisis de respuestas
echo -e "\n${YELLOW}2. Análisis de respuestas:${NC}"
responses=("$test1" "$test2" "$test3")
valid_count=0

for i in "${!responses[@]}"; do
  response="${responses[$i]}"
  test_num=$((i+1))
  
  if [ -z "$response" ] || [ "$response" = "" ] || [ "$response" = "null" ] || [ "$response" = "{}" ] || [ "$response" = "[]" ]; then
    echo -e "${RED}❌ Test $test_num: Respuesta vacía${NC}"
  elif echo "$response" | grep -q "text"; then
    echo -e "${GREEN}✅ Test $test_num: Formato correcto${NC}"
    valid_count=$((valid_count+1))
  else
    echo -e "${YELLOW}⚠️  Test $test_num: Formato desconocido${NC}"
    echo "   Contenido: $response"
  fi
done

# Diagnóstico final
echo -e "\n${YELLOW}3. Diagnóstico final:${NC}"
if [ $valid_count -eq 3 ]; then
    echo -e "${GREEN}🎉 ¡TODOS LOS TESTS PASARON!${NC}"
    echo -e "${GREEN}✅ El workflow está funcionando correctamente${NC}"
    echo -e "${GREEN}🏢 Chat GL listo para uso${NC}"
    exit 0
elif [ $valid_count -gt 0 ]; then
    echo -e "${YELLOW}⚠️  FUNCIONAMIENTO PARCIAL${NC}"
    echo -e "${YELLOW}✅ $valid_count/3 tests funcionaron${NC}"
    echo -e "${YELLOW}🔧 Revisa las credenciales de los agentes que fallan${NC}"
else
    echo -e "${RED}❌ NINGUNO DE LOS TESTS FUNCIONÓ${NC}"
    echo -e "${RED}🚨 WORKFLOW NO CONFIGURADO O CON ERRORES${NC}"
fi

echo -e "\n${BLUE}📋 ACCIONES RECOMENDADAS:${NC}"
echo -e "${BLUE}1. En n8n (http://localhost:5678):${NC}"
echo "   • Ve a la pestaña 'Executions'"
echo "   • Busca ejecuciones recientes del workflow Chat GL"
echo "   • Revisa si hay errores en rojo"
echo ""
echo -e "${BLUE}2. Si hay errores:${NC}"
echo "   • Clic en la ejecución con error"
echo "   • Revisa qué nodo está fallando"
echo "   • Configura las credenciales faltantes:"
echo "     - Google Calendar OAuth2"
echo "     - Google Sheets OAuth2"
echo "     - Groq API Key"
echo "     - SMTP credentials"
echo ""
echo -e "${BLUE}3. Si no hay ejecuciones:${NC}"
echo "   • El workflow no está activo (toggle debe estar VERDE)"
echo "   • Importa nuevamente el workflow chat.json"
echo ""
echo -e "${BLUE}4. Para probar manualmente:${NC}"
echo "   • En el editor, clic en 'Execute workflow'"
echo "   • Envía un test message"
echo "   • Revisa el output del nodo 'Respuesta Webhook'"

echo -e "\n${GREEN}🏗️  Después de configurar, el chat responderá con:${NC}"
echo "• Agentes de IA inteligentes"
echo "• Información de terrenos real"
echo "• Agendamiento automático de citas"
echo "• Notificaciones por email"
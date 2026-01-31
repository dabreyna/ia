# 📖 Guía Completa del Proyecto Chat Web con n8n

## 🏗️ Arquitectura del Proyecto

### Frontend (Cliente)
- **Tecnologías**: HTML5, CSS3, JavaScript ES6+
- **Comunicación**: WebSocket (Socket.io)
- **Características**: Chat en tiempo real, subir imágenes/audio, grabación de voz

### Backend (Servidor)
- **Tecnologías**: Node.js, Express, Socket.io, Multer
- **Funciones**: Servir archivos estáticos, manejar uploads, comunicación con n8n
- **Puerto**: 3000 (configurable)

### n8n (Workflow Engine)
- **Integración**: HTTP Webhook
- **Función**: Procesar mensajes y generar respuestas
- **Puerto**: 5678 (default)

## 📋 Requisitos Previos

1. **Node.js** v16 o superior
2. **n8n** instalado localmente o Docker
3. **Acceso a micrófono** (para grabación de voz)

## 🚀 Instalación Rápida

### 1. Clonar e instalar dependencias
```bash
cd chatWeb
npm install
```

### 2. Importar el workflow en n8n
1. Abre n8n: http://localhost:5678
2. Click "Import from file" o similar
3. Selecciona `workflowchat.json`
4. Guarda el workflow

### 3. Activar el workflow
1. En el editor de n8n, busca el toggle en esquina superior derecha
2. Activa el workflow (debe decir "Active")

### 4. Iniciar el servidor de chat
```bash
npm start
```

### 5. Probar el chat
- Abre: http://localhost:3000
- Envía mensajes de prueba

## 🔧 Configuración Detallada

### Variables de Entorno
```bash
# Copiar archivo de configuración
cp .env.example .env

# Editar .env si es necesario
nano .env
```

- `N8N_WEBHOOK_URL`: URL del webhook de n8n
- `PORT`: Puerto del servidor (default: 3000)

### Configuración del Webhook en n8n
El workflow incluye configuración automática:
- **Path**: `chat`
- **HTTP Method**: `POST`
- **Response Mode**: `responseNode`

### Configuración de Archivos
- **Uploads**: Se guardan en `/uploads/`
- **Límite**: 10MB por archivo
- **Formatos**: Imágenes (jpg, png, gif) y Audio (mp3, wav, ogg, m4a)

## 🎯 Funcionalidades Implementadas

### ✅ Características del Chat
- [x] Mensajes de texto en tiempo real
- [x] Subida de imágenes
- [x] Subida de archivos de audio
- [x] Grabación de voz desde navegador
- [x] Indicadores de conexión
- [x] Historial de conversación
- [x] Responsive design

### ✅ Características del Backend
- [x] WebSocket para comunicación real-time
- [x] File upload con validación
- [x] Integración con n8n
- [x] Manejo de errores
- [x] Fallback simulación si n8n no disponible

### ✅ Características de n8n
- [x] Procesamiento de mensajes
- [x] Respuestas inteligentes básicas
- [x] Manejo de archivos adjuntos
- [x] Metadata de procesamiento
- [x] Logging de interacciones

## 🛠️ Personalización

### Modificar respuestas en n8n
Edita el nodo "Procesar Mensaje" en el workflow:
```javascript
// Ejemplo de personalización
if (message.toLowerCase().includes('producto')) {
  responseText = 'Puedo ayudarte con información de productos.';
} else if (message.toLowerCase().includes('precio')) {
  responseText = 'Para información de precios, contacta a ventas.';
}
```

### Agregar nueva lógica de negocio
En el nodo "Code" del workflow puedes:
- Conectar a bases de datos
- Llamar a APIs externas
- Usar servicios de IA
- Procesar archivos

### Personalizar interfaz
Edita los archivos CSS en `/public/`:
- `styles.css`: Estilos principales
- `index.html`: Estructura HTML
- `app.js`: Lógica JavaScript

## 🔍 Troubleshooting

### Errores Comunes

#### "Webhook not registered"
- **Solución**: Activa el workflow en n8n (toggle en esquina superior derecha)

#### "n8n no disponible, usando modo simulado"
- **Causa**: n8n no está corriendo o webhook no accesible
- **Solución**: Verifica que n8n esté en http://localhost:5678

#### Archivos no se suben
- **Verifica**: Permisos de carpeta `/uploads/`
- **Límite**: Máximo 10MB por archivo

#### Audio no graba
- **Permisos**: Asegúrate de dar permisos de micrófono al navegador
- **HTTPS**: Requerido en algunos navegadores para grabación

### Logs y Debug

#### Ver logs del servidor
```bash
npm start
# Los mensajes aparecen en tiempo real
```

#### Ver ejecuciones en n8n
1. En n8n, ve a "Executions"
2. Filtra por workflow "Chat Web Workflow"
3. Revisa los datos de entrada/salida

#### Debug del frontend
1. Abre DevTools (F12)
2. Pestaña Console
3. Revisa mensajes de WebSocket y errores

## 🚀 Despliegue en Producción

### Variables de entorno producción
```bash
export NODE_ENV=production
export PORT=3000
export N8N_WEBHOOK_URL=https://tu-n8n.com/webhook/chat
```

### Seguridad adicional
- Configurar CORS específico
- Validar archivos上传
- Implementar rate limiting
- Usar HTTPS

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 Referencias y Recursos

### Documentación
- [n8n Documentation](https://docs.n8n.io/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Express.js Documentation](https://expressjs.com/)

### APIs Útiles
- **N8N**: http://localhost:5678/docs
- **Chat**: http://localhost:3000
- **WebSocket**: ws://localhost:3000

## 🎉 Próximos Pasos

### Mejoras sugeridas
1. **Base de datos**: Guardar historial de conversaciones
2. **Autenticación**: Sistema de usuarios
3. **Integraciones**: WhatsApp, Telegram, Slack
4. **IA/ML**: Integrar servicios como OpenAI, Gemini
5. **Analytics**: Estadísticas de uso
6. **Admin Panel**: Dashboard de gestión

### Extensiones posibles
- Multi-language support
- File sharing entre usuarios
- Video llamadas
- Screen sharing
- Integración con CRM

---

**Creado por**: Daniel - Chat Web Integration Project
**Versión**: 1.0.0
**Última actualización**: 2024-01-30
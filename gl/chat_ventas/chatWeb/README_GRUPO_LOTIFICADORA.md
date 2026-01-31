# 🏢 Chat Web Grupo Lotificadora con n8n

## 📋 Descripción del Proyecto

Sistema de chat web profesional para **Grupo Lotificadora** integrado con agentes de IA inteligentes a través de n8n. El sistema utiliza un workflow avanzado con múltiples agentes especializados en ventas y agendamiento de citas.

## 🏗️ Arquitectura

### Frontend (Chat Web)
- **Tecnologías**: HTML5, CSS3, JavaScript ES6+
- **Funciones**: Chat en tiempo real, upload de archivos, grabación de voz
- **Diseño**: Moderno, responsive, branding corporativo

### Backend (Servidor Node.js)
- **Tecnologías**: Express, Socket.io, Multer
- **Funciones**: Manejo de WebSocket, upload de archivos, integración n8n
- **Puerto**: 3000

### n8n (Workflow Inteligente)
- **Agentes IA**: Asistente General, Agente Ventas, Agente Citas
- **Modelos**: GPT-120b, QWEN3-32b, Llama Scout
- **Integraciones**: Google Calendar, Google Sheets, Email
- **Puerto**: 5678

## 🤖 Workflow de Agentes IA

### Estructura del Workflow
```
Chat Webhook → Preparar Mensaje → Asistente General
                                     ↓
                               AGENTE VENTAS ←→ AGENTE CITAS
                                     ↓
                              Respuesta Webhook
```

### Agentes Especializados

#### 🎯 Asistente General
- **Función**: Recepción y direccionamiento de consultas
- **Modelo**: GPT-120b (Groq)
- **Memoria**: Buffer Window (15 mensajes)
- **Saludo**: Bienvenida profesional y clasificación de intentos

#### 💼 AGENTE VENTAS
- **Función**: Consultas sobre terrenos, precios, servicios
- **Modelo**: QWEN3-32b (Groq)
- **Memoria**: Buffer Window (15 mensajes)
- **Inventario**: Datos completos de terrenos en Mexicali y Los Algodones

#### 📅 AGENTE CITAS
- **Función**: Agendamiento de citas y coordinación
- **Modelo**: Llama Scout (Groq)
- **Memoria**: Buffer Window (25 mensajes)
- **Integraciones**: Google Calendar, Google Sheets, Email

## 🚀 Instalación y Configuración

### 1. Instalación del Chat Web
```bash
cd chatWeb
npm install
```

### 2. Importar Workflow en n8n
1. Abrir n8n: http://localhost:5678
2. Importar archivo: `chat.json`
3. Activar el workflow
4. Verificar credenciales (Google Calendar, Sheets, Email, Groq)

### 3. Configurar Variables de Entorno
```bash
cp .env.example .env
# Editar .env con las URLs correctas
```

### 4. Iniciar Servidor
```bash
npm start
```

### 5. Acceder al Chat
- **URL**: http://localhost:3000
- **Usuarios**: Cliente final y equipo de ventas

## 📊 Características Principales

### ✅ Funcionalidades del Chat
- [x] **Respuestas Inteligentes**: IA con contextos de negocio
- [x] **Clasificación Automática**: Detección de intentos de venta/cita
- [x] **Multimedia**: Imágenes y archivos de audio
- [x] **Grabación de Voz**: Mensajes de voz desde navegador
- [x] **Historial**: Memoria de conversación por sesión
- [x] **Responsive**: Funciona en desktop y móvil

### ✅ Funcionalidades de Negocio
- [x] **Inventario en Tiempo Real**: Datos actualizados de terrenos
- [x] **Precios Dinámicos**: Mensualidades por zona y terreno
- [x] **Calificación de Prospectos**: Preguntas predefinidas
- [x] **Agendamiento Inteligente**: Verificación de disponibilidad
- [x] **Notificaciones Automáticas**: Email de confirmación
- [x] **Registro en CRM**: Google Sheets integrado

### ✅ Integraciones Externas
- [x] **Google Calendar**: Gestión de citas
- [x] **Google Sheets**: Base de datos de clientes
- [x] **Email SMTP**: Notificaciones automáticas
- [x] **Groq API**: Modelos de lenguaje avanzados

## 🏗️ Estructura de Archivos

```
chatWeb/
├── server.js              # Backend mejorado para Grupo Lotificadora
├── package.json           # Dependencias del proyecto
├── .env.example           # Configuración de entorno
├── chat.json             # Workflow de n8n con agentes IA
├── GUIA_COMPLETA.md       # Documentación detallada
├── test-system.sh         # Script de pruebas automatizadas
├── README.md              # Documentación básica
├── uploads/               # Archivos subidos por usuarios
└── public/
    ├── index.html         # Interfaz del chat corporativo
    ├── styles.css         # Estilos branding GL
    └── app.js            # Lógica JavaScript
```

## 🧪 Pruebas y Validación

### Script de Pruebas Automatizadas
```bash
./test-system.sh
```

### Pruebas Manuales
1. **Mensaje de bienvenida**: "hola" → debe responder con saludo corporativo
2. **Consulta de ventas**: "quiero un terreno" → debe invocar al agente ventas
3. **Agendamiento**: "quiero una cita" → debe iniciar proceso de agendamiento
4. **Precios**: "¿cuánto cuesta?" → debe mostrar mensualidades más bajas

## 🔧 Personalización y Mantenimiento

### Modificar Inventarios
Editar el nodo **AGENTE VENTAS** en el workflow n8n:
```javascript
INVENTARIO (úsalo tal cual):
Zona Poniente:
La Gloria: 200 m², desde $4,861/mes. Luz, agua, drenaje.
// ... más terrenos
```

### Ajustar Horarios de Cita
Modificar en el nodo **AGENTE CITAS**:
```javascript
Horario: Lunes a sábado, 08:00 - 18:00 (America/Tijuana, UTC-8).
Cerrado: Domingos.
```

### Actualizar Credenciales
1. **Google Calendar**: Credenciales OAuth2
2. **Google Sheets**: Credenciales OAuth2  
3. **Email**: Configuración SMTP
4. **Groq**: API Key para modelos IA

## 📈 Métricas y Monitoreo

### Indicadores Clave
- **Tasa de respuesta**: % de mensajes respondidos por IA
- **Tiempo de respuesta**: Segundos promedio
- **Conversiones**: Citas agendadas por mes
- **Satisfacción**: Feedback de usuarios

### Logs y Debug
- **Servidor**: Logs en tiempo real en terminal
- **n8n**: Historial de ejecuciones en panel
- **Workflow**: Tracking de decisiones de agentes IA

## 🔒 Seguridad y Privacidad

### Medidas Implementadas
- **Validación de archivos**: Solo imágenes y audio permitidos
- **Límite de tamaño**: 10MB por archivo
- **CORS configurado**: Dominios específicos permitidos
- **Session management**: IDs únicos por sesión

### Recomendaciones Adicionales
- Implementar rate limiting
- Usar HTTPS en producción
- Configurar backup de datos
- Monitorizar accesos no autorizados

## 🚀 Despliegue en Producción

### Variables de Entorno Producción
```bash
NODE_ENV=production
PORT=3000
N8N_WEBHOOK_URL=https://tu-n8n.gl.com/webhook/chat
```

### Consideraciones
- **Dominio propio**: Configurar DNS y SSL
- **Balanceador de carga**: Para alta concurrencia
- **CDN**: Para archivos estáticos
- **Monitoring**: Uptime y performance

## 🎯 Próximas Mejoras

### Desarrollo Futuro
1. **WhatsApp Integration**: Conectar con WhatsApp Business
2. **Voice Recognition**: STT para mensajes de voz
3. **AI Analytics**: Análisis de sentimientos y patrones
4. **Mobile App**: App nativa para iOS/Android
5. **Multi-language**: Soporte para inglés y otros idiomas

### Mejoras Técnicas
1. **Database Integration**: PostgreSQL o MongoDB
2. **Redis Caching**: Para respuestas rápidas
3. **Microservices**: Arquitectura escalable
4. **API Gateway**: Gestión centralizada

---

**Desarrollado para**: Grupo Lotificadora  
**Versión**: 2.0.0 con Agentes IA  
**Última actualización**: 2024-01-30  
**Soporte**: daniel@grupolotificadora.com
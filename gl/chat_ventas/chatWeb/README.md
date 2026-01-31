# Chat con n8n

Aplicación de chat que se conecta a n8n usando el módulo @n8n/chat. Permite enviar y recibir mensajes de texto, imágenes y archivos de audio.

## Características

- ✅ Chat en tiempo real con WebSocket
- ✅ Envío de mensajes de texto
- ✅ Subida de imágenes (JPG, PNG, GIF)
- ✅ Subida de archivos de audio (MP3, WAV, OGG, M4A)
- ✅ Grabación de voz desde el navegador
- ✅ Conexión con n8n vía webhook
- ✅ Interface responsive y moderna

## Instalación

1. Instalar las dependencias:
```bash
npm install
```

2. Configurar la variable de entorno para el webhook de n8n:
```bash
export N8N_WEBHOOK_URL="http://localhost:5678/webhook/chat"
```

3. Iniciar el servidor:
```bash
npm start
```

4. Abrir el navegador en: http://localhost:3000

## Configuración de n8n

### 1. Crear Webhook en n8n

1. En n8n, crear un nuevo workflow
2. Añadir un nodo "Webhook" como trigger
3. Configurar el webhook:
   - Path: `chat`
   - HTTP Method: POST
   - Authentication: None
   - Response Mode: "on received"
   - Options: Habilitar "Response Data" y "Return Binary Data"

4. Guardar y copiar la URL del webhook (ej: http://localhost:5678/webhook/chat)

### 2. Workflow de ejemplo en n8n

```
Webhook → Code → Response
```

**Nodo Code (JavaScript):**
```javascript
// Recibir los datos del chat
const { message, sessionId, attachments } = $input.first().json;

// Procesar el mensaje (aquí puedes agregar lógica de IA, DB, etc.)
let responseText = `Recibí tu mensaje: "${message}"`;

if (attachments && attachments.length > 0) {
  responseText += ` y ${attachments.length} archivo(s) adjunto(s)`;
}

// Respuesta simple
return [{
  json: {
    text: responseText,
    sessionId: sessionId
  }
}];
```

**Nodo Response:**
- Respond with: "JSON"
- Response Body: `{{ $json }}`

## Variables de Entorno

- `N8N_WEBHOOK_URL`: URL del webhook de n8n (default: http://localhost:5678/webhook/chat)
- `PORT`: Puerto del servidor (default: 3000)

## Estructura del Proyecto

```
chatWeb/
├── server.js              # Servidor Express con WebSocket
├── public/
│   ├── index.html        # Interfaz del chat
│   ├── styles.css        # Estilos CSS
│   └── app.js           # Lógica del cliente JavaScript
├── uploads/              # Directorio para archivos subidos
├── package.json
└── README.md
```

## API Endpoints

### POST /upload
Sube archivos de imagen o audio.

**Request:** multipart/form-data con campo `file`

**Response:**
```json
{
  "filename": "timestamp-original-name",
  "originalName": "original-name",
  "mimetype": "image/jpeg",
  "size": 1024000,
  "url": "/uploads/timestamp-original-name"
}
```

### WebSocket Events

#### Client → Server

- `message`: Envía un mensaje de texto
  ```json
  {
    "message": "Hola mundo",
    "sessionId": "session-123"
  }
  ```

- `file`: Envía un archivo
  ```json
  {
    "message": "Descripción del archivo",
    "sessionId": "session-123",
    "attachments": [fileObject]
  }
  ```

#### Server → Client

- `message`: Recibe respuesta
  ```json
  {
    "type": "response",
    "content": "Respuesta del bot",
    "attachments": [],
    "timestamp": "2024-01-01T12:00:00Z"
  }
  ```

- `error`: Error del servidor
  ```json
  {
    "message": "Error description",
    "error": "detailed error"
  }
  ```

## Uso

1. Abrir http://localhost:3000 en el navegador
2. Escribir mensajes en el campo de texto y presionar Enter o clic en "Enviar"
3. Para enviar imágenes: clic en el botón 📎 y seleccionar el archivo
4. Para grabar audio: clic en el botón 🎤, habla y vuelve a clic para detener
5. Los mensajes se envían automáticamente a n8n para procesamiento

## Notas

- Los archivos se guardan en la carpeta `uploads/` del servidor
- El límite de tamaño de archivos es 10MB
- La conexión WebSocket maneja reconexiones automáticas
- La interfaz es responsive y funciona en móviles

## Troubleshooting

### Error de conexión con n8n
- Verifica que n8n esté corriendo
- Confirma la URL del webhook
- Revisa que el firewall no bloquee la conexión

### Archivos no se suben
- Verifica que el directorio `uploads/` tenga permisos de escritura
- Confirma que el tipo de archivo sea permitido (imagen o audio)

### Audio no graba
- Asegúrate de dar permisos de micrófono al navegador
- Revisa la consola del navegador para errores